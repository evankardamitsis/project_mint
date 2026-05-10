-- Harden listing insert ownership check: auth.uid() can be null in some PostgREST
-- contexts while JWT claims are still present. Align with auth.jwt() ->> 'sub'.

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
      and (
        sp.user_id = (select auth.uid())
        or sp.user_id = (
          select (nullif(trim(coalesce(auth.jwt() ->> 'sub', '')), ''))::uuid
        )
      )
  );
$$;

revoke all on function public.listing_auth_user_owns_seller (uuid) from public;
grant execute on function public.listing_auth_user_owns_seller (uuid) to anon, authenticated, service_role;

-- Ensure insert policy uses the helper (covers DBs that never ran 20250510180005).
drop policy if exists "listings_insert_seller_or_admin" on public.listings;

create policy "listings_insert_seller_or_admin"
  on public.listings
  for insert
  to authenticated
  with check (
    public.is_admin()
    or public.listing_auth_user_owns_seller (seller_id)
  );
