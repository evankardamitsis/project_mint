-- Slug uniqueness must be global; RLS hides other sellers' rows from SELECT.
-- This helper runs with definer rights and only exposes a boolean.

create or replace function public.listing_slug_taken (p_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.listings l
    where l.slug = p_slug
  );
$$;

revoke all on function public.listing_slug_taken (text) from public;
grant execute on function public.listing_slug_taken (text) to anon, authenticated, service_role;
