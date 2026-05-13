import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { sellerNav } from "@/config/navigation";
import { requireRole } from "@/lib/auth/guards";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["seller", "admin"], { nextAfterLogin: "/seller" });

  return (
    <DashboardShell
      title="Seller"
      description="Manage listings, orders, offers, and your shop in one place."
      navItems={sellerNav}
    >
      {children}
    </DashboardShell>
  );
}
