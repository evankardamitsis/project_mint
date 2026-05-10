import { type VariantProps } from "class-variance-authority";

import { Badge, badgeVariants } from "@/components/ui/badge";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const listingStatus: Record<string, BadgeVariant> = {
  draft: "secondary",
  pending_review: "outline",
  active: "default",
  reserved: "secondary",
  sold: "secondary",
  rejected: "destructive",
  archived: "outline",
};

const orderStatus: Record<string, BadgeVariant> = {
  pending_payment: "outline",
  paid: "default",
  cleared_for_shipping: "secondary",
  shipped: "secondary",
  delivered: "secondary",
  completed: "default",
  disputed: "destructive",
  cancelled: "outline",
  refunded: "outline",
};

const offerStatus: Record<string, BadgeVariant> = {
  pending: "outline",
  accepted: "default",
  rejected: "destructive",
  countered: "secondary",
  expired: "outline",
  cancelled: "outline",
};

const paymentStatus: Record<string, BadgeVariant> = {
  unpaid: "outline",
  authorized: "secondary",
  paid: "default",
  held: "secondary",
  released: "default",
  refunded: "outline",
};

const disputeStatus: Record<string, BadgeVariant> = {
  open: "destructive",
  awaiting_seller: "secondary",
  awaiting_buyer: "secondary",
  under_review: "outline",
  resolved_buyer: "default",
  resolved_seller: "default",
  refunded: "outline",
  closed: "secondary",
};

const shipmentStatus: Record<string, BadgeVariant> = {
  pending: "outline",
  in_transit: "secondary",
  delivered: "default",
  failed: "destructive",
  returned: "outline",
};

const pdCheckStatus: Record<string, BadgeVariant> = {
  not_started: "outline",
  in_progress: "secondary",
  submitted: "secondary",
  approved: "default",
  rejected: "destructive",
};

const sellerVerificationStatus: Record<string, BadgeVariant> = {
  unverified: "outline",
  pending: "secondary",
  verified: "default",
  rejected: "destructive",
};

const sellerPayoutStatus: Record<string, BadgeVariant> = {
  not_started: "outline",
  pending: "secondary",
  active: "default",
  disabled: "destructive",
};

const maps = {
  listing: listingStatus,
  order: orderStatus,
  offer: offerStatus,
  payment: paymentStatus,
  dispute: disputeStatus,
  shipment: shipmentStatus,
  protected_delivery: pdCheckStatus,
  seller_verification: sellerVerificationStatus,
  seller_payout: sellerPayoutStatus,
} as const;

export type StatusDomain = keyof typeof maps;

function humanize(value: string) {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function StatusBadge({
  domain,
  value,
  label,
}: {
  domain: StatusDomain;
  value: string;
  label?: string;
}) {
  const variant =
    (maps[domain] as Record<string, BadgeVariant>)[value] ?? "outline";
  return (
    <Badge variant={variant}>
      {label ?? humanize(value)}
    </Badge>
  );
}
