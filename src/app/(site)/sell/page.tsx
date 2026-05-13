import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SITE_CONTAINER } from "@/config/site-layout";
import { getProfile } from "@/lib/auth/guards";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

export default async function SellPage() {
  const profile = await getProfile();

  return (
    <div className={cn(SITE_CONTAINER, "space-y-8 bg-background py-10")}>
      <PageHeader
        title="Sell on mint."
        description="List second-hand gear with optional protected delivery: packaging checklist, photos, tracking, and a buyer dispute window after delivery."
        actions={
          profile?.role === "seller" ? (
            <Button render={<Link href="/seller/listings/new" />}>New listing</Button>
          ) : (
            <Button variant="outline" disabled title="Create a seller account to list gear">
              Seller access
            </Button>
          )
        }
      />
      <EmptyState
        icon={Package}
        title="Open your shop on mint."
        description="Create a seller profile, add payout details when you are ready, and publish listings for review — there is no fee to list."
      >
        {profile?.role === "seller" ? (
          <Button variant="outline" render={<Link href="/seller" />}>
            Seller hub
          </Button>
        ) : (
          <Button variant="outline" render={<Link href="/auth/register" />}>
            Create an account
          </Button>
        )}
      </EmptyState>
    </div>
  );
}
