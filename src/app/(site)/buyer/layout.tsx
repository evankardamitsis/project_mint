import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { buyerNav } from "@/config/navigation";
import { requireRole } from "@/lib/auth/guards";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { initialsFromDisplayName } from "@/lib/profile-display";

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["buyer", "seller", "admin"], { nextAfterLogin: "/buyer" });
  const locale = await getLocale();
  const m = MESSAGES[locale];
  const heading =
    profile.full_name?.trim() || profile.email?.trim() || m.dashboard.buyerAccountFallback;

  return (
    <DashboardShell
      sidebar={{
        initials: initialsFromDisplayName(heading),
        heading,
        description: m.dashboard.buyer,
      }}
      navItems={buyerNav}
    >
      {children}
    </DashboardShell>
  );
}
