-- listings_select_if_party_has_offer + offers_select caused infinite RLS recursion.
-- Use SECURITY DEFINER helper so the offers existence check does not re-enter listings policies.

create or replace function public.listing_has_offer_from_buyer (p_listing_id uuid, p_buyer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.offers o
    where o.listing_id = p_listing_id
      and o.buyer_id = p_buyer_id
  );
$$;

comment on function public.listing_has_offer_from_buyer (uuid, uuid) is
  'True if buyer has any offer row on listing; used by listings RLS without recursing into offers policies.';

revoke all on function public.listing_has_offer_from_buyer (uuid, uuid) from public;
grant execute on function public.listing_has_offer_from_buyer (uuid, uuid) to authenticated;

drop policy if exists "listings_select_if_party_has_offer" on public.listings;

create policy "listings_select_if_party_has_offer"
  on public.listings
  for select
  to authenticated
  using (public.listing_has_offer_from_buyer (id, auth.uid()));
