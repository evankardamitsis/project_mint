-- Watchlist: block favoriting own listings; aggregate watcher counts for sellers (no identities exposed).

-- Tighten favorites insert: cannot save your own listing (admins included for marketplace consistency).
drop policy if exists "favorites_insert_own_visible_listing" on public.favorites;

create policy "favorites_insert_own_visible_listing"
  on public.favorites
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and not public.listing_owned_by_auth_user (listing_id)
    and (
      public.is_admin()
      or public.listing_is_publicly_visible(listing_id)
    )
  );

comment on policy "favorites_insert_own_visible_listing" on public.favorites is
  'Insert own favorite row only for publicly active listings the user does not own.';

-- Count favorites for one listing; only listing seller or admin may call (returns NULL if unauthorized).
create or replace function public.listing_watcher_count (p_listing_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.is_admin() then (
      select count(*)::bigint
      from public.favorites f
      where f.listing_id = p_listing_id
    )
    when exists (
      select 1
      from public.listings l
      join public.seller_profiles sp on sp.id = l.seller_id
      where l.id = p_listing_id
        and sp.user_id = auth.uid()
    ) then (
      select count(*)::bigint
      from public.favorites f
      where f.listing_id = p_listing_id
    )
    else null::bigint
  end;
$$;

comment on function public.listing_watcher_count (uuid) is
  'SECURITY DEFINER: total favorites for a listing. Caller must own the listing or be admin; otherwise NULL.';

-- Batch counts for all listings belonging to the current seller (empty if not a seller).
create or replace function public.seller_listing_watcher_counts ()
returns table (
  listing_id uuid,
  watcher_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    l.id as listing_id,
    (
      select count(*)::bigint
      from public.favorites f
      where f.listing_id = l.id
    ) as watcher_count
  from public.listings l
  join public.seller_profiles sp on sp.id = l.seller_id
  where sp.user_id = auth.uid();
$$;

comment on function public.seller_listing_watcher_counts () is
  'SECURITY DEFINER: watcher totals per listing for the authenticated seller only.';

revoke all on function public.listing_watcher_count (uuid) from public;
revoke all on function public.seller_listing_watcher_counts () from public;

grant execute on function public.listing_watcher_count (uuid) to authenticated;
grant execute on function public.seller_listing_watcher_counts () to authenticated;
