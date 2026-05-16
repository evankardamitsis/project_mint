-- Buyer saved searches (foundation for future alerts; no delivery jobs in this migration).

create table public.saved_searches (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  query text null,
  category_id uuid null references public.categories (id) on delete set null,
  brand_id uuid null references public.brands (id) on delete set null,
  condition public.listing_condition null,
  min_price_cents integer null,
  max_price_cents integer null,
  deal text null,
  sort text null,
  notifications_enabled boolean not null default true,
  last_checked_at timestamptz null,
  last_match_count integer not null default 0,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now (),
  constraint saved_searches_min_price_nonneg check (min_price_cents is null or min_price_cents >= 0),
  constraint saved_searches_max_price_nonneg check (max_price_cents is null or max_price_cents >= 0),
  constraint saved_searches_price_order check (
    min_price_cents is null or max_price_cents is null or min_price_cents <= max_price_cents
  )
);

comment on table public.saved_searches is
  'Buyer-saved browse filters; RLS restricts to owner + admin; no public read.';

create index saved_searches_user_id_idx on public.saved_searches (user_id);
create index saved_searches_category_id_idx on public.saved_searches (category_id);
create index saved_searches_brand_id_idx on public.saved_searches (brand_id);
create index saved_searches_created_at_idx on public.saved_searches (created_at desc);

create trigger saved_searches_set_updated_at
before update on public.saved_searches
for each row
execute procedure public.set_updated_at ();

alter table public.saved_searches enable row level security;

create policy "saved_searches_select"
  on public.saved_searches
  for select
  to authenticated
  using (public.is_admin () or user_id = auth.uid ());

create policy "saved_searches_insert"
  on public.saved_searches
  for insert
  to authenticated
  with check (public.is_admin () or user_id = auth.uid ());

create policy "saved_searches_update"
  on public.saved_searches
  for update
  to authenticated
  using (public.is_admin () or user_id = auth.uid ())
  with check (public.is_admin () or user_id = auth.uid ());

create policy "saved_searches_delete"
  on public.saved_searches
  for delete
  to authenticated
  using (public.is_admin () or user_id = auth.uid ());

comment on policy "saved_searches_select" on public.saved_searches is 'Owner or admin.';
comment on policy "saved_searches_insert" on public.saved_searches is 'Insert as self or admin.';
comment on policy "saved_searches_update" on public.saved_searches is 'Update own rows or admin.';
comment on policy "saved_searches_delete" on public.saved_searches is 'Delete own rows or admin.';
