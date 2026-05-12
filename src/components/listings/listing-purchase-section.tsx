import Link from "next/link";

import { buyNowOrderAction } from "@/lib/orders/actions";
import { Price } from "@/components/price";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Profile } from "@/types/domain";
import type { ListingDetailData } from "@/types/listings";

export function ListingPurchaseSection({
  listing,
  viewer,
  isOwnerSeller,
}: {
  listing: ListingDetailData;
  viewer: Profile | null;
  isOwnerSeller: boolean;
}) {
  const status = listing.status;

  if (status === "sold") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sold</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Price amountCents={listing.price_cents} currency={listing.currency} className="text-2xl line-through opacity-60" />
          <p className="text-sm text-muted-foreground">This listing has been sold.</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "reserved") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reserved</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Price amountCents={listing.price_cents} currency={listing.currency} className="text-2xl" />
          <p className="text-sm text-muted-foreground">
            This item is reserved pending checkout. If you have an accepted offer, finish payment from{" "}
            <Link href="/buyer/offers" className="text-foreground underline underline-offset-2">
              your offers
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    );
  }

  if (status !== "active") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Price amountCents={listing.price_cents} currency={listing.currency} className="text-2xl" />
          <p className="text-sm text-muted-foreground">This listing is not available for purchase.</p>
        </CardContent>
      </Card>
    );
  }

  if (isOwnerSeller) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Price</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Price amountCents={listing.price_cents} currency={listing.currency} className="text-2xl" />
          <p className="text-xs text-muted-foreground">Buyers can use Buy now while your listing is active.</p>
          <Button variant="outline" className="w-full" render={<Link href="/seller/orders" />}>
            View your orders
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!viewer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Buy now</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Price amountCents={listing.price_cents} currency={listing.currency} className="text-2xl" />
          <p className="text-xs text-muted-foreground">Sign in to purchase at the listed price (demo checkout — no real payments yet).</p>
          <div className="flex flex-wrap gap-2">
            <Button className="flex-1" render={<Link href={`/auth/login?next=${encodeURIComponent(`/listing/${listing.slug}`)}`} />}>
              Log in
            </Button>
            <Button className="flex-1" variant="outline" render={<Link href={`/auth/register?next=${encodeURIComponent(`/listing/${listing.slug}`)}`} />}>
              Register
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Buy now</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Price amountCents={listing.price_cents} currency={listing.currency} className="text-2xl" />
        <p className="text-xs text-muted-foreground">
          Demo checkout only — no card charges. A 5% platform fee is shown on the order summary.
        </p>
        <form action={buyNowOrderAction} className="space-y-2">
          <input type="hidden" name="listing_id" value={listing.id} />
          <input type="hidden" name="listing_slug" value={listing.slug} />
          <Button type="submit" className="w-full">
            Buy now
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
