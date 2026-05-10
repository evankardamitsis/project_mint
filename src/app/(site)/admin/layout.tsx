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
    <DashboardShell
      title="Admin"
      description="Moderation, disputes, and marketplace health — operational tools ship incrementally."
      navItems={adminNav}
    >
      {children}
    </DashboardShell>
  );
}
