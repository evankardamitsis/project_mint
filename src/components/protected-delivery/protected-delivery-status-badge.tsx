import { StatusBadge } from "@/components/status-badge";
import type { ProtectedDeliveryCheckStatus } from "@/types/domain";

export function ProtectedDeliveryStatusBadge({ status }: { status: ProtectedDeliveryCheckStatus | null }) {
  if (!status) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  return <StatusBadge domain="protected_delivery" value={status} />;
}
