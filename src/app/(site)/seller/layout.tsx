import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { sellerNav } from "@/config/navigation";
import { requireRole } from "@/lib/auth/guards";
import { fetchSellerProfileForUser } from "@/lib/listings/queries";
import { initialsFromDisplayName } from "@/lib/profile-display";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["seller", "admin"], { nextAfterLogin: "/seller" });
  const seller = await fetchSellerProfileForUser();
  const heading = seller?.display_name?.trim() || "Your shop";

  return (
    <DashboardShell
      sidebar={{
        initials: initialsFromDisplayName(heading),
        heading,
        description: "Manage listings, orders, offers, and your shop in one place.",
      }}
      navItems={sellerNav}
    >
      {children}
    </DashboardShell>
  );
}
