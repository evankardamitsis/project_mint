-- Offers negotiation: accept side-effects, counter inserts, expiry transitions,
-- buyer accept-counter, and read paths for dashboards.

-- ---------------------------------------------------------------------------
-- When an offer becomes accepted: reserve listing (if still active) and expire
-- competing pending/countered offers. SECURITY DEFINER so RLS does not block.
-- ---------------------------------------------------------------------------

create or replace function public.offers_apply_accepted_side_effects ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE'
     and new.status = 'accepted'::public.offer_status
     and (old.status is distinct from new.status) then
    update public.listings
    set
      status = 'reserved'::public.listing_status,
      updated_at = now()
    where id = new.listing_id
      and status = 'active'::public.listing_status;

    update public.offers
    set
      status = 'expired'::public.offer_status,
      updated_at = now()
    where listing_id = new.listing_id
      and id is distinct from new.id
      and status in (
        'pending'::public.offer_status,
        'countered'::public.offer_status
      );
  end if;

  return new;
end;
$$;

comment on function public.offers_apply_accepted_side_effects () is
  'After an offer is marked accepted: reserve listing if active; expire other pending/countered offers on that listing.';

drop trigger if exists offers_apply_accepted_side_effects on public.offers;

create trigger offers_apply_accepted_side_effects
after update of status on public.offers
for each row
when (new.status = 'accepted'::public.offer_status and old.status is distinct from new.status)
execute procedure public.offers_apply_accepted_side_effects ();

-- ---------------------------------------------------------------------------
-- offers: extend buyer/seller update policies (expired + buyer-accept counter)
-- ---------------------------------------------------------------------------

drop policy if exists "offers_update_buyer_pending" on public.offers;

create policy "offers_update_buyer_pending"
  on public.offers
  for update
  to authenticated
  using (
    public.is_admin()
    or (
      buyer_id = auth.uid()
      and status in (
        'pending'::public.offer_status,
        'countered'::public.offer_status
      )
    )
  )
  with check (
    public.is_admin()
    or (
      buyer_id = auth.uid()
      and (
        status in (
          'pending'::public.offer_status,
          'countered'::public.offer_status,
          'cancelled'::public.offer_status,
          'expired'::public.offer_status
        )
        or (
          status = 'accepted'::public.offer_status
          and parent_offer_id is not null
        )
      )
    )
  );

drop policy if exists "offers_update_seller_pending" on public.offers;

create policy "offers_update_seller_pending"
  on public.offers
  for update
  to authenticated
  using (
    public.is_admin()
    or (
      exists (
        select 1
        from public.listings l
        join public.seller_profiles sp on sp.id = l.seller_id
        where l.id = offers.listing_id
          and sp.user_id = auth.uid()
      )
      and status in (
        'pending'::public.offer_status,
        'countered'::public.offer_status
      )
    )
  )
  with check (
    public.is_admin()
    or (
      exists (
        select 1
        from public.listings l
        join public.seller_profiles sp on sp.id = l.seller_id
        where l.id = offers.listing_id
          and sp.user_id = auth.uid()
      )
      and status in (
        'pending'::public.offer_status,
        'countered'::public.offer_status,
        'accepted'::public.offer_status,
        'rejected'::public.offer_status,
        'expired'::public.offer_status
      )
    )
  );

-- Atomic counter: mark parent countered and insert child pending row.
create or replace function public.create_counter_offer (p_parent_id uuid, p_amount_cents integer)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_parent public.offers%rowtype;
  v_listing public.listings%rowtype;
  v_seller_user uuid;
  v_new_id uuid;
begin
  if p_amount_cents is null or p_amount_cents <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;

  select * into strict v_parent
  from public.offers
  where id = p_parent_id;

  if v_parent.status is distinct from 'pending'::public.offer_status then
    raise exception 'OFFER_NOT_PENDING';
  end if;

  if v_parent.expires_at is not null and v_parent.expires_at < now() then
    raise exception 'OFFER_EXPIRED';
  end if;

  select * into strict v_listing
  from public.listings
  where id = v_parent.listing_id;

  if v_listing.status is distinct from 'active'::public.listing_status then
    raise exception 'LISTING_NOT_ACTIVE';
  end if;

  select sp.user_id into strict v_seller_user
  from public.seller_profiles sp
  where sp.id = v_listing.seller_id;

  if v_seller_user is distinct from auth.uid() and not public.is_admin() then
    raise exception 'FORBIDDEN';
  end if;

  update public.offers
  set
    status = 'countered'::public.offer_status,
    updated_at = now()
  where id = p_parent_id;

  insert into public.offers (
    listing_id,
    buyer_id,
    seller_id,
    amount_cents,
    status,
    parent_offer_id,
    expires_at
  )
  values (
    v_parent.listing_id,
    v_parent.buyer_id,
    v_parent.seller_id,
    p_amount_cents,
    'pending'::public.offer_status,
    p_parent_id,
    now() + interval '48 hours'
  )
  returning id into v_new_id;

  return v_new_id;
end;
$$;

comment on function public.create_counter_offer (uuid, integer) is
  'Listing seller (or admin): counter a pending buyer offer; parent becomes countered, child pending with new amount.';

revoke all on function public.create_counter_offer (uuid, integer) from public;
grant execute on function public.create_counter_offer (uuid, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- listings: buyers (and parties) can read listings they have an offer on
-- (needed when listing moves to reserved after acceptance).
-- ---------------------------------------------------------------------------

create policy "listings_select_if_party_has_offer"
  on public.listings
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.offers o
      where o.listing_id = listings.id
        and o.buyer_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- profiles: sellers can read buyer profiles for offers on their listings
-- ---------------------------------------------------------------------------

create policy "profiles_select_buyer_on_seller_listing_offer"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.offers o
      join public.listings l on l.id = o.listing_id
      join public.seller_profiles sp on sp.id = l.seller_id
      where o.buyer_id = profiles.id
        and sp.user_id = auth.uid()
    )
  );
