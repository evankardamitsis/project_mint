import { StatusBadge } from "@/components/status-badge";
import { effectiveOfferStatus } from "@/lib/offers/expiry";
import type { OfferStatus } from "@/types/domain";

export function OfferStatusBadge({
  status,
  expiresAt,
}: {
  status: OfferStatus;
  expiresAt: string | null;
}) {
  const effective = effectiveOfferStatus(status, expiresAt);
  return <StatusBadge domain="offer" value={effective} />;
}
