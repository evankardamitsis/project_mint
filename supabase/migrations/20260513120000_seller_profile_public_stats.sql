-- Optional display stats for listing detail (defaults keep “Verified seller” until backfilled).
alter table public.seller_profiles
  add column if not exists completed_sales_count integer not null default 0;

alter table public.seller_profiles
  add column if not exists average_rating numeric(3, 2);

comment on column public.seller_profiles.completed_sales_count is
  'Completed sales count for public seller row (maintain via app/jobs; default 0).';

comment on column public.seller_profiles.average_rating is
  'Optional average rating (e.g. 4.8) for public seller row.';
