import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Shield } from "lucide-react";

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin overview"
        description="Cross-marketplace metrics and queues will be added when operational workflows are defined."
      />
      <EmptyState
        icon={Shield}
        title="Operational dashboards are placeholders"
        description="Wire metrics, alerts, and assignment flows after core listing and order CRUD exist."
      />
    </div>
  );
}
