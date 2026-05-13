-- Price change audit + price-drop signals (notifications_sent_at reserved for future delivery).

create table public.listing_price_history (
  id uuid primary key default gen_random_uuid (),
  listing_id uuid not null references public.listings (id) on delete cascade,
  old_price_cents integer not null check (old_price_cents >= 0),
  new_price_cents integer not null check (new_price_cents >= 0),
  change_percent numeric,
  changed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  notifications_sent_at timestamptz null
);

comment on table public.listing_price_history is
  'Append-only listing price changes; public read limited to active listings; sellers read own; inserts via trusted seller/admin actions.';

create index listing_price_history_listing_id_idx on public.listing_price_history (listing_id);
create index listing_price_history_created_at_idx on public.listing_price_history (created_at desc);
create index listing_price_history_new_price_cents_idx on public.listing_price_history (new_price_cents);
create index listing_price_history_change_percent_idx on public.listing_price_history (change_percent);

alter table public.listing_price_history enable row level security;

create policy "listing_price_history_select_policy"
  on public.listing_price_history
  for select
  to anon, authenticated
  using (
    public.is_admin ()
    or public.listing_owned_by_auth_user (listing_id)
    or exists (
      select 1
      from public.listings l
      where l.id = listing_id
        and l.status = 'active'::public.listing_status
    )
  );

create policy "listing_price_history_insert_policy"
  on public.listing_price_history
  for insert
  to authenticated
  with check (
    public.is_admin ()
    or public.listing_owned_by_auth_user (listing_id)
  );

comment on policy "listing_price_history_select_policy" on public.listing_price_history is
  'Read: admin all; seller own listings; public rows tied to active listings only.';
comment on policy "listing_price_history_insert_policy" on public.listing_price_history is
  'Insert: seller of listing or admin (server actions use authenticated user).';

-- Latest meaningful price-down (>= 5%) per listing, active listings only — for browse/cards/watchlist.
create or replace function public.public_listing_price_drop_signals (p_ids uuid[])
returns table (
  listing_id uuid,
  drop_percent numeric,
  old_price_cents integer,
  drop_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct on (h.listing_id)
    h.listing_id,
    h.change_percent as drop_percent,
    h.old_price_cents,
    h.created_at as drop_at
  from public.listing_price_history h
  inner join public.listings l on l.id = h.listing_id and l.status = 'active'::public.listing_status
  where h.listing_id = any (p_ids)
    and h.new_price_cents < h.old_price_cents
    and h.old_price_cents > 0
    and (h.old_price_cents - h.new_price_cents)::numeric / h.old_price_cents >= 0.05
  order by h.listing_id, h.created_at desc;
$$;

comment on function public.public_listing_price_drop_signals (uuid[]) is
  'SECURITY DEFINER: latest >=5% price-down per active listing among the given ids.';

-- Active listings with a meaningful drop, newest drop first (browse filter).
create or replace function public.browse_listing_price_drops_ordered ()
returns table (
  listing_id uuid,
  last_drop_at timestamptz,
  drop_percent numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select s.listing_id, s.last_drop_at, s.drop_percent
  from (
    select distinct on (h.listing_id)
      h.listing_id,
      h.created_at as last_drop_at,
      h.change_percent as drop_percent
    from public.listing_price_history h
    inner join public.listings l on l.id = h.listing_id and l.status = 'active'::public.listing_status
    where h.new_price_cents < h.old_price_cents
      and h.old_price_cents > 0
      and (h.old_price_cents - h.new_price_cents)::numeric / h.old_price_cents >= 0.05
    order by h.listing_id, h.created_at desc
  ) s
  order by s.last_drop_at desc;
$$;

comment on function public.browse_listing_price_drops_ordered () is
  'SECURITY DEFINER: active listings whose latest qualifying price-down is meaningful; ordered by most recent drop.';

-- Seller hub: latest meaningful drop per own listing (any listing status).
create or replace function public.seller_listing_price_drop_insights ()
returns table (
  listing_id uuid,
  drop_percent numeric,
  last_drop_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct on (h.listing_id)
    h.listing_id,
    h.change_percent as drop_percent,
    h.created_at as last_drop_at
  from public.listing_price_history h
  inner join public.listings l on l.id = h.listing_id
  inner join public.seller_profiles sp on sp.id = l.seller_id and sp.user_id = auth.uid ()
  where h.new_price_cents < h.old_price_cents
    and h.old_price_cents > 0
    and (h.old_price_cents - h.new_price_cents)::numeric / h.old_price_cents >= 0.05
  order by h.listing_id, h.created_at desc;
$$;

comment on function public.seller_listing_price_drop_insights () is
  'SECURITY DEFINER: latest >=5% price-down per listing for the authenticated seller.';

revoke all on function public.public_listing_price_drop_signals (uuid[]) from public;
revoke all on function public.browse_listing_price_drops_ordered () from public;
revoke all on function public.seller_listing_price_drop_insights () from public;

grant execute on function public.public_listing_price_drop_signals (uuid[]) to anon, authenticated;
grant execute on function public.browse_listing_price_drops_ordered () to anon, authenticated;
grant execute on function public.seller_listing_price_drop_insights () to authenticated;
