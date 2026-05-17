import Link from "next/link";

import { buyNowOrderAction } from "@/lib/orders/actions";
import { Price } from "@/components/price";
import { formatEuroPrefix } from "@/lib/utils";
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
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Sold</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Price amountCents={listing.price_cents} currency={listing.currency} className="text-2xl line-through opacity-60" />
          <p className="text-sm text-ink-2">This listing has been sold.</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "reserved") {
    return (
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Reserved</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Price amountCents={listing.price_cents} currency={listing.currency} className="text-2xl" />
          <p className="text-sm text-ink-2">
            This item is reserved pending checkout. If you have an accepted offer, finish payment from{" "}
            <Link href="/buyer/offers" className="font-medium text-ink underline underline-offset-2">
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
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Price</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Price amountCents={listing.price_cents} currency={listing.currency} className="text-2xl" />
          <p className="text-sm text-ink-2">This listing is not available for purchase.</p>
        </CardContent>
      </Card>
    );
  }

  if (isOwnerSeller) {
    return (
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Price</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Price amountCents={listing.price_cents} currency={listing.currency} className="text-2xl" />
          <p className="text-xs text-ink-2">Buyers can use Buy now while your listing is active.</p>
          <Button variant="outline" className="w-full" render={<Link href="/seller/orders" />}>
            View your orders
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!viewer) {
    return (
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Buy now</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Price amountCents={listing.price_cents} currency={listing.currency} className="text-2xl" />
          <p className="text-xs text-ink-2">Sign in to purchase at the listed price (demo checkout — no real payments yet).</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" className="flex-1" render={<Link href={`/auth/login?next=${encodeURIComponent(`/listing/${listing.slug}`)}`} />}>
              Log in
            </Button>
            <Button className="flex-1" render={<Link href={`/auth/register?next=${encodeURIComponent(`/listing/${listing.slug}`)}`} />}>
              Register
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const priceLabel =
    listing.currency === "EUR"
      ? formatEuroPrefix(listing.price_cents)
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: listing.currency,
          minimumFractionDigits: listing.price_cents % 100 === 0 ? 0 : 2,
          maximumFractionDigits: 2,
        }).format(listing.price_cents / 100);

  return (
    <div className="space-y-3">
      <form action={buyNowOrderAction}>
        <input type="hidden" name="listing_id" value={listing.id} />
        <input type="hidden" name="listing_slug" value={listing.slug} />
        <button
          type="submit"
          className="w-full rounded-2xl bg-[#111111] py-5 text-lg font-black text-white transition-colors hover:bg-[#222222]"
        >
          Αγόρασε τώρα ({priceLabel})
        </button>
      </form>
      <p className="text-center text-xs text-[#AAAAAA]">
        Demo checkout — no real charges.
      </p>
    </div>
  );
}
