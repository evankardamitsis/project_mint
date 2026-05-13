import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { buyerNav } from "@/config/navigation";
import { requireRole } from "@/lib/auth/guards";

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["buyer", "seller", "admin"], { nextAfterLogin: "/buyer" });

  return (
    <DashboardShell
      title="Buyer"
      description="Track purchases, offers, and deliveries from one place."
      navItems={buyerNav}
    >
      {children}
    </DashboardShell>
  );
}
