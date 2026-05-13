import Link from "next/link";

import { SellerProfileForm } from "@/components/sellers/seller-profile-form";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchSellerProfileForUser } from "@/lib/listings/queries";

export default async function SellerProfilePage() {
  const profile = await fetchSellerProfileForUser();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Seller profile"
        description="Your public seller identity and verification status."
        actions={
          <Button size="sm" variant="outline" render={<Link href="/seller" />}>
            Back to dashboard
          </Button>
        }
      />

      {profile ? (
        <Card className="border-border/80">
          <CardContent className="grid gap-6 pt-6 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Verification</span>
              <StatusBadge domain="seller_verification" value={profile.verification_status} />
            </div>
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Payout</span>
              <StatusBadge domain="seller_payout" value={profile.payout_status} />
              <Link
                href="#"
                className="inline-flex text-sm font-semibold text-mint underline-offset-4 hover:underline"
              >
                Set up payout →
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-dashed border-border bg-muted/30">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Marketplace visibility</p>
          <p className="mt-2">
            Listings are only shown on Browse once they are approved and active. Verified sellers build trust with buyers
            and appear more prominently in search.
          </p>
        </CardContent>
      </Card>

      <SellerProfileForm initial={profile} mode={profile ? "edit" : "create"} />
    </div>
  );
}
