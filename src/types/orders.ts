import type { OrderStatus, PaymentStatus, ProtectedDeliveryCheckStatus, DisputeStatus } from "@/types/domain";

export interface OrderListRow {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_slug: string;
  listing_image_url: string | null;
  amount_cents: number;
  platform_fee_cents: number;
  protected_delivery_fee_cents: number;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  created_at: string;
  counterparty_label: string;
  /** Protected Delivery checklist status when applicable. */
  pd_check_status: ProtectedDeliveryCheckStatus | null;
  /** Active dispute (open pipeline), if any. */
  active_dispute: { id: string; status: DisputeStatus } | null;
  /** True if this order has at least one dispute row (any status). */
  has_dispute: boolean;
}

export interface OrderDetail extends OrderListRow {
  buyer_id: string;
  seller_id: string;
  offer_id: string | null;
  buyer_full_name: string | null;
  buyer_email: string | null;
  seller_display_name: string;
}
