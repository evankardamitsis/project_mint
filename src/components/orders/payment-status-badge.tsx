import { StatusBadge } from "@/components/status-badge";
import type { PaymentStatus } from "@/types/domain";

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <StatusBadge domain="payment" value={status} />;
}
