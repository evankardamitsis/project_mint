import Link from "next/link";

import { HomeHeroCollage } from "@/components/marketing/home-hero-collage";
import { HomeTrustBand } from "@/components/marketing/home-trust-band";
import { ListingCard } from "@/components/listings/listing-card";
import { SITE_CONTAINER } from "@/config/site-layout";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { fetchHomeListings } from "@/lib/listings/queries";
import { cn } from "@/lib/utils";

const HERO_GUITAR_IMAGE =
  "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=900&q=80&auto=format&fit=crop";

const HERO_LISTING_SLUGS = [
  "demo-pm-chase-bliss-mood",
  "demo-pm-vox-ac15",
  "demo-pm-pioneer-djm750",
] as const;

export default async function HomePage() {
  const locale = await getLocale();
  const t = MESSAGES[locale].home;

  const listings = await fetchHomeListings(36);
  const bySlug = new Map(listings.map((l) => [l.slug, l.primary_image_url]));

  const heroCells = [
    { imageUrl: HERO_GUITAR_IMAGE, title: t.heroLine1 },
    ...HERO_LISTING_SLUGS.map((slug) => ({
      imageUrl: bySlug.get(slug) ?? null,
      title: listings.find((l) => l.slug === slug)?.title ?? "",
    })),
  ];

  return (
    <>
      <section className="w-full bg-[#F7F6F3] px-6 py-12 lg:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-10 lg:flex-row lg:items-center lg:gap-16">
          <div className="w-full lg:w-1/2">
            <h1 className="whitespace-pre-line text-[52px] font-black leading-[1.05] tracking-[-0.03em] text-[#111111] lg:text-[72px]">
              {`${t.heroLine1}\n${t.heroLine2}`}
            </h1>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-[#6B6B6B]">{t.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/browse"
                className="inline-flex h-14 min-w-[10rem] items-center justify-center rounded-full bg-[#111111] px-8 text-base font-bold text-white transition-opacity hover:opacity-90"
              >
                {t.browseGear}
              </Link>
              <Link
                href="/sell"
                className="inline-flex h-14 min-w-[10rem] items-center justify-center rounded-full border-2 border-[#111111] bg-transparent px-8 text-base font-semibold text-[#111111] transition-colors hover:bg-[#111111]/5"
              >
                {t.startSelling}
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <HomeHeroCollage cells={heroCells} />
          </div>
        </div>
      </section>

      <HomeTrustBand />

      <div className={cn(SITE_CONTAINER, "flex flex-col gap-10 py-10 sm:gap-12 sm:py-12")}>
        <div className="flex items-end justify-between gap-3">
          <h2 className="heading text-ink">{t.latest}</h2>
          <Link href="/browse" className="text-sm font-semibold text-mint hover:underline">
            {t.seeAll}
          </Link>
        </div>
        {listings.length === 0 ? (
          <p className="rounded-2xl bg-surface px-4 py-12 text-center text-sm text-text-muted shadow-sm">
            {t.listingsWhenLive}
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
