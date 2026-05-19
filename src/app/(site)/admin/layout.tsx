import { AccountRoleBadge } from "@/components/account/account-role-badge";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { adminNav } from "@/config/navigation";
import { redirect } from "next/navigation";

import { getProfile } from "@/lib/auth/guards";
import { requireRole } from "@/lib/roles";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { initialsFromDisplayName } from "@/lib/profile-display";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");
  const profile = await getProfile();
  if (!profile) {
    redirect("/auth/login?next=/admin");
  }
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
          badge: (
            <AccountRoleBadge
              role={profile.role}
              labels={{
                roleAdmin: m.header.roleAdmin,
                roleSuperAdmin: m.header.roleSuperAdmin,
              }}
            />
          ),
        }}
        navItems={adminNav}
      >
        {children}
      </DashboardShell>
    </div>
  );
}
