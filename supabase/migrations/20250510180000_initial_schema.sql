-- Project Mint — core schema (draft). RLS policies to be added before production.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.user_role as enum ('buyer', 'seller', 'admin');

create type public.seller_verification_status as enum (
  'unverified',
  'pending',
  'verified',
  'rejected'
);

create type public.seller_payout_status as enum (
  'not_started',
  'pending',
  'active',
  'disabled'
);

create type public.listing_condition as enum (
  'brand_new',
  'mint',
  'excellent',
  'very_good',
  'good',
  'fair',
  'poor',
  'non_functioning'
);

create type public.listing_status as enum (
  'draft',
  'pending_review',
  'active',
  'reserved',
  'sold',
  'rejected',
  'archived'
);

create type public.offer_status as enum (
  'pending',
  'accepted',
  'rejected',
  'countered',
  'expired',
  'cancelled'
);

create type public.order_status as enum (
  'pending_payment',
  'paid',
  'cleared_for_shipping',
  'shipped',
  'delivered',
  'completed',
  'disputed',
  'cancelled',
  'refunded'
);

create type public.payment_status as enum (
  'unpaid',
  'authorized',
  'paid',
  'held',
  'released',
  'refunded'
);

create type public.protected_delivery_check_status as enum (
  'not_started',
  'in_progress',
  'submitted',
  'approved',
  'rejected'
);

create type public.protected_delivery_asset_type as enum (
  'condition_photo',
  'serial_number_photo',
  'packaging_photo',
  'sealed_package_photo',
  'receipt_photo'
);

create type public.shipment_status as enum (
  'pending',
  'in_transit',
  'delivered',
  'failed',
  'returned'
);

create type public.dispute_reason as enum (
  'damaged',
  'not_as_described',
  'not_received',
  'counterfeit',
  'other'
);

create type public.dispute_status as enum (
  'open',
  'awaiting_seller',
  'awaiting_buyer',
  'under_review',
  'resolved_buyer',
  'resolved_seller',
  'refunded',
  'closed'
);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role public.user_role not null default 'buyer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.seller_profiles (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  display_name text not null,
  bio text,
  location text,
  phone text,
  verification_status public.seller_verification_status not null default 'unverified',
  payout_status public.seller_payout_status not null default 'not_started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seller_profiles_user_id_key unique (user_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid (),
  name text not null,
  slug text not null,
  parent_id uuid references public.categories (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint categories_slug_key unique (slug)
);

create table public.brands (
  id uuid primary key default gen_random_uuid (),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  constraint brands_slug_key unique (slug)
);

create table public.listings (
  id uuid primary key default gen_random_uuid (),
  seller_id uuid not null references public.seller_profiles (id) on delete restrict,
  category_id uuid not null references public.categories (id) on delete restrict,
  brand_id uuid references public.brands (id) on delete set null,
  title text not null,
  slug text not null,
  description text,
  condition public.listing_condition not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'EUR',
  location text,
  status public.listing_status not null default 'draft',
  offers_enabled boolean not null default true,
  protected_delivery_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint listings_slug_key unique (slug)
);

create table public.listing_images (
  id uuid primary key default gen_random_uuid (),
  listing_id uuid not null references public.listings (id) on delete cascade,
  url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.favorites (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_user_listing_key unique (user_id, listing_id)
);

create table public.offers (
  id uuid primary key default gen_random_uuid (),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.seller_profiles (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  status public.offer_status not null default 'pending',
  parent_offer_id uuid references public.offers (id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid (),
  listing_id uuid not null references public.listings (id) on delete restrict,
  buyer_id uuid not null references public.profiles (id) on delete restrict,
  seller_id uuid not null references public.seller_profiles (id) on delete restrict,
  offer_id uuid references public.offers (id) on delete set null,
  amount_cents integer not null check (amount_cents >= 0),
  platform_fee_cents integer not null default 0 check (platform_fee_cents >= 0),
  protected_delivery_fee_cents integer not null default 0 check (protected_delivery_fee_cents >= 0),
  currency text not null default 'EUR',
  status public.order_status not null default 'pending_payment',
  payment_status public.payment_status not null default 'unpaid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.protected_delivery_checks (
  id uuid primary key default gen_random_uuid (),
  order_id uuid not null references public.orders (id) on delete cascade,
  condition_photos_uploaded boolean not null default false,
  serial_number_uploaded boolean not null default false,
  packaging_photos_uploaded boolean not null default false,
  sealed_package_photo_uploaded boolean not null default false,
  tracking_added boolean not null default false,
  seller_notes text,
  status public.protected_delivery_check_status not null default 'not_started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint protected_delivery_checks_order_id_key unique (order_id)
);

create table public.protected_delivery_assets (
  id uuid primary key default gen_random_uuid (),
  check_id uuid not null references public.protected_delivery_checks (id) on delete cascade,
  type public.protected_delivery_asset_type not null,
  url text not null,
  created_at timestamptz not null default now()
);

create table public.shipments (
  id uuid primary key default gen_random_uuid (),
  order_id uuid not null references public.orders (id) on delete cascade,
  courier_name text,
  tracking_number text,
  tracking_url text,
  status public.shipment_status not null default 'pending',
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.disputes (
  id uuid primary key default gen_random_uuid (),
  order_id uuid not null references public.orders (id) on delete cascade,
  opened_by uuid not null references public.profiles (id) on delete restrict,
  reason public.dispute_reason not null,
  description text,
  status public.dispute_status not null default 'open',
  resolution_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dispute_assets (
  id uuid primary key default gen_random_uuid (),
  dispute_id uuid not null references public.disputes (id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes (common lookups)
-- ---------------------------------------------------------------------------

create index listings_seller_id_idx on public.listings (seller_id);
create index listings_category_id_idx on public.listings (category_id);
create index listings_status_idx on public.listings (status);
create index listing_images_listing_id_idx on public.listing_images (listing_id);
create index offers_listing_id_idx on public.offers (listing_id);
create index offers_buyer_id_idx on public.offers (buyer_id);
create index orders_buyer_id_idx on public.orders (buyer_id);
create index orders_seller_id_idx on public.orders (seller_id);
create index orders_status_idx on public.orders (status);
create index disputes_order_id_idx on public.disputes (order_id);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at ();

create trigger seller_profiles_set_updated_at
before update on public.seller_profiles
for each row
execute procedure public.set_updated_at ();

create trigger listings_set_updated_at
before update on public.listings
for each row
execute procedure public.set_updated_at ();

create trigger offers_set_updated_at
before update on public.offers
for each row
execute procedure public.set_updated_at ();

create trigger orders_set_updated_at
before update on public.orders
for each row
execute procedure public.set_updated_at ();

create trigger protected_delivery_checks_set_updated_at
before update on public.protected_delivery_checks
for each row
execute procedure public.set_updated_at ();

create trigger shipments_set_updated_at
before update on public.shipments
for each row
execute procedure public.set_updated_at ();

create trigger disputes_set_updated_at
before update on public.disputes
for each row
execute procedure public.set_updated_at ();

-- ---------------------------------------------------------------------------
-- Auth: create profile row for new users
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'buyer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user ();

create or replace function public.sync_profile_email ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email
  where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_updated
after update of email on auth.users
for each row
when (old.email is distinct from new.email)
execute procedure public.sync_profile_email ();
