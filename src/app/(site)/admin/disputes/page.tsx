import Link from "next/link";

import { DisputeDashboardList } from "@/components/disputes/dispute-dashboard-list";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { fetchDisputesForAdmin } from "@/lib/disputes/queries";
import type { DisputeStatus } from "@/types/domain";

const tabs: { label: string; value: DisputeStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "Awaiting seller", value: "awaiting_seller" },
  { label: "Awaiting buyer", value: "awaiting_buyer" },
  { label: "Under review", value: "under_review" },
  { label: "Resolved (buyer)", value: "resolved_buyer" },
  { label: "Resolved (seller)", value: "resolved_seller" },
  { label: "Refunded", value: "refunded" },
  { label: "Closed", value: "closed" },
];

function parseStatus(raw: string | undefined): DisputeStatus | "all" {
  const allowed = new Set<string>([
    "open",
    "awaiting_seller",
    "awaiting_buyer",
    "under_review",
    "resolved_buyer",
    "resolved_seller",
    "refunded",
    "closed",
    "all",
  ]);
  if (raw && allowed.has(raw)) {
    return raw as DisputeStatus | "all";
  }
  return "all";
}

type PageProps = { searchParams: Promise<{ status?: string }> };

export default async function AdminDisputesPage(props: PageProps) {
  const sp = await props.searchParams;
  const filter = parseStatus(sp.status);
  const rows = await fetchDisputesForAdmin(filter === "all" ? null : filter);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Disputes"
        description="Review cases with buyer evidence and seller responses. Refunds and releases are status placeholders until Stripe is live."
      />

      <div className="flex flex-wrap gap-2 border-b border-[#e0ddd8]/80 pb-4">
        {tabs.map((t) => {
          const active = filter === t.value;
          const href = t.value === "all" ? "/admin/disputes" : `/admin/disputes?status=${t.value}`;
          return (
            <Button
              key={t.value}
              size="sm"
              variant={active ? "default" : "outline"}
              className={active ? "bg-mint text-white hover:bg-mint/90" : "border-[#e0ddd8]"}
              render={<Link href={href} />}
            >
              {t.label}
            </Button>
          );
        })}
      </div>

      <DisputeDashboardList rows={rows} statusFilter={filter} />
    </div>
  );
}
