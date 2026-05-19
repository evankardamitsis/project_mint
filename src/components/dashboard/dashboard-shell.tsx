import type { ReactNode } from "react";

import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { SITE_CONTAINER } from "@/config/site-layout";
import { cn } from "@/lib/utils";

export function DashboardShell({
  sidebar,
  navItems,
  children,
}: {
  sidebar: { initials: string; heading: string; description?: string; badge?: ReactNode };
  navItems: readonly { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className={cn(SITE_CONTAINER, "flex flex-1 flex-col gap-8 py-8 lg:flex-row lg:gap-12 lg:py-10")}>
      <aside className="w-full shrink-0 rounded-2xl bg-(--color-background-surface) p-5 shadow-sm ring-1 ring-[#e0ddd8]/70 lg:max-w-xs lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none lg:ring-0">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mint-tint text-xs font-bold text-mint-dark">
            {sidebar.initials}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold leading-tight text-ink">{sidebar.heading}</p>
              {sidebar.badge}
            </div>
            {sidebar.description ? (
              <p className="mt-1 text-sm leading-relaxed text-(--color-text-muted)">{sidebar.description}</p>
            ) : null}
          </div>
        </div>
        <div className="mt-5">
          <DashboardNav items={navItems} />
        </div>
      </aside>
      <main className="min-w-0 flex-1 space-y-8">{children}</main>
    </div>
  );
}
