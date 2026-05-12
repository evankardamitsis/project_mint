import { StatusBadge } from "@/components/status-badge";
import type { OrderStatus } from "@/types/domain";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <StatusBadge domain="order" value={status} />;
}
