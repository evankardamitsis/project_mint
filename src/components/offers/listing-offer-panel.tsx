import Link from "next/link";

import { OfferForm } from "@/components/offers/offer-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/types/domain";

export function ListingOfferPanel({
  listingId,
  slug,
  currency,
  offersEnabled,
  listingActive,
  viewer,
  isListingSeller,
}: {
  listingId: string;
  slug: string;
  currency: string;
  offersEnabled: boolean;
  listingActive: boolean;
  viewer: Profile | null;
  isListingSeller: boolean;
}) {
  if (!listingActive || !offersEnabled) {
    if (!offersEnabled) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Offers</CardTitle>
            <CardDescription>The seller has disabled offers on this listing.</CardDescription>
          </CardHeader>
        </Card>
      );
    }
    return null;
  }

  if (isListingSeller) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Offers</CardTitle>
          <CardDescription>Manage incoming offers from your seller dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" render={<Link href="/seller/offers" />}>
            Open seller offers
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!viewer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Make an offer</CardTitle>
          <CardDescription>Sign in to negotiate on this listing.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button size="sm" render={<Link href={`/auth/login?next=${encodeURIComponent(`/listing/${slug}`)}`} />}>
            Log in
          </Button>
          <Button size="sm" variant="outline" render={<Link href={`/auth/register?next=${encodeURIComponent(`/listing/${slug}`)}`} />}>
            Register
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Make an offer</CardTitle>
        <CardDescription>
          Submit a price below the listing. The seller can accept, reject, or counter.{" "}
          <Link href="/buyer/offers" className="text-foreground underline underline-offset-2">
            View your offers
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <OfferForm listingId={listingId} currency={currency} />
      </CardContent>
    </Card>
  );
}
