import { StatusBadge } from "@/components/status-badge";
import type { DisputeReason } from "@/types/domain";

export function DisputeReasonBadge({ reason }: { reason: DisputeReason }) {
  return <StatusBadge domain="dispute_reason" value={reason} />;
}
