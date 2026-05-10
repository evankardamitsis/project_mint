import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { buyerNav } from "@/config/navigation";
import { requireRole } from "@/lib/auth/guards";

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(["buyer"], { nextAfterLogin: "/buyer" });

  return (
    <DashboardShell
      title="Buyer"
      description="Purchases, offers, and post-delivery disputes — data layer coming next."
      navItems={buyerNav}
    >
      {children}
    </DashboardShell>
  );
}
