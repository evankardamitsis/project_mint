-- Project Mint — Row Level Security (production-minded).
-- Helpers use SECURITY DEFINER + locked search_path so policies can read role/ownership
-- without recursive RLS on profiles.

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER; safe reads; no dependency on caller RLS)
-- ---------------------------------------------------------------------------

comment on schema public is
  'RLS helpers: grant execute to anon + authenticated so policy expressions can evaluate.';

create or replace function public.current_profile_id ()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid();
$$;

create or replace function public.is_admin ()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'::public.user_role
  );
$$;

create or replace function public.is_seller_profile_owner (seller_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.seller_profiles sp
    where sp.id = seller_profile_id
      and sp.user_id = auth.uid()
  );
$$;

create or replace function public.listing_owned_by_auth_user (p_listing_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.listings l
    join public.seller_profiles sp on sp.id = l.seller_id
    where l.id = p_listing_id
      and sp.user_id = auth.uid()
  );
$$;

create or replace function public.listing_is_publicly_visible (p_listing_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.listings l
    where l.id = p_listing_id
      and l.status = 'active'::public.listing_status
  );
$$;

create or replace function public.profile_is_order_party (p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    where o.id = p_order_id
      and (
        o.buyer_id = auth.uid()
        or exists (
          select 1
          from public.seller_profiles sp
          where sp.id = o.seller_id
            and sp.user_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.profile_is_dispute_party (p_dispute_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.disputes d
    join public.orders o on o.id = d.order_id
    where d.id = p_dispute_id
      and (
        o.buyer_id = auth.uid()
        or exists (
          select 1
          from public.seller_profiles sp
          where sp.id = o.seller_id
            and sp.user_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.protected_delivery_check_order_id (p_check_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select c.order_id
  from public.protected_delivery_checks c
  where c.id = p_check_id;
$$;

revoke all on function public.current_profile_id () from public;
revoke all on function public.is_admin () from public;
revoke all on function public.is_seller_profile_owner (uuid) from public;
revoke all on function public.listing_owned_by_auth_user (uuid) from public;
revoke all on function public.listing_is_publicly_visible (uuid) from public;
revoke all on function public.profile_is_order_party (uuid) from public;
revoke all on function public.profile_is_dispute_party (uuid) from public;
revoke all on function public.protected_delivery_check_order_id (uuid) from public;

grant execute on function public.current_profile_id () to anon, authenticated, service_role;
grant execute on function public.is_admin () to anon, authenticated, service_role;
grant execute on function public.is_seller_profile_owner (uuid) to anon, authenticated, service_role;
grant execute on function public.listing_owned_by_auth_user (uuid) to anon, authenticated, service_role;
grant execute on function public.listing_is_publicly_visible (uuid) to anon, authenticated, service_role;
grant execute on function public.profile_is_order_party (uuid) to anon, authenticated, service_role;
grant execute on function public.profile_is_dispute_party (uuid) to anon, authenticated, service_role;
grant execute on function public.protected_delivery_check_order_id (uuid) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- profiles: self read/write; admin full; role changes admin-only (trigger)
-- ---------------------------------------------------------------------------

create or replace function public.enforce_profile_role_change ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and not public.is_admin() then
    raise exception 'Changing profiles.role requires admin privileges';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_enforce_role_change on public.profiles;

create trigger profiles_enforce_role_change
before update of role on public.profiles
for each row
when (old.role is distinct from new.role)
execute procedure public.enforce_profile_role_change ();

alter table public.profiles enable row level security;

comment on table public.profiles is
  'RLS: users see/update self; admins see/update all; inserts via auth trigger (service definer); role guarded by trigger.';

create policy "profiles_select_own_or_admin"
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
  );

create policy "profiles_update_own_or_admin"
  on public.profiles
  for update
  to authenticated
  using (
    id = auth.uid()
    or public.is_admin()
  )
  with check (
    id = auth.uid()
    or public.is_admin()
  );

create policy "profiles_delete_admin"
  on public.profiles
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- seller_profiles: public read verified; owner + admin manage
-- ---------------------------------------------------------------------------

alter table public.seller_profiles enable row level security;

comment on table public.seller_profiles is
  'RLS: verified rows readable by anyone; owners and admins read/write; no broad public writes.';

create policy "seller_profiles_select_public_verified_or_owner_or_admin"
  on public.seller_profiles
  for select
  to anon, authenticated
  using (
    verification_status = 'verified'::public.seller_verification_status
    or user_id = auth.uid()
    or public.is_admin()
  );

create policy "seller_profiles_insert_owner_or_admin"
  on public.seller_profiles
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    or public.is_admin()
  );

create policy "seller_profiles_update_owner_or_admin"
  on public.seller_profiles
  for update
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
  )
  with check (
    user_id = auth.uid()
    or public.is_admin()
  );

create policy "seller_profiles_delete_admin"
  on public.seller_profiles
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- categories / brands: world read; admin writes
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;

comment on table public.categories is
  'RLS: public read; catalog mutations admin-only.';

create policy "categories_select_all"
  on public.categories
  for select
  to anon, authenticated
  using (true);

create policy "categories_write_admin"
  on public.categories
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter table public.brands enable row level security;

comment on table public.brands is
  'RLS: public read; catalog mutations admin-only.';

create policy "brands_select_all"
  on public.brands
  for select
  to anon, authenticated
  using (true);

create policy "brands_write_admin"
  on public.brands
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- listings: public active; seller full own (no mutate sold); admin all
-- ---------------------------------------------------------------------------

alter table public.listings enable row level security;

comment on table public.listings is
  'RLS: active listings public read; sellers see/manage own non-sold rows; admins all; checkout sets sold via service role.';

create policy "listings_select_marketplace_or_owner_or_admin"
  on public.listings
  for select
  to anon, authenticated
  using (
    status = 'active'::public.listing_status
    or public.is_admin()
    or (
      auth.uid() is not null
      and public.listing_owned_by_auth_user (id)
    )
  );

create policy "listings_insert_seller_or_admin"
  on public.listings
  for insert
  to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.seller_profiles sp
      where sp.id = seller_id
        and sp.user_id = auth.uid()
    )
  );

create policy "listings_update_owner_or_admin"
  on public.listings
  for update
  to authenticated
  using (
    public.is_admin()
    or (
      public.listing_owned_by_auth_user (id)
      and status is distinct from 'sold'::public.listing_status
    )
  )
  with check (
    public.is_admin()
    or (
      public.listing_owned_by_auth_user (id)
      and status is distinct from 'sold'::public.listing_status
    )
  );

create policy "listings_delete_owner_or_admin"
  on public.listings
  for delete
  to authenticated
  using (
    public.is_admin()
    or (
      public.listing_owned_by_auth_user (id)
      and status is distinct from 'sold'::public.listing_status
    )
  );

-- ---------------------------------------------------------------------------
-- listing_images: public for active listing media; seller + admin manage
-- ---------------------------------------------------------------------------

alter table public.listing_images enable row level security;

comment on table public.listing_images is
  'RLS: images for active listings are readable; sellers manage own listing images; admins all.';

create policy "listing_images_select_visible"
  on public.listing_images
  for select
  to anon, authenticated
  using (
    public.is_admin()
    or public.listing_is_publicly_visible (listing_id)
    or public.listing_owned_by_auth_user (listing_id)
  );

create policy "listing_images_write_owner_or_admin"
  on public.listing_images
  for insert
  to authenticated
  with check (
    public.is_admin()
    or public.listing_owned_by_auth_user (listing_id)
  );

create policy "listing_images_update_owner_or_admin"
  on public.listing_images
  for update
  to authenticated
  using (
    public.is_admin()
    or public.listing_owned_by_auth_user (listing_id)
  )
  with check (
    public.is_admin()
    or public.listing_owned_by_auth_user (listing_id)
  );

create policy "listing_images_delete_owner_or_admin"
  on public.listing_images
  for delete
  to authenticated
  using (
    public.is_admin()
    or public.listing_owned_by_auth_user (listing_id)
  );

-- ---------------------------------------------------------------------------
-- favorites: per-user; admin oversight
-- ---------------------------------------------------------------------------

alter table public.favorites enable row level security;

comment on table public.favorites is
  'RLS: users manage own favorites on listings they can see (active or own seller listing); admin all.';

create policy "favorites_select_own_or_admin"
  on public.favorites
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
  );

create policy "favorites_insert_own_visible_listing"
  on public.favorites
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (
      public.is_admin()
      or public.listing_is_publicly_visible (listing_id)
      or public.listing_owned_by_auth_user (listing_id)
    )
  );

