-- Checkout: prevent duplicate offer-based orders; one open buy-now order per listing.
-- Allow buyers/sellers to read listings tied to their orders (reserved buy-now path).

-- ---------------------------------------------------------------------------
-- Unique: at most one order per accepted-offer chain anchor (offer_id set)
-- ---------------------------------------------------------------------------

create unique index if not exists orders_offer_id_unique
  on public.orders (offer_id)
  where offer_id is not null;

-- ---------------------------------------------------------------------------
-- Unique: at most one non-terminal buy-now order (no offer_id) per listing
-- ---------------------------------------------------------------------------

create unique index if not exists orders_listing_open_buy_now_unique
  on public.orders (listing_id)
  where offer_id is null
    and status in (
      'pending_payment'::public.order_status,
      'paid'::public.order_status,
      'cleared_for_shipping'::public.order_status,
      'shipped'::public.order_status,
      'delivered'::public.order_status,
      'disputed'::public.order_status
    );

-- ---------------------------------------------------------------------------
-- listings: buyer or seller on an order can read that listing (e.g. reserved)
-- ---------------------------------------------------------------------------

create policy "listings_select_if_party_has_order"
  on public.listings
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.listing_id = listings.id
        and (
          o.buyer_id = auth.uid()
          or public.is_seller_profile_owner (o.seller_id)
        )
    )
  );
