-- Follow listings (Ακολουθώ) + price_history audit + notify followers on price drop.
-- Migrates existing favorites into follows; keeps listing_price_history for browse signals.

-- ---------------------------------------------------------------------------
-- Follows
-- ---------------------------------------------------------------------------
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

create index if not exists follows_user_id_idx on public.follows (user_id);
create index if not exists follows_listing_id_idx on public.follows (listing_id);

alter table public.follows enable row level security;

create policy "follows_select_own_or_admin"
  on public.follows
  for select
  to authenticated
  using (user_id = auth.uid () or public.is_admin ());

create policy "follows_insert_own"
  on public.follows
  for insert
  to authenticated
  with check (
    user_id = auth.uid ()
    and not public.listing_owned_by_auth_user (listing_id)
    and (
      public.is_admin ()
      or public.listing_is_publicly_visible (listing_id)
    )
  );

create policy "follows_delete_own_or_admin"
  on public.follows
  for delete
  to authenticated
  using (user_id = auth.uid () or public.is_admin ());

comment on table public.follows is 'Buyers following listings for price-drop alerts.';

-- Copy legacy favorites into follows (idempotent)
insert into public.follows (user_id, listing_id, created_at)
select f.user_id, f.listing_id, f.created_at
from public.favorites f
on conflict (user_id, listing_id) do nothing;

-- ---------------------------------------------------------------------------
-- Price history (euros) — complements listing_price_history (cents) used in browse
-- ---------------------------------------------------------------------------
create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  old_price numeric(10, 2) not null,
  new_price numeric(10, 2) not null,
  changed_at timestamptz not null default now()
);

create index if not exists price_history_listing_id_idx on public.price_history (listing_id);
create index if not exists price_history_changed_at_idx on public.price_history (changed_at desc);

alter table public.price_history enable row level security;

create policy "price_history_select_public"
  on public.price_history
  for select
  to anon, authenticated
  using (true);

comment on table public.price_history is 'Price changes in EUR for follow alerts and audit.';

-- ---------------------------------------------------------------------------
-- Follow counts + seller batch counts
-- ---------------------------------------------------------------------------
create or replace view public.listing_follow_counts as
select
  f.listing_id,
  count(*)::int as follow_count
from public.follows f
inner join public.listings l on l.id = f.listing_id and l.status = 'active'::public.listing_status
group by f.listing_id;

grant select on public.listing_follow_counts to anon, authenticated;

create or replace function public.listing_follow_count_public (p_listing_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.follows f
  where f.listing_id = p_listing_id
    and exists (
      select 1
      from public.listings l
      where l.id = p_listing_id
        and l.status = 'active'::public.listing_status
    );
$$;

revoke all on function public.listing_follow_count_public (uuid) from public;
grant execute on function public.listing_follow_count_public (uuid) to anon, authenticated;

create or replace function public.seller_listing_follow_counts ()
returns table (
  listing_id uuid,
  follow_count bigint
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
      from public.follows f
      where f.listing_id = l.id
    ) as follow_count
  from public.listings l
  join public.seller_profiles sp on sp.id = l.seller_id
  where sp.user_id = auth.uid ();
$$;

revoke all on function public.seller_listing_follow_counts () from public;
grant execute on function public.seller_listing_follow_counts () to authenticated;

-- Replace watcher view (favorites) with follows-based counts
create or replace view public.listing_watcher_counts as
select listing_id, follow_count::bigint as watcher_count
from public.listing_follow_counts;

-- Notify followers + record EUR price_history (app still writes listing_price_history in cents)
create or replace function public.notify_price_drop (
  p_listing_id uuid,
  p_old_price_cents integer,
  p_new_price_cents integer,
  p_listing_title text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old_euros numeric(10, 2);
  v_new_euros numeric(10, 2);
begin
  if p_new_price_cents >= p_old_price_cents then
    return;
  end if;

  v_old_euros := round(p_old_price_cents / 100.0, 2);
  v_new_euros := round(p_new_price_cents / 100.0, 2);

  insert into public.price_history (listing_id, old_price, new_price)
  values (p_listing_id, v_old_euros, v_new_euros);

  insert into public.notifications (user_id, type, listing_id, title, body)
  select
    f.user_id,
    'price_drop',
    p_listing_id,
    'Μείωση τιμής: ' || coalesce(p_listing_title, 'Αγγελία'),
    'Από €' || v_old_euros::text || ' → €' || v_new_euros::text
  from public.follows f
  where f.listing_id = p_listing_id
    and f.user_id <> (
      select sp.user_id
      from public.listings l
      join public.seller_profiles sp on sp.id = l.seller_id
      where l.id = p_listing_id
    );
end;
$$;

comment on function public.notify_price_drop (uuid, integer, integer, text) is
  'SECURITY DEFINER: EUR price_history row + price_drop notifications for listing followers.';

-- Public count RPC now uses follows
create or replace function public.listing_watcher_count_public (p_listing_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select public.listing_follow_count_public (p_listing_id);
$$;

-- Seller batch counts for hub
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
  select listing_id, follow_count as watcher_count
  from public.seller_listing_follow_counts ();
$$;