create policy "favorites_delete_own_or_admin"
  on public.favorites
  for delete
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- offers: buyer/seller negotiation; admin all; insert rules prevent self-dealing
-- ---------------------------------------------------------------------------

alter table public.offers enable row level security;

comment on table public.offers is
  'RLS: buyers create/read/update own pending/countered offers; sellers read/update offers on their listings; admins all.';

create policy "offers_select_party_or_admin"
  on public.offers
  for select
  to authenticated
  using (
    public.is_admin()
    or buyer_id = auth.uid()
    or exists (
      select 1
      from public.listings l
      join public.seller_profiles sp on sp.id = l.seller_id
      where l.id = offers.listing_id
        and sp.user_id = auth.uid()
    )
  );

create policy "offers_insert_buyer_rules"
  on public.offers
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      buyer_id = auth.uid()
      and exists (
        select 1
        from public.listings l
        where l.id = listing_id
          and l.seller_id = seller_id
          and exists (
            select 1
            from public.seller_profiles sp
            where sp.id = l.seller_id
              and sp.user_id is distinct from auth.uid()
          )
      )
    )
  );

-- Buyer may respond while pending/countered; may withdraw to cancelled. Seller may accept/reject/counter.
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
      and status in (
        'pending'::public.offer_status,
        'countered'::public.offer_status,
        'cancelled'::public.offer_status
      )
    )
  );

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
        'rejected'::public.offer_status
      )
    )
  );

