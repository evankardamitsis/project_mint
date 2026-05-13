import Link from "next/link";

import { HomeHeroCollage } from "@/components/marketing/home-hero-collage";
import { HomeTrustBand } from "@/components/marketing/home-trust-band";
import { ListingCard } from "@/components/listings/listing-card";
import { SITE_CONTAINER } from "@/config/site-layout";
import { fetchHomeListings } from "@/lib/listings/queries";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const listings = await fetchHomeListings(12);
  const collageItems = listings.slice(0, 4).map((l) => ({
    imageUrl: l.primary_image_url,
    title: l.title,
  }));

  return (
    <>
      <section className="w-full bg-[#F7F6F3] px-6 py-12 lg:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
          <div className="w-full lg:w-1/2">
            <h1 className="whitespace-pre-line text-[52px] font-black leading-[1.05] tracking-[-0.03em] text-[#111111] lg:text-[72px]">
              {"Buy and sell\nprotected gear."}
            </h1>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-[#6B6B6B]">
              Second-hand music gear and collectibles — with payment protection, proof photos, and tracked delivery.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/browse"
                className="inline-flex rounded-full bg-[#111111] px-8 py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
              >
                Browse gear
              </Link>
              <Link
                href="/sell"
                className="inline-flex px-8 py-4 text-base font-semibold text-[#111111] transition-opacity hover:opacity-80"
              >
                Start selling
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <HomeHeroCollage items={collageItems} />
          </div>
        </div>
      </section>

      <HomeTrustBand />

      <div className={cn(SITE_CONTAINER, "flex flex-col gap-10 py-10 sm:gap-12 sm:py-12")}>
        <div className="flex items-end justify-between gap-3">
          <h2 className="heading text-ink">Latest listings</h2>
          <Link href="/browse" className="text-sm font-semibold text-mint hover:underline">
            See all
          </Link>
        </div>
        {listings.length === 0 ? (
          <p className="rounded-2xl bg-surface px-4 py-12 text-center text-sm text-text-muted shadow-sm">
            Listings will show up here once sellers go live.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {listings.map((item, index) => (
              <ListingCard
                key={item.id}
                title={item.title}
                slug={item.slug}
                priceCents={item.price_cents}
                currency={item.currency}
                condition={item.condition}
                location={item.location}
                imageUrl={item.primary_image_url}
                imagePriority={index < 4}
                protectedDeliveryEnabled={item.protected_delivery_enabled}
                categoryName={item.category_name}
                sellerDisplayName={item.seller_display_name}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
