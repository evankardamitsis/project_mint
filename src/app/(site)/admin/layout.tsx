import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminNav } from "@/config/navigation";
import { requireRole } from "@/lib/auth/guards";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { initialsFromDisplayName } from "@/lib/profile-display";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["admin"], { nextAfterLogin: "/admin" });
  const locale = await getLocale();
  const m = MESSAGES[locale];
  const heading = "Admin";
  const initials = initialsFromDisplayName(profile.full_name || profile.email || heading);

  return (
    <div className="dark min-h-full">
      <DashboardShell
        sidebar={{
          initials,
          heading,
          description: m.dashboard.admin,
        }}
        navItems={adminNav}
      >
        {children}
      </DashboardShell>
    </div>
  );
}