create policy "offers_delete_admin"
  on public.offers
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- orders: parties read; mutations admin-only (checkout via service role)
-- ---------------------------------------------------------------------------

alter table public.orders enable row level security;

comment on table public.orders is
  'RLS: buyer and seller read their orders; inserts/updates/deletes restricted to admins (real checkout uses service_role).';

create policy "orders_select_party_or_admin"
  on public.orders
  for select
  to authenticated
  using (
    public.is_admin()
    or buyer_id = auth.uid()
    or public.is_seller_profile_owner (seller_id)
  );

create policy "orders_write_admin"
  on public.orders
  for insert
  to authenticated
  with check (public.is_admin());

create policy "orders_update_admin"
  on public.orders
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "orders_delete_admin"
  on public.orders
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- protected_delivery_checks: parties read; seller + admin update; admin insert
-- ---------------------------------------------------------------------------

alter table public.protected_delivery_checks enable row level security;

comment on table public.protected_delivery_checks is
  'RLS: buyer+seller read; seller updates checklist; rows created by trusted server (admin insert policy).';

create policy "protected_delivery_checks_select_party_or_admin"
  on public.protected_delivery_checks
  for select
  to authenticated
  using (
    public.is_admin()
    or public.profile_is_order_party (order_id)
  );

create policy "protected_delivery_checks_insert_admin"
  on public.protected_delivery_checks
  for insert
  to authenticated
  with check (public.is_admin());

create policy "protected_delivery_checks_update_seller_or_admin"
  on public.protected_delivery_checks
  for update
  to authenticated
  using (
    public.is_admin()
    or (
      public.profile_is_order_party (order_id)
      and exists (
        select 1
        from public.orders o
        where o.id = order_id
          and public.is_seller_profile_owner (o.seller_id)
      )
    )
  )
  with check (
    public.is_admin()
    or (
      public.profile_is_order_party (order_id)
      and exists (
        select 1
        from public.orders o
        where o.id = order_id
          and public.is_seller_profile_owner (o.seller_id)
      )
    )
  );

