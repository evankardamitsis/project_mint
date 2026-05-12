import type { OfferStatus } from "@/types/domain";

export interface OfferListingSummary {
  id: string;
  title: string;
  slug: string;
  price_cents: number;
  currency: string;
  primary_image_url: string | null;
}

export interface BuyerOfferRow {
  id: string;
  listing_id: string;
  amount_cents: number;
  status: OfferStatus;
  parent_offer_id: string | null;
  expires_at: string | null;
  created_at: string;
  listings: OfferListingSummary | null;
  /** Set when an order was created from this accepted offer. */
  order_id: string | null;
}

export interface SellerOfferRow {
  id: string;
  listing_id: string;
  buyer_id: string;
  amount_cents: number;
  status: OfferStatus;
  parent_offer_id: string | null;
  expires_at: string | null;
  created_at: string;
  listings: OfferListingSummary | null;
  buyer_full_name: string | null;
  buyer_email: string | null;
}
