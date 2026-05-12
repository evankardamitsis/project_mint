import { StatusBadge } from "@/components/status-badge";
import type { DisputeStatus } from "@/types/domain";

export function DisputeStatusBadge({ status }: { status: DisputeStatus }) {
  return <StatusBadge domain="dispute" value={status} />;
}
