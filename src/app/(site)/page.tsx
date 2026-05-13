import { BauhausListingGrid } from "@/components/marketing/bauhaus-listing-grid";
import { HomeHero } from "@/components/marketing/home-hero";
import { HomeTrustBand } from "@/components/marketing/home-trust-band";
import { LiveTicker } from "@/components/marketing/live-ticker";
import { SectionHeader } from "@/components/marketing/section-header";
import { ListingCard } from "@/components/listings/listing-card";
import { getSessionUser } from "@/lib/auth/guards";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { getRecentActivity } from "@/lib/activity/get-recent-activity";
import {
  fetchHomeListings,
  fetchHomeListingsByCategorySlug,
  fetchHomeMarketStats,
} from "@/lib/listings/queries";

function mapListingToCard(
  viewerUserId: string | null,
  item: Awaited<ReturnType<typeof fetchHomeListings>>[number],
  index: number,
) {
  const isGuest = !viewerUserId;
  return (
    <ListingCard
      key={item.id}
      listingId={item.id}
      viewerUserId={viewerUserId}
      sellerOwnerUserId={item.seller_owner_user_id ?? null}
      isSaved={Boolean(item.is_saved_by_current_user)}
      isGuest={isGuest}
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
      categorySlug={item.category_slug ?? null}
      sellerDisplayName={item.seller_display_name}
    />
  );
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = MESSAGES[locale].home;
  const user = await getSessionUser();
  const viewerId = user?.id ?? null;

  const [stats, latest, synths, effects, activity] = await Promise.all([
    fetchHomeMarketStats(),
    fetchHomeListings(6),
    fetchHomeListingsByCategorySlug("synths-keyboards", 3),
    fetchHomeListingsByCategorySlug("effects-pedals", 3),
    getRecentActivity(),
  ]);

  const recentPreview = latest.slice(0, 3).map((item) => ({
    slug: item.slug,
    title: item.title,
    price_cents: item.price_cents,
    currency: item.currency,
  }));

  return (
    <>
      <HomeHero locale={locale} home={t} stats={stats} recentPreview={recentPreview} />
      <HomeTrustBand />
      <LiveTicker items={activity} />

      <section className="px-5 pb-6 pt-5">
        <SectionHeader title={t.latest} seeAllHref="/browse" seeAllLabel={t.seeAll} />
        {latest.length === 0 ? (
          <p className="border border-[#111111] border-t-0 bg-(--color-background-surface) px-4 py-12 text-center text-[12px] text-[#999999]">
            {t.listingsWhenLive}
          </p>
        ) : (
          <BauhausListingGrid>{latest.map((item, index) => mapListingToCard(viewerId, item, index))}</BauhausListingGrid>
        )}
      </section>

      <section className="px-5 pb-6 pt-5">
        <SectionHeader
          title={t.sectionSynths}
          seeAllHref="/browse?category=synths-keyboards"
          seeAllLabel={t.seeAll}
        />
        {synths.length === 0 ? (
          <p className="border border-[#111111] border-t-0 bg-(--color-background-surface) px-4 py-10 text-center text-[12px] text-[#999999]">
            {t.listingsWhenLive}
          </p>
        ) : (
          <BauhausListingGrid>{synths.map((item, index) => mapListingToCard(viewerId, item, index))}</BauhausListingGrid>
        )}
      </section>

      <section className="px-5 pb-6 pt-5">
        <SectionHeader
          title={t.sectionEffects}
          seeAllHref="/browse?category=effects-pedals"
          seeAllLabel={t.seeAll}
        />
        {effects.length === 0 ? (
          <p className="border border-[#111111] border-t-0 bg-(--color-background-surface) px-4 py-10 text-center text-[12px] text-[#999999]">
            {t.listingsWhenLive}
          </p>
        ) : (
          <BauhausListingGrid>{effects.map((item, index) => mapListingToCard(viewerId, item, index))}</BauhausListingGrid>
        )}
      </section>
    </>
  );
}
