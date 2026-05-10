import Link from "next/link";

import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import { fetchHomeListings } from "@/lib/listings/queries";

export default async function HomePage() {
  const listings = await fetchHomeListings(8);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 sm:py-16">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
        <div className="space-y-6">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Greece · second-hand music gear
          </p>
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Buy and sell gear with confidence.
          </h1>
          <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Project Mint is a protected marketplace: sellers document packaging and
            condition, add tracking, and buyers have a short dispute window after
            delivery — starting with music gear in Greece.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" render={<Link href="/browse" />}>
              Browse listings
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/sell" />}>
              Start selling
            </Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {listings.length === 0 ? (
            <p className="col-span-full text-sm text-muted-foreground">
              Listings will appear here once sellers publish active inventory.
            </p>
          ) : (
            listings.slice(0, 2).map((item, index) => (
              <ListingCard
                key={item.id}
                title={item.title}
                slug={item.slug}
                priceCents={item.price_cents}
                currency={item.currency}
                condition={item.condition}
                location={item.location}
                imageUrl={item.primary_image_url}
                imagePriority={index === 0}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
