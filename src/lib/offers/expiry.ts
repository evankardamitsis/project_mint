import type { OfferStatus } from "@/types/domain";

export function isOfferPastExpiry(expiresAt: string | null): boolean {
  if (!expiresAt) {
    return false;
  }
  const t = Date.parse(expiresAt);
  if (!Number.isFinite(t)) {
    return false;
  }
  return t < Date.now();
}

/** DB status + time: treat stale pending/countered as expired in UI and guards. */
export function effectiveOfferStatus(status: OfferStatus, expiresAt: string | null): OfferStatus {
  if ((status === "pending" || status === "countered") && isOfferPastExpiry(expiresAt)) {
    return "expired";
  }
  return status;
}

export function isOfferActionable(status: OfferStatus, expiresAt: string | null): boolean {
  const effective = effectiveOfferStatus(status, expiresAt);
  return effective === "pending" || effective === "countered";
}
