import { DashboardShell } from "@/components/dashboard/dashboard-shell";
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

  const navItems = [
    { href: "/buyer", label: m.buyerNav.overview },
    { href: "/buyer/purchases", label: m.buyerNav.purchases },
    { href: "/buyer/offers", label: m.buyerNav.offers },
    { href: "/buyer/watchlist", label: m.buyerNav.watchlist },
    { href: "/buyer/alerts", label: m.buyerNav.alerts },
  ] as const;

  return (
    <DashboardShell
      sidebar={{
        initials: initialsFromDisplayName(heading),
        heading,
        description: m.dashboard.buyer,
      }}
      navItems={navItems}
    >
      {children}
    </DashboardShell>
  );
}
