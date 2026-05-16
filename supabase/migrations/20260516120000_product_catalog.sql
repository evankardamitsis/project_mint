-- Product catalog foundation (templates for guided listing creation; no external AI in this migration).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid (),
  category_id uuid not null references public.categories (id) on delete restrict,
  brand_id uuid not null references public.brands (id) on delete restrict,
  name text not null,
  slug text not null,
  model text null,
  year_start integer null,
  year_end integer null,
  default_title_template text null,
  description_prompt text null,
  protected_delivery_recommended boolean not null default true,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now (),
  constraint products_slug_key unique (slug)
);

comment on table public.products is
  'Curated product templates for seller matching; public read, admin writes.';

create table public.product_aliases (
  id uuid primary key default gen_random_uuid (),
  product_id uuid not null references public.products (id) on delete cascade,
  alias text not null,
  created_at timestamptz not null default now ()
);

create index product_aliases_product_id_idx on public.product_aliases (product_id);
create index product_aliases_alias_lower_idx on public.product_aliases (lower(alias));

create table public.product_price_estimates (
  id uuid primary key default gen_random_uuid (),
  product_id uuid not null references public.products (id) on delete cascade,
  condition public.listing_condition not null,
  low_price_cents integer not null,
  high_price_cents integer not null,
  median_price_cents integer null,
  sample_size integer not null default 0,
  source text not null default 'manual_seed',
  updated_at timestamptz not null default now (),
  constraint product_price_estimates_range check (low_price_cents <= high_price_cents),
  constraint product_price_estimates_nonneg check (
    low_price_cents >= 0
    and high_price_cents >= 0
  ),
  constraint product_price_estimates_product_condition_key unique (product_id, condition)
);

create index product_price_estimates_product_id_idx on public.product_price_estimates (product_id);

create table public.product_photo_requirements (
  id uuid primary key default gen_random_uuid (),
  product_id uuid null references public.products (id) on delete cascade,
  category_id uuid null references public.categories (id) on delete cascade,
  label text not null,
  helper_text text null,
  required boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now (),
  constraint product_photo_requirements_scope check (
    product_id is not null
    or category_id is not null
  )
);

create index product_photo_requirements_product_id_idx on public.product_photo_requirements (product_id);
create index product_photo_requirements_category_id_idx on public.product_photo_requirements (category_id);

create table public.product_shipping_profiles (
  id uuid primary key default gen_random_uuid (),
  product_id uuid null references public.products (id) on delete cascade,
  category_id uuid null references public.categories (id) on delete cascade,
  package_length_cm integer null,
  package_width_cm integer null,
  package_height_cm integer null,
  package_weight_kg numeric(10, 3) null,
  packaging_kit_label text null,
  packaging_notes text null,
  created_at timestamptz not null default now (),
  constraint product_shipping_profiles_scope check (
    product_id is not null
    or category_id is not null
  )
);

create index product_shipping_profiles_product_id_idx on public.product_shipping_profiles (product_id);
create index product_shipping_profiles_category_id_idx on public.product_shipping_profiles (category_id);

create index products_category_id_idx on public.products (category_id);
create index products_brand_id_idx on public.products (brand_id);
create index products_name_lower_idx on public.products (lower(name));

create trigger products_set_updated_at
before update on public.products
for each row
execute procedure public.set_updated_at ();

create trigger product_price_estimates_set_updated_at
before update on public.product_price_estimates
for each row
execute procedure public.set_updated_at ();

-- ---------------------------------------------------------------------------
-- Listings: optional link to matched catalog product (wizard creates; edits unchanged)
-- ---------------------------------------------------------------------------

alter table public.listings
add column if not exists product_id uuid null references public.products (id) on delete set null;

create index if not exists listings_product_id_idx on public.listings (product_id);

-- ---------------------------------------------------------------------------
-- Search helper (ilike MVP; future: embeddings / vision / personalization)
-- ---------------------------------------------------------------------------

