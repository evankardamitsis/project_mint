import Link from "next/link";

import { AlertCircle, ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { cn } from "@/lib/utils";

export default async function AdminHomePage() {
  const [supabase, locale] = await Promise.all([createClient(), getLocale()] as const);
  const s = MESSAGES[locale].adminOverview;

  const [
    { count: pendingListings },
    { count: totalUsers },
    { count: activeListings },
    { count: totalOrders },
  ] = await Promise.all([
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("orders").select("*", { count: "exact", head: true }),
  ]);

  const { count: openDisputesRaw } = await supabase
    .from("disputes")
    .select("*", { count: "exact", head: true })
    .eq("status", "open")
    .then((r) => r, () => ({ count: 0, data: null, error: null, status: 200, statusText: "" }));

  const openDisputes = openDisputesRaw ?? 0;

  const stats = [
    { label: s.statPending, value: pendingListings ?? 0, href: "/admin/listings", urgent: (pendingListings ?? 0) > 0 },
    { label: s.statActiveListings, value: activeListings ?? 0, href: "/admin/listings?status=active", urgent: false },
    { label: s.statUsers, value: totalUsers ?? 0, href: "/admin/users", urgent: false },
    { label: s.statOrders, value: totalOrders ?? 0, href: "/admin/orders", urgent: false },
  ];

  const pending = pendingListings ?? 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">{s.title}</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">{s.subtitle}</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={cn(
              "rounded-2xl border p-5 transition-all hover:border-[#DDDBD6]",
              stat.urgent ? "border-[#C47A15] bg-[#FEF9EC]" : "border-[#EEECE8] bg-white",
            )}
          >
            <div
              className={cn(
                "text-4xl font-black tracking-tight",
                stat.urgent ? "text-[#C47A15]" : "text-[#111111]",
              )}
            >
              {stat.value}
            </div>
            <div className="mt-2 text-sm font-medium text-[#6B6B6B]">{stat.label}</div>
          </Link>
        ))}
      </div>

      {pending > 0 ? (
        <Link
          href="/admin/listings"
          className="flex items-center gap-4 rounded-2xl border border-[#F5E6B0] bg-[#FEF9EC] p-5 transition-all hover:border-[#C47A15]"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#C47A15]">
            <AlertCircle className="size-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#111111]">
              {s.urgentBody.replace("{n}", String(pending))}
            </p>
            <p className="mt-0.5 text-xs text-[#6B6B6B]">{s.urgentAction}</p>
          </div>
          <ChevronRight className="size-5 text-[#ABABAB]" />
        </Link>
      ) : null}

      {openDisputes > 0 ? (
        <Link
          href="/admin/disputes"
          className="mt-4 flex items-center gap-4 rounded-2xl border border-[#FECACA] bg-[#FFF5F5] p-5 transition-all hover:border-[#DC2626]"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#DC2626]">
            <AlertCircle className="size-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#111111]">
              {s.disputesBody.replace("{n}", String(openDisputes))}
            </p>
            <p className="mt-0.5 text-xs text-[#6B6B6B]">{s.disputesAction}</p>
          </div>
          <ChevronRight className="size-5 text-[#ABABAB]" />
        </Link>
      ) : null}
    </div>
  );
}
