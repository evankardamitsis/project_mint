import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { sellerNav } from "@/config/navigation";
import { requireRole } from "@/lib/auth/guards";
import { fetchSellerProfileForUser } from "@/lib/listings/queries";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { initialsFromDisplayName } from "@/lib/profile-display";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["seller", "admin"], { nextAfterLogin: "/seller" });
  const locale = await getLocale();
  const m = MESSAGES[locale];
  const seller = await fetchSellerProfileForUser();
  const heading = seller?.display_name?.trim() || m.dashboard.sellerShopFallback;

  return (
    <DashboardShell
      sidebar={{
        initials: initialsFromDisplayName(heading),
        heading,
        description: m.dashboard.seller,
      }}
      navItems={sellerNav}
    >
      {children}
    </DashboardShell>
  );
}
