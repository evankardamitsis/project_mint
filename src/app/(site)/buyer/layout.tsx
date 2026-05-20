import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { redirect } from "next/navigation";

import { getProfile, requireUser } from "@/lib/auth/guards";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { initialsFromDisplayName } from "@/lib/profile-display";

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser("/buyer");
  const profile = await getProfile();
  if (!profile) {
    redirect("/auth/login?next=/buyer");
  }
  const locale = await getLocale();
  const m = MESSAGES[locale];
  const heading =
    profile.full_name?.trim() || profile.email?.trim() || m.dashboard.buyerAccountFallback;

  const navItems = [
    { href: "/buyer", label: m.buyerNav.overview },
    { href: "/buyer/purchases", label: m.buyerNav.purchases },
    { href: "/buyer/offers", label: m.buyerNav.offers },
    { href: "/buyer/follows", label: m.buyerNav.follows },
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
