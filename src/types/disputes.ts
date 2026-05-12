import type { DisputeReason, DisputeStatus } from "@/types/domain";

export const ACTIVE_DISPUTE_STATUSES: DisputeStatus[] = [
  "open",
  "awaiting_seller",
  "awaiting_buyer",
  "under_review",
];

export interface DisputeAssetView {
  id: string;
  storagePath: string;
  signedUrl: string | null;
  created_at: string;
}

export interface DisputeRow {
  id: string;
  order_id: string;
  opened_by: string;
  reason: DisputeReason;
  description: string | null;
  status: DisputeStatus;
  resolution_notes: string | null;
  admin_notes: string | null;
  seller_response: string | null;
  seller_responded_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DisputeListRow {
  id: string;
  order_id: string;
  reason: DisputeReason;
  status: DisputeStatus;
  created_at: string;
  listing_title: string | null;
  listing_image_url: string | null;
  buyer_label: string;
  seller_label: string;
}

export interface DisputeDetailBundle {
  dispute: DisputeRow;
  assets: DisputeAssetView[];
  order: {
    id: string;
    status: string;
    payment_status: string;
    buyer_id: string;
    seller_id: string;
    listing_title: string;
    listing_slug: string;
    listing_image_url: string | null;
    currency: string;
  };
}
