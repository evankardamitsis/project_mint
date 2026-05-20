import { Lock, Camera, ShieldCheck } from "lucide-react";

import { BauhausListingGrid } from "@/components/marketing/bauhaus-listing-grid";
import { HomeHero } from "@/components/marketing/home-hero";
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
      isFollowed={Boolean(item.is_followed_by_current_user)}
      sellerTier={item.seller_tier ?? null}
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
      latestPriceDropPercent={item.latest_price_drop_percent ?? null}
      latestPriceDropOldPriceCents={item.latest_price_drop_old_price_cents ?? null}
      latestPriceDropCreatedAt={item.latest_price_drop_created_at ?? null}
    />
  );
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = MESSAGES[locale].home;
  const user = await getSessionUser();
  const viewerId = user?.id ?? null;

  const [latest, synths, effects, activity] = await Promise.all([
    fetchHomeListings(6),
    fetchHomeListingsByCategorySlug("synths-keyboards", 3),
    fetchHomeListingsByCategorySlug("effects-pedals", 3),
    getRecentActivity(),
  ]);

  return (
    <>
      <HomeHero />

      {/* USP cards */}
      <section className="border-b border-[#EEECE8] bg-[#FAFAF8] pb-10 pt-4">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-4 px-6 md:grid-cols-3 lg:px-10">
          <div className="overflow-hidden rounded-2xl border border-[#E4E2DC] bg-white p-8 transition-all hover:border-[#1D9E75] hover:shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F7F1]">
              <Lock className="size-6 text-[#1a7a4a]" strokeWidth={2} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#111111]">Ασφαλής πληρωμή</h3>
            <p className="text-sm leading-relaxed text-[#555555]">
              Τα χρήματά σου κρατούνται σε αναμονή μέχρι να επιβεβαιώσεις ότι έλαβες το προϊόν σε καλή κατάσταση.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#E4E2DC] bg-white p-8 transition-all hover:border-[#1D9E75] hover:shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F7F1]">
              <Camera className="size-6 text-[#1a7a4a]" strokeWidth={2} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#111111]">Φωτογραφίες αποστολής</h3>
            <p className="text-sm leading-relaxed text-[#555555]">
              Ο πωλητής φωτογραφίζει το προϊόν πριν την αποστολή — απόδειξη κατάστασης για αγοραστή και πωλητή.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#E4E2DC] bg-white p-8 transition-all hover:border-[#1D9E75] hover:shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F7F1]">
              <ShieldCheck className="size-6 text-[#1a7a4a]" strokeWidth={2} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[#111111]">Προστατευμένη συναλλαγή</h3>
            <p className="text-sm leading-relaxed text-[#555555]">
              Αν κάτι δεν πάει καλά, η mint παρεμβαίνει και διασφαλίζει δίκαιη έκβαση για σένα και τον πωλητή.
            </p>
          </div>
        </div>
      </section>

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
