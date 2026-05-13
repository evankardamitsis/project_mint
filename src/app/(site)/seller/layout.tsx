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
      description="Listings, orders, and offers — wired to Supabase in a later milestone."
      navItems={sellerNav}
    >
      {children}
    </DashboardShell>
  );
}
