import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminNav } from "@/config/navigation";
import { requireRole } from "@/lib/auth/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["admin"], { nextAfterLogin: "/admin" });

  return (
    <div className="dark min-h-full">
      <DashboardShell
        title="Admin"
        description="Moderation, disputes, and marketplace health."
        navItems={adminNav}
      >
        {children}
      </DashboardShell>
    </div>
  );
}
