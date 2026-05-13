import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { SITE_CONTAINER } from "@/config/site-layout";
import { cn } from "@/lib/utils";

export function DashboardShell({
  sidebar,
  navItems,
  children,
}: {
  sidebar: { initials: string; heading: string; description?: string };
  navItems: readonly { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className={cn(SITE_CONTAINER, "flex flex-1 flex-col gap-8 py-8 lg:flex-row lg:gap-10 lg:py-10")}>
      <aside className="w-full shrink-0 border border-[#e0ddd8] bg-surface p-4 lg:max-w-xs lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mint-tint text-xs font-bold text-mint-dark">
            {sidebar.initials}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold leading-tight text-ink">{sidebar.heading}</p>
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
