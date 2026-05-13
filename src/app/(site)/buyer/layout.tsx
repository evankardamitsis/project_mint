import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { buyerNav } from "@/config/navigation";
import { requireRole } from "@/lib/auth/guards";
import { initialsFromDisplayName } from "@/lib/profile-display";

export default async function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["buyer", "seller", "admin"], { nextAfterLogin: "/buyer" });
  const heading =
    profile.full_name?.trim() || profile.email?.trim() || "Your account";

  return (
    <DashboardShell
      sidebar={{
        initials: initialsFromDisplayName(heading),
        heading,
        description: "Track purchases, offers, and deliveries from one place.",
      }}
      navItems={buyerNav}
    >
      {children}
    </DashboardShell>
  );
}