create policy "protected_delivery_checks_delete_admin"
  on public.protected_delivery_checks
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- protected_delivery_assets: parties read; seller insert; admin all writes
-- ---------------------------------------------------------------------------

alter table public.protected_delivery_assets enable row level security;

comment on table public.protected_delivery_assets is
  'RLS: order parties read evidence; seller uploads for their orders; admin full control.';

create policy "protected_delivery_assets_select_party_or_admin"
  on public.protected_delivery_assets
  for select
  to authenticated
  using (
    public.is_admin()
    or public.profile_is_order_party (
      public.protected_delivery_check_order_id (check_id)
    )
  );

create policy "protected_delivery_assets_insert_seller_or_admin"
  on public.protected_delivery_assets
  for insert
  to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.protected_delivery_checks c
      join public.orders o on o.id = c.order_id
      where c.id = check_id
        and public.is_seller_profile_owner (o.seller_id)
    )
  );

create policy "protected_delivery_assets_update_admin"
  on public.protected_delivery_assets
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "protected_delivery_assets_delete_admin"
  on public.protected_delivery_assets
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- shipments: buyer read; seller read/write; admin all
-- ---------------------------------------------------------------------------

alter table public.shipments enable row level security;

comment on table public.shipments is
  'RLS: buyer reads tracking; seller maintains tracking; admin full; inserts for sellers on their orders.';

create policy "shipments_select_party_or_admin"
  on public.shipments
  for select
  to authenticated
  using (
    public.is_admin()
    or public.profile_is_order_party (order_id)
  );

create policy "shipments_insert_seller_or_admin"
  on public.shipments
  for insert
  to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.orders o
      where o.id = order_id
        and public.is_seller_profile_owner (o.seller_id)
    )
  );

create policy "shipments_update_seller_or_admin"
  on public.shipments
  for update
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.orders o
      where o.id = order_id
        and public.is_seller_profile_owner (o.seller_id)
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
      from public.orders o
      where o.id = order_id
        and public.is_seller_profile_owner (o.seller_id)
    )
  );

create policy "shipments_delete_admin"
  on public.shipments
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- disputes: parties read/insert; admin manages lifecycle
-- ---------------------------------------------------------------------------

alter table public.disputes enable row level security;

comment on table public.disputes is
  'RLS: buyers/sellers on the order can read and open disputes; resolution stays admin-only.';

create policy "disputes_select_party_or_admin"
  on public.disputes
  for select
  to authenticated
  using (
    public.is_admin()
    or public.profile_is_order_party (order_id)
  );

create policy "disputes_insert_party_opened_by_self"
  on public.disputes
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      opened_by = auth.uid()
      and public.profile_is_order_party (order_id)
    )
  );

create policy "disputes_update_admin"
  on public.disputes
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "disputes_delete_admin"
  on public.disputes
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- dispute_assets: parties read/insert evidence; admin manages
-- ---------------------------------------------------------------------------

alter table public.dispute_assets enable row level security;

comment on table public.dispute_assets is
  'RLS: dispute parties attach evidence; mutations beyond insert are admin-only.';

create policy "dispute_assets_select_party_or_admin"
  on public.dispute_assets
  for select
  to authenticated
  using (
    public.is_admin()
    or public.profile_is_dispute_party (dispute_id)
  );

create policy "dispute_assets_insert_party_or_admin"
  on public.dispute_assets
  for insert
  to authenticated
  with check (
    public.is_admin()
    or public.profile_is_dispute_party (dispute_id)
  );

create policy "dispute_assets_update_admin"
  on public.dispute_assets
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "dispute_assets_delete_admin"
  on public.dispute_assets
  for delete
  to authenticated
  using (public.is_admin());
