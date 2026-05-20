import Link from "next/link";
import { Heart, TrendingDown } from "lucide-react";

import { BauhausListingGrid } from "@/components/marketing/bauhaus-listing-grid";
import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/guards";
import { fetchBuyerWatchlistListings } from "@/lib/favorites/queries";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";

export default async function BuyerWatchlistPage() {
  const locale = await getLocale();
  const w = MESSAGES[locale].buyerWatchlist;
  const [user, listings] = await Promise.all([getSessionUser(), fetchBuyerWatchlistListings()]);
  const viewerId = user?.id ?? null;
  const isGuest = !viewerId;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-black uppercase tracking-[-0.04em] text-[#111111]">
          {w.title}
        </h1>
      </header>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F6F3]">
            <Heart className="h-8 w-8 text-[#ABABAB]" aria-hidden />
          </div>
          <h3 className="mb-2 text-base font-semibold text-[#111111]">Δεν παρακολουθείς αγγελίες ακόμη</h3>
          <p className="max-w-sm text-sm leading-relaxed text-[#6B6B6B]">
            Πάτα ♥ σε οποιαδήποτε αγγελία για να τη βλέπεις εδώ και να ειδοποιείσαι για μειώσεις τιμής.
          </p>
          <Button
            className="mt-6 bg-mint px-6 font-semibold text-white hover:bg-mint/90"
            render={<Link href="/browse" />}
          >
            {w.browseCta}
          </Button>
        </div>
      ) : (
        <div className="space-y-6 px-5">
          {listings.map((item) => {
            const hasPriceDrop =
              typeof item.latest_price_drop_percent === "number" &&
              item.latest_price_drop_percent <= -5;
            return (
              <div key={item.id} className="space-y-2">
                {hasPriceDrop ? (
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-[#FEF3E2] px-2 py-0.5 text-[10px] font-bold text-[#C47A15]">
                      <TrendingDown className="h-3 w-3" aria-hidden />
                      Μείωση τιμής
                    </span>
                  </div>
                ) : null}
                <BauhausListingGrid className="border-t-0">
                  <ListingCard
                    listingId={item.id}
                    viewerUserId={viewerId}
                    sellerOwnerUserId={item.seller_owner_user_id ?? null}
                    isSaved
                    isGuest={isGuest}
                    title={item.title}
                    slug={item.slug}
                    priceCents={item.price_cents}
                    currency={item.currency}
                    condition={item.condition}
                    location={item.location}
                    imageUrl={item.primary_image_url}
                    protectedDeliveryEnabled={item.protected_delivery_enabled}
                    status={item.status}
                    categoryName={item.category_name}
                    categorySlug={item.category_slug ?? null}
                    sellerDisplayName={item.seller_display_name}
                    sellerTier={item.seller_tier ?? null}
                    latestPriceDropPercent={item.latest_price_drop_percent ?? null}
                    latestPriceDropOldPriceCents={item.latest_price_drop_old_price_cents ?? null}
                    latestPriceDropCreatedAt={item.latest_price_drop_created_at ?? null}
                    watchlistSavedAt={item.watchlist_saved_at ?? null}
                  />
                </BauhausListingGrid>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
