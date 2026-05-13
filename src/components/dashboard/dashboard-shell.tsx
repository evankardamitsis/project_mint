import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { SITE_CONTAINER } from "@/config/site-layout";
import { cn } from "@/lib/utils";

export function DashboardShell({
  title,
  description,
  navItems,
  children,
}: {
  title: string;
  description?: string;
  navItems: readonly { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className={cn(SITE_CONTAINER, "flex flex-1 flex-col gap-8 py-8 lg:flex-row lg:gap-10 lg:py-10")}>
      <aside className="w-full shrink-0 rounded-2xl bg-surface p-4 shadow-sm lg:max-w-xs lg:bg-transparent lg:p-0 lg:shadow-none">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-text-caption">{title}</p>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-text-muted">{description}</p>
        ) : null}
        <div className="mt-4">
          <DashboardNav items={navItems} />
        </div>
      </aside>
      <main className="min-w-0 flex-1 space-y-8">{children}</main>
    </div>
  );
}
