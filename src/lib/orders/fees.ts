/** Placeholder platform fee (5% of item amount), integer cents. */
export function platformFeeCents(amountCents: number): number {
  if (!Number.isFinite(amountCents) || amountCents <= 0) {
    return 0;
  }
  return Math.round(amountCents * 0.05);
}

export function orderTotalCents(
  amountCents: number,
  platformFeeCents: number,
  protectedDeliveryFeeCents: number,
): number {
  return amountCents + platformFeeCents + protectedDeliveryFeeCents;
}
