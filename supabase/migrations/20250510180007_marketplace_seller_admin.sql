-- Marketplace layer: listing moderation fields, safer seller deletes, slug RPC
-- exclude id for edits, and seller_profiles status guard.

alter table public.listings
  add column if not exists rejection_reason text;

comment on column public.listings.rejection_reason is
  'Optional admin note when status is rejected.';

-- ---------------------------------------------------------------------------
-- listing_slug_taken: optional listing to exclude (edit same slug)
-- ---------------------------------------------------------------------------

drop function if exists public.listing_slug_taken (text);

create or replace function public.listing_slug_taken (
  p_slug text,
  p_exclude_listing_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.listings l
    where l.slug = p_slug
      and (p_exclude_listing_id is null or l.id <> p_exclude_listing_id)
  );
$$;

revoke all on function public.listing_slug_taken (text, uuid) from public;
grant execute on function public.listing_slug_taken (text, uuid) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- listings delete: sellers may delete only draft / pending_review / rejected / archived
-- ---------------------------------------------------------------------------

drop policy if exists "listings_delete_owner_or_admin" on public.listings;

create policy "listings_delete_owner_or_admin"
  on public.listings
  for delete
  to authenticated
  using (
    (
      public.is_admin()
      and status is distinct from 'sold'::public.listing_status
    )
    or (
      public.listing_owned_by_auth_user (id)
      and status in (
        'draft'::public.listing_status,
        'pending_review'::public.listing_status,
        'rejected'::public.listing_status,
        'archived'::public.listing_status
      )
    )
  );

-- ---------------------------------------------------------------------------
-- Block sellers from changing verification / payout status (admins unrestricted)
-- ---------------------------------------------------------------------------

create or replace function public.seller_profiles_enforce_status_immutable_for_owner ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if new.verification_status is distinct from old.verification_status then
    raise exception 'verification_status cannot be changed by non-admin';
  end if;
  if new.payout_status is distinct from old.payout_status then
    raise exception 'payout_status cannot be changed by non-admin';
  end if;
  return new;
end;
$$;

drop trigger if exists seller_profiles_enforce_status_immutable on public.seller_profiles;

create trigger seller_profiles_enforce_status_immutable
before update on public.seller_profiles
for each row
execute procedure public.seller_profiles_enforce_status_immutable_for_owner ();