create or replace function public.search_products (p_query text, p_limit integer default 24)
returns table (
  id uuid,
  name text,
  slug text,
  model text,
  brand_id uuid,
  brand_name text,
  brand_slug text,
  category_id uuid,
  category_name text,
  category_slug text,
  default_title_template text,
  description_prompt text,
  protected_delivery_recommended boolean
)
language sql
stable
security invoker
set search_path = public
as $$
  select distinct on (p.id)
    p.id,
    p.name,
    p.slug,
    p.model,
    b.id as brand_id,
    b.name as brand_name,
    b.slug as brand_slug,
    c.id as category_id,
    c.name as category_name,
    c.slug as category_slug,
    p.default_title_template,
    p.description_prompt,
    p.protected_delivery_recommended
  from public.products p
  join public.brands b on b.id = p.brand_id
  join public.categories c on c.id = p.category_id
  left join public.product_aliases pa on pa.product_id = p.id
  where length(trim(coalesce(p_query, ''))) >= 2
    and (
      p.name ilike '%' || trim(p_query) || '%'
      or coalesce(p.model, '') ilike '%' || trim(p_query) || '%'
      or pa.alias ilike '%' || trim(p_query) || '%'
      or b.name ilike '%' || trim(p_query) || '%'
    )
  order by p.id, p.name asc
  limit greatest(1, least(coalesce(p_limit, 24), 48));
$$;

comment on function public.search_products (text, integer) is
  'MVP text match for listing wizard. Future: image-based recognition, saved-search personalization.';

grant execute on function public.search_products (text, integer) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- RLS: world read; admin writes; no anon/authenticated inserts/updates/deletes
-- ---------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.product_aliases enable row level security;
alter table public.product_price_estimates enable row level security;
alter table public.product_photo_requirements enable row level security;
alter table public.product_shipping_profiles enable row level security;

-- products
create policy "products_select_public"
  on public.products
  for select
  to anon, authenticated
  using (true);

create policy "products_insert_admin"
  on public.products
  for insert
  to authenticated
  with check (public.is_admin ());

create policy "products_update_admin"
  on public.products
  for update
  to authenticated
  using (public.is_admin ())
  with check (public.is_admin ());

create policy "products_delete_admin"
  on public.products
  for delete
  to authenticated
  using (public.is_admin ());

-- product_aliases
create policy "product_aliases_select_public"
  on public.product_aliases
  for select
  to anon, authenticated
  using (true);

create policy "product_aliases_insert_admin"
  on public.product_aliases
  for insert
  to authenticated
  with check (public.is_admin ());

create policy "product_aliases_update_admin"
  on public.product_aliases
  for update
  to authenticated
  using (public.is_admin ())
  with check (public.is_admin ());

create policy "product_aliases_delete_admin"
  on public.product_aliases
  for delete
  to authenticated
  using (public.is_admin ());

-- product_price_estimates
create policy "product_price_estimates_select_public"
  on public.product_price_estimates
  for select
  to anon, authenticated
  using (true);

create policy "product_price_estimates_insert_admin"
  on public.product_price_estimates
  for insert
  to authenticated
  with check (public.is_admin ());

create policy "product_price_estimates_update_admin"
  on public.product_price_estimates
  for update
  to authenticated
  using (public.is_admin ())
  with check (public.is_admin ());

create policy "product_price_estimates_delete_admin"
  on public.product_price_estimates
  for delete
  to authenticated
  using (public.is_admin ());

-- product_photo_requirements
create policy "product_photo_requirements_select_public"
  on public.product_photo_requirements
  for select
  to anon, authenticated
  using (true);

create policy "product_photo_requirements_insert_admin"
  on public.product_photo_requirements
  for insert
  to authenticated
  with check (public.is_admin ());

create policy "product_photo_requirements_update_admin"
  on public.product_photo_requirements
  for update
  to authenticated
  using (public.is_admin ())
  with check (public.is_admin ());

create policy "product_photo_requirements_delete_admin"
  on public.product_photo_requirements
  for delete
  to authenticated
  using (public.is_admin ());

-- product_shipping_profiles
create policy "product_shipping_profiles_select_public"
  on public.product_shipping_profiles
  for select
  to anon, authenticated
  using (true);

create policy "product_shipping_profiles_insert_admin"
  on public.product_shipping_profiles
  for insert
  to authenticated
  with check (public.is_admin ());

create policy "product_shipping_profiles_update_admin"
  on public.product_shipping_profiles
  for update
  to authenticated
  using (public.is_admin ())
  with check (public.is_admin ());

create policy "product_shipping_profiles_delete_admin"
  on public.product_shipping_profiles
  for delete
  to authenticated
  using (public.is_admin ());

grant select on public.products to anon, authenticated;
grant select on public.product_aliases to anon, authenticated;
grant select on public.product_price_estimates to anon, authenticated;
grant select on public.product_photo_requirements to anon, authenticated;
grant select on public.product_shipping_profiles to anon, authenticated;
