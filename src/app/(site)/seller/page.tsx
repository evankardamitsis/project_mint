import Link from "next/link";
import { Plus, Package, UserRound } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ListingCard } from "@/components/listings/listing-card";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import {
  fetchSellerHubCounts,
  fetchSellerListingStats,
  fetchSellerListings,
  fetchSellerProfileForUser,
} from "@/lib/listings/queries";

export default async function SellerHomePage() {
  const seller = await fetchSellerProfileForUser();

  const locale = await getLocale();
  const s = MESSAGES[locale].sellerHub;

  if (!seller) {
    return (
      <div className="space-y-8">
        <div className="-mx-4 rounded-2xl bg-[#111111] px-6 py-8 text-white sm:-mx-6">
          <h1 className="text-2xl font-black uppercase tracking-tight">{s.noProfileHeroTitle}</h1>
          <p className="mt-2 text-sm text-white/75">{s.noProfileHeroSubtitle}</p>
        </div>
        <EmptyState
          icon={UserRound}
          title={s.noProfileEmptyTitle}
          description={s.noProfileEmptyDesc}
        >
          <Button render={<Link href="/seller/profile" />}>{s.setupProfileBtn}</Button>
        </EmptyState>
      </div>
    );
  }

  const [stats, listings, hub] = await Promise.all([
    fetchSellerListingStats(seller.id),
    fetchSellerListings(seller.id),
    fetchSellerHubCounts(seller.id),
  ]);
  const recent = listings.slice(0, 6);

  const statsFooter = s.statsFooter
    .replace("{pending}", String(stats.pending_review))
    .replace("{sold}", String(stats.sold))
    .replace("{total}", String(stats.total));

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-6 py-8 lg:px-10">
      <div className="mb-6 rounded-2xl bg-[#111111] px-6 py-8 text-white">
        <p className="text-sm font-medium text-white/80">{seller.display_name}</p>
        <h1 className="mt-1 text-2xl font-black uppercase tracking-tight sm:text-3xl">{s.heroTitle}</h1>
        <p className="mt-2 max-w-xl text-sm text-white/70">{s.heroSubtitle}</p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/10 px-3 py-4 text-center">
            <p className="text-2xl font-black tabular-nums">{stats.active}</p>
            <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white/65">{s.statLive}</p>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-4 text-center">
            <p className="text-2xl font-black tabular-nums">{hub.activeOffers}</p>
            <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white/65">{s.statOffers}</p>
          </div>
          <div className="rounded-xl bg-white/10 px-3 py-4 text-center">
            <p className="text-2xl font-black tabular-nums">{hub.activeOrders}</p>
            <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white/65">{s.statOrders}</p>
          </div>
        </div>
        <p className="mt-4 text-xs text-white/55">{statsFooter}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button size="sm" className="bg-mint text-white hover:bg-mint/90" render={<Link href="/seller/listings/new" />}>
            <Plus className="size-4" />
            {s.newListingBtn}
          </Button>
          <Button size="sm" variant="outline" className="border-white/25 bg-transparent text-white hover:bg-white/10" render={<Link href="/seller/listings" />}>
            {s.allListingsBtn}
          </Button>
          <Button size="sm" variant="outline" className="border-white/25 bg-transparent text-white hover:bg-white/10" render={<Link href="/seller/orders" />}>
            {s.ordersBtn}
          </Button>
          <Button size="sm" variant="outline" className="border-white/25 bg-transparent text-white hover:bg-white/10" render={<Link href="/seller/offers" />}>
            {s.offersBtn}
          </Button>
          <Button size="sm" variant="outline" className="border-white/25 bg-transparent text-white hover:bg-white/10" render={<Link href="/seller/profile" />}>
            {s.profileBtn}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl bg-[var(--color-background-surface)] p-5 shadow-sm ring-1 ring-[#e0ddd8]/70">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            <StatusBadge domain="seller_verification" value={seller.verification_status} />
            <span className="text-[#111111]">
              <span className="font-semibold">{seller.display_name}</span>
              {seller.location ? ` · ${seller.location}` : null}
            </span>
          </div>
          <Button size="sm" variant="outline" className="border-[#e0ddd8]" render={<Link href="/seller/profile" />}>
            {s.editProfileBtn}
          </Button>
        </div>
      </div>

      <div className="space-y-4 pt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#111111]">{s.onShelfTitle}</h2>
          <Button variant="ghost" size="sm" className="text-[var(--color-text-secondary)] hover:text-[#111111]" render={<Link href="/seller/listings" />}>
            {s.viewAllBtn}
          </Button>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={Package}
            title={s.noListingsTitle}
            description={s.noListingsDesc}
            tone="selling"
          >
            <Button render={<Link href="/seller/listings/new" />}>{s.createListingBtn}</Button>
          </EmptyState>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {recent.map((row, index) => (
              <ListingCard
                key={row.id}
                title={row.title}
                slug={row.slug}
                priceCents={row.price_cents}
                currency={row.currency}
                condition={row.condition}
                location={row.location}
                imageUrl={row.primary_image_url}
                imagePriority={index < 3}
                status={row.status}
                protectedDeliveryEnabled={row.protected_delivery_enabled}
                categoryName={row.category_name}
                categorySlug={row.category_slug ?? null}
                sellerDisplayName={row.seller_display_name ?? seller.display_name}
                latestPriceDropPercent={row.latest_price_drop_percent ?? null}
                latestPriceDropOldPriceCents={row.latest_price_drop_old_price_cents ?? null}
                latestPriceDropCreatedAt={row.latest_price_drop_created_at ?? null}
                footer={
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge domain="listing" value={row.status} />
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
