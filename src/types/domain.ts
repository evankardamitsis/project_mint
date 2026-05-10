export type UserRole = "buyer" | "seller" | "admin";

export type ListingCondition =
  | "brand_new"
  | "mint"
  | "excellent"
  | "very_good"
  | "good"
  | "fair"
  | "poor"
  | "non_functioning";

export type ListingStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "reserved"
  | "sold"
  | "rejected"
  | "archived";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "cleared_for_shipping"
  | "shipped"
  | "delivered"
  | "completed"
  | "disputed"
  | "cancelled"
  | "refunded";

export type OfferStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "countered"
  | "expired"
  | "cancelled";

export type PaymentStatus =
  | "unpaid"
  | "authorized"
  | "paid"
  | "held"
  | "released"
  | "refunded";

export type DisputeStatus =
  | "open"
  | "awaiting_seller"
  | "awaiting_buyer"
  | "under_review"
  | "resolved_buyer"
  | "resolved_seller"
  | "refunded"
  | "closed";

export type ShipmentStatus =
  | "pending"
  | "in_transit"
  | "delivered"
  | "failed"
  | "returned";

export type ProtectedDeliveryCheckStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "approved"
  | "rejected";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
