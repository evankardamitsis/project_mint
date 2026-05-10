-- listings INSERT policy used EXISTS over seller_profiles; that subquery ran as
-- the invoker and was subject to seller_profiles RLS. Use a SECURITY DEFINER
-- helper (same pattern as listing_owned_by_auth_user) so ownership is checked
-- reliably while auth.uid() still reflects the caller's JWT.

create or replace function public.listing_auth_user_owns_seller (p_seller_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.seller_profiles sp
    where sp.id = p_seller_id
      and sp.user_id = (select auth.uid())
  );
$$;

revoke all on function public.listing_auth_user_owns_seller (uuid) from public;
grant execute on function public.listing_auth_user_owns_seller (uuid) to anon, authenticated, service_role;

drop policy if exists "listings_insert_seller_or_admin" on public.listings;

create policy "listings_insert_seller_or_admin"
  on public.listings
  for insert
  to authenticated
  with check (
    public.is_admin()
    or public.listing_auth_user_owns_seller (seller_id)
  );
