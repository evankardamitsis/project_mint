import type { OrderStatus, PaymentStatus } from "@/types/domain";

import { ACTIVE_DISPUTE_STATUSES } from "@/types/disputes";

const activeSet = new Set<string>(ACTIVE_DISPUTE_STATUSES);

export function orderAllowsNewDispute(order: {
  status: OrderStatus;
  payment_status: PaymentStatus;
}): boolean {
  if (order.status === "pending_payment" || order.status === "cancelled" || order.status === "refunded") {
    return false;
  }
  if (order.payment_status !== "held" && order.payment_status !== "paid") {
    return false;
  }
  return order.status === "shipped" || order.status === "delivered" || order.status === "completed";
}

export function hasActiveDispute(disputes: { status: string }[] | null | undefined): boolean {
  if (!disputes?.length) {
    return false;
  }
  return disputes.some((d) => activeSet.has(d.status));
}

export function pickActiveDispute<T extends { id: string; status: string }>(
  rows: T[] | null | undefined,
): T | null {
  if (!rows?.length) {
    return null;
  }
  return rows.find((d) => activeSet.has(d.status)) ?? null;
}
