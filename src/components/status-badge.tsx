import { type VariantProps } from "class-variance-authority";

import { Badge, badgeVariants } from "@/components/ui/badge";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const listingStatus: Record<string, BadgeVariant> = {
  draft: "subtle",
  pending_review: "amber",
  active: "mint",
  reserved: "amber",
  sold: "subtle",
  rejected: "destructive",
  archived: "subtle",
};

const orderStatus: Record<string, BadgeVariant> = {
  pending_payment: "amber",
  paid: "mint",
  cleared_for_shipping: "info",
  shipped: "info",
  delivered: "mint",
  completed: "mint",
  disputed: "dispute",
  cancelled: "subtle",
  refunded: "subtle",
};

const offerStatus: Record<string, BadgeVariant> = {
  pending: "amber",
  accepted: "mint",
  rejected: "destructive",
  countered: "info",
  expired: "subtle",
  cancelled: "subtle",
};

const paymentStatus: Record<string, BadgeVariant> = {
  unpaid: "subtle",
  authorized: "info",
  paid: "mint",
  held: "mint",
  released: "mint",
  refunded: "subtle",
};

const disputeStatus: Record<string, BadgeVariant> = {
  open: "dispute",
  awaiting_seller: "amber",
  awaiting_buyer: "amber",
  under_review: "info",
  resolved_buyer: "mint",
  resolved_seller: "mint",
  refunded: "subtle",
  closed: "subtle",
};

const disputeReasonMap: Record<string, BadgeVariant> = {
  damaged: "dispute",
  not_as_described: "amber",
  not_received: "info",
  counterfeit: "dispute",
  other: "subtle",
};

const shipmentStatus: Record<string, BadgeVariant> = {
  pending: "amber",
  in_transit: "info",
  delivered: "mint",
  failed: "destructive",
  returned: "subtle",
};

const pdCheckStatus: Record<string, BadgeVariant> = {
  not_started: "subtle",
  in_progress: "amber",
  submitted: "info",
  approved: "mint",
  rejected: "destructive",
};

const sellerVerificationStatus: Record<string, BadgeVariant> = {
  unverified: "subtle",
  pending: "amber",
  verified: "mint",
  rejected: "destructive",
};

const sellerPayoutStatus: Record<string, BadgeVariant> = {
  not_started: "subtle",
  pending: "amber",
  active: "mint",
  disabled: "destructive",
};

const maps = {
  listing: listingStatus,
  order: orderStatus,
  offer: offerStatus,
  payment: paymentStatus,
  dispute: disputeStatus,
  dispute_reason: disputeReasonMap,
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
    (maps[domain] as Record<string, BadgeVariant>)[value] ?? "subtle";
  return (
    <Badge variant={variant}>
      {label ?? humanize(value)}
    </Badge>
  );
}
