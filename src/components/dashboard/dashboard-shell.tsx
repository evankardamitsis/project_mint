import { DashboardNav } from "@/components/dashboard/dashboard-nav";

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
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:gap-10">
      <aside className="w-full shrink-0 lg:max-w-xs lg:border-r lg:border-border/80 lg:pr-8">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </p>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
        <div className="mt-4">
          <DashboardNav items={navItems} />
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
