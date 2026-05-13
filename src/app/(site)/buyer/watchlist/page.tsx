import Link from "next/link";
import { Heart } from "lucide-react";

import { BauhausListingGrid } from "@/components/marketing/bauhaus-listing-grid";
import { EmptyState } from "@/components/empty-state";
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
        <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-black uppercase tracking-[-0.04em] text-[#111111]">{w.title}</h1>
      </header>

      {listings.length === 0 ? (
        <EmptyState icon={Heart} title={w.emptyTitle} description={w.emptyDescription}>
          <Button className="bg-mint px-6 font-semibold text-white hover:bg-mint/90" render={<Link href="/browse" />}>
            {w.browseCta}
          </Button>
        </EmptyState>
      ) : (
        <div className="px-5">
          <BauhausListingGrid className="border-t-0">
            {listings.map((item, index) => (
              <ListingCard
                key={item.id}
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
                imagePriority={index < 4}
                protectedDeliveryEnabled={item.protected_delivery_enabled}
                status={item.status}
                categoryName={item.category_name}
                categorySlug={item.category_slug ?? null}
                sellerDisplayName={item.seller_display_name}
              />
            ))}
          </BauhausListingGrid>
        </div>
      )}
    </div>
  );
}
