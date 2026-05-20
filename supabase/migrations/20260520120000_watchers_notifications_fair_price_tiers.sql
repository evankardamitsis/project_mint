-- Notifications, public watcher counts, price-drop alerts, fair-price seed data, seller tiers.
-- Watchers use existing public.favorites (no duplicate watchers table).

-- ---------------------------------------------------------------------------
-- In-app notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (
    type in (
      'price_drop',
      'new_match',
      'offer_received',
      'offer_accepted',
      'offer_rejected',
      'order_update'
    )
  ),
  listing_id uuid references public.listings (id) on delete set null,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own"
  on public.notifications
  for select
  to authenticated
  using (user_id = auth.uid () or public.is_admin ());

create policy "notifications_update_own"
  on public.notifications
  for update
  to authenticated
  using (user_id = auth.uid () or public.is_admin ())
  with check (user_id = auth.uid () or public.is_admin ());

create policy "notifications_delete_own"
  on public.notifications
  for delete
  to authenticated
  using (user_id = auth.uid () or public.is_admin ());

comment on table public.notifications is 'In-app notification inbox per user.';

-- ---------------------------------------------------------------------------
-- Public watcher counts (favorites on active listings)
-- ---------------------------------------------------------------------------
create or replace view public.listing_watcher_counts as
select
  f.listing_id,
  count(*)::bigint as watcher_count
from public.favorites f
inner join public.listings l on l.id = f.listing_id and l.status = 'active'::public.listing_status
group by f.listing_id;

comment on view public.listing_watcher_counts is 'Denormalized favorite counts per active listing.';

grant select on public.listing_watcher_counts to anon, authenticated;

create or replace function public.listing_watcher_count_public (p_listing_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.favorites f
  where f.listing_id = p_listing_id
    and exists (
      select 1
      from public.listings l
      where l.id = p_listing_id
        and l.status = 'active'::public.listing_status
    );
$$;

comment on function public.listing_watcher_count_public (uuid) is
  'SECURITY DEFINER: total favorites for an active listing (public count).';

revoke all on function public.listing_watcher_count_public (uuid) from public;
grant execute on function public.listing_watcher_count_public (uuid) to anon, authenticated;

-- Notify favorites when price drops (history row inserted separately by app).
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
  v_old_euros text;
  v_new_euros text;
begin
  if p_new_price_cents >= p_old_price_cents then
    return;
  end if;

  v_old_euros := trim(to_char(p_old_price_cents / 100.0, '999999990.00'));
  v_new_euros := trim(to_char(p_new_price_cents / 100.0, '999999990.00'));

  insert into public.notifications (user_id, type, listing_id, title, body)
  select
    f.user_id,
    'price_drop',
    p_listing_id,
    'Μείωση τιμής: ' || coalesce(p_listing_title, 'Αγγελία'),
    'Η τιμή μειώθηκε από €' || v_old_euros || ' σε €' || v_new_euros
  from public.favorites f
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
  'SECURITY DEFINER: in-app price_drop notifications for listing favorites (excludes seller).';

revoke all on function public.notify_price_drop (uuid, integer, integer, text) from public;
grant execute on function public.notify_price_drop (uuid, integer, integer, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Sold price reference data (fair price tool)
-- ---------------------------------------------------------------------------
create table if not exists public.sold_price_data (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  condition text not null,
  sold_price numeric(10, 2) not null check (sold_price > 0),
  sold_at timestamptz not null default now()
);

create index if not exists sold_price_data_category_condition_idx
  on public.sold_price_data (category_id, condition, sold_at desc);

alter table public.sold_price_data enable row level security;

create policy "sold_price_data_select_public"
  on public.sold_price_data
  for select
  to anon, authenticated
  using (true);

comment on table public.sold_price_data is 'Reference sold prices for fair-price hints (demo seed + future order backfill).';

-- Demo seed: ~20 rows per category × condition × 5 samples
insert into public.sold_price_data (category_id, condition, sold_price, sold_at)
select
  c.id,
  cond.cond,
  round(
    (
      case c.name
        when 'Electric Guitars' then
          case cond.cond
            when 'new' then 800 + random() * 1200
            when 'excellent' then 400 + random() * 800
            when 'good' then 200 + random() * 400
            else 80 + random() * 200
          end
        when 'Acoustic Guitars' then
          case cond.cond
            when 'new' then 600 + random() * 900
            when 'excellent' then 300 + random() * 600
            when 'good' then 150 + random() * 300
            else 60 + random() * 150
          end
        when 'Amps' then
          case cond.cond
            when 'new' then 500 + random() * 1500
            when 'excellent' then 250 + random() * 750
            when 'good' then 120 + random() * 380
            else 50 + random() * 150
          end
        when 'Synths & Keyboards' then
          case cond.cond
            when 'new' then 700 + random() * 2300
            when 'excellent' then 350 + random() * 1150
            when 'good' then 150 + random() * 600
            else 60 + random() * 200
          end
        when 'Effects & Pedals' then
          case cond.cond
            when 'new' then 100 + random() * 400
            when 'excellent' then 60 + random() * 240
            when 'good' then 30 + random() * 120
            else 15 + random() * 60
          end
        when 'DJ Gear' then
          case cond.cond
            when 'new' then 400 + random() * 2600
            when 'excellent' then 200 + random() * 1300
            when 'good' then 100 + random() * 650
            else 40 + random() * 260
          end
        else 100 + random() * 400
      end
    )::numeric,
    2
  ),
  now() - (random() * interval '180 days')
from public.categories c
cross join (
  values ('new'), ('excellent'), ('good'), ('fair')
) as cond (cond)
cross join generate_series(1, 5) as g (n);

-- ---------------------------------------------------------------------------
-- Seller tiers (on seller_profiles — marketplace seller identity)
-- ---------------------------------------------------------------------------
alter table public.seller_profiles
  add column if not exists seller_tier text not null default 'new'
  check (seller_tier in ('new', 'trusted', 'top'));

comment on column public.seller_profiles.seller_tier is
  'Display tier: new | trusted | top (derived from sales/ratings in app).';

-- Demo: mark up to two sellers as trusted when they have sales history
update public.seller_profiles sp
set
  seller_tier = 'trusted',
  completed_sales_count = greatest(sp.completed_sales_count, 12)
where sp.id in (
  select id
  from public.seller_profiles
  order by created_at
  limit 2
);
