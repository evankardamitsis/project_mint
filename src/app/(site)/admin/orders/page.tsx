import Link from "next/link";

import { Package } from "lucide-react";

import { StatusBadge } from "@/components/status-badge";
import { fetchAdminOrders } from "@/lib/orders/queries";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { formatEuroPrefix } from "@/lib/utils";
import { orderTotalCents } from "@/lib/orders/fees";

export default async function AdminOrdersPage() {
  const [rows, locale] = await Promise.all([fetchAdminOrders(), getLocale()]);
  const s = MESSAGES[locale].adminOrders;
  const dateLocale = locale === "el" ? "el-GR" : "en-GB";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">{s.title}</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">{s.subtitle}</p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#F7F6F3]">
            <Package className="size-7 text-[#ABABAB]" />
          </div>
          <p className="text-sm font-semibold text-[#111111]">{s.emptyMsg}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const total = orderTotalCents(
              row.amount_cents,
              row.platform_fee_cents,
              row.protected_delivery_fee_cents,
            );
            return (
              <Link
                key={row.id}
                href={`/admin/orders/${row.id}`}
                className="flex items-center gap-4 rounded-2xl border border-[#EEECE8] bg-white p-4 transition-colors hover:border-[#DDDBD6]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#111111]">
                    {row.listing_title}
                  </p>
                  <p className="mt-0.5 text-xs text-[#ABABAB]">{row.counterparty_label}</p>
                  <p className="mt-0.5 text-xs text-[#ABABAB]">
                    {new Date(row.created_at).toLocaleDateString(dateLocale, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <StatusBadge domain="order" value={row.status} />
                <p className="shrink-0 text-base font-black text-[#111111]">
                  {formatEuroPrefix(total)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
