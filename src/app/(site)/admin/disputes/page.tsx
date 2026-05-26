import Link from "next/link";

import { DisputeDashboardList } from "@/components/disputes/dispute-dashboard-list";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { fetchDisputesForAdmin } from "@/lib/disputes/queries";
import type { DisputeStatus } from "@/types/domain";

function parseStatus(raw: string | undefined): DisputeStatus | "all" {
  const allowed = new Set<string>([
    "open", "awaiting_seller", "awaiting_buyer", "under_review",
    "resolved_buyer", "resolved_seller", "refunded", "closed", "all",
  ]);
  if (raw && allowed.has(raw)) return raw as DisputeStatus | "all";
  return "all";
}

type PageProps = { searchParams: Promise<{ status?: string }> };

export default async function AdminDisputesPage(props: PageProps) {
  const sp = await props.searchParams;
  const filter = parseStatus(sp.status);
  const [rows, locale] = await Promise.all([
    fetchDisputesForAdmin(filter === "all" ? null : filter),
    getLocale(),
  ]);
  const s = MESSAGES[locale].adminDisputes;

  const STATUS_TABS = [
    { label: s.tabAll, value: "all" as const },
    { label: s.tabOpen, value: "open" as const },
    { label: s.tabAwaitingSeller, value: "awaiting_seller" as const },
    { label: s.tabAwaitingBuyer, value: "awaiting_buyer" as const },
    { label: s.tabUnderReview, value: "under_review" as const },
    { label: s.tabResolvedBuyer, value: "resolved_buyer" as const },
    { label: s.tabResolvedSeller, value: "resolved_seller" as const },
    { label: s.tabRefunded, value: "refunded" as const },
    { label: s.tabClosed, value: "closed" as const },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">{s.title}</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">{s.subtitle}</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((t) => {
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
