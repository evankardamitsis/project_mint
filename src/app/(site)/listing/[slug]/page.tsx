import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

import { ListingBuyerCtaStack } from "@/components/listings/listing-buyer-cta-stack";
import { ListingGallery } from "@/components/listings/listing-gallery";
import { ListingManagementPanel } from "@/components/listings/listing-management-panel";
import { ListingPurchaseSection } from "@/components/listings/listing-purchase-section";
import { ListingOfferPanel } from "@/components/offers/listing-offer-panel";
import { ListingProtectedDeliveryTrustDetail } from "@/components/listings/listing-protected-delivery-trust-detail";
import { ListingStickyCta } from "@/components/listings/listing-sticky-cta";
import { ListingDetailSaveButton } from "@/components/listings/listing-detail-save-button";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/lib/auth/guards";
import { SITE_CONTAINER } from "@/config/site-layout";
import { fetchListingWatcherCount } from "@/lib/favorites/queries";
import { fetchListingBySlug, fetchSellerProfileForUser } from "@/lib/listings/queries";
import { cn, formatEuroPrefix } from "@/lib/utils";
import type { ListingCondition } from "@/types/domain";

type PageProps = { params: Promise<{ slug: string }> };

const shortCondition: Record<ListingCondition, string> = {
  brand_new: "New",
  mint: "Like new",
  excellent: "Excellent",
  very_good: "Very good",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
  non_functioning: "Parts",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function conditionDotClass(c: ListingCondition) {
  if (["brand_new", "mint", "excellent", "very_good"].includes(c)) {
    return "bg-mint";
  }
  if (c === "good") {
    return "bg-amber";
  }
  return "bg-danger";
}

function sellerSubline(sales: number | null | undefined, rating: number | null | undefined) {
  const s = typeof sales === "number" && !Number.isNaN(sales) ? sales : 0;
  const r = typeof rating === "number" && !Number.isNaN(rating) ? rating : null;
  if (s > 0 && r != null) {
    const stars = Number.isInteger(r) ? String(r) : r.toFixed(1);
    return `${s} sales · ${stars} ★`;
  }
  if (s > 0) {
    return `${s} sales`;
  }
  return "Verified seller";
}

export default async function ListingPage(props: PageProps) {
  const { slug } = await props.params;
  const listing = await fetchListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const [profile, sellerSelf] = await Promise.all([
    getProfile(),
    fetchSellerProfileForUser(),
  ]);

  const isAdmin = profile?.role === "admin";
  const isOwnerSeller = Boolean(sellerSelf?.id === listing.seller_id);
  const showWatcher = isOwnerSeller || isAdmin;
  const watcherCount = showWatcher ? await fetchListingWatcherCount(listing.id) : 0;

  const showManagement = isAdmin || isOwnerSeller;
  const showMobileSticky =
    listing.status === "active" && !isOwnerSeller && !isAdmin;
  const stickyMode = !showMobileSticky ? "none" : profile ? "buy" : "login";

  const priceStr =
    listing.currency === "EUR"
      ? formatEuroPrefix(listing.price_cents)
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: listing.currency,
          minimumFractionDigits: listing.price_cents % 100 === 0 ? 0 : 2,
          maximumFractionDigits: 2,
        }).format(listing.price_cents / 100);

  const loginNextPath = `/listing/${listing.slug}`;

  return (
    <div className={cn("w-full", showMobileSticky && "pb-24 lg:pb-0")}>
      <div className={cn(SITE_CONTAINER, "py-0 lg:py-10")}>
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12">
          <div className="lg:sticky lg:top-6 lg:w-[55%]">
            <div className="relative -mx-5 sm:-mx-8 lg:mx-0">
              <div className="absolute left-4 top-4 z-20 lg:left-4 lg:top-4">
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="border-0 bg-white/90 text-ink shadow-md backdrop-blur-sm hover:bg-white"
                  render={<Link href="/browse" aria-label="Back" />}
                >
                  <ArrowLeft className="size-5" />
                </Button>
              </div>
              <div className="absolute right-4 top-4 z-20 lg:right-4 lg:top-4">
                <ListingDetailSaveButton
                  listingId={listing.id}
                  initialSaved={listing.is_saved_by_current_user}
                  isGuest={!profile}
                  isOwner={isOwnerSeller}
                  loginNextPath={loginNextPath}
                />
              </div>
              <ListingGallery
                title={listing.title}
                images={listing.images}
                bleed
                detailLayout
              />
            </div>
          </div>

          <div className="min-w-0 flex-1 bg-white pt-5 lg:w-[45%] lg:bg-transparent lg:pt-0 lg:pl-10">
            <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:overflow-y-auto lg:pb-4">
              <h1 className="text-pretty text-2xl font-black leading-tight tracking-tight text-[#111111] lg:text-3xl">
                {listing.title}
              </h1>
              <p className="price-hero mt-2 text-[#111111] tabular-nums">
                {priceStr}
              </p>
              {listing.status === "active" &&
              typeof listing.latest_price_drop_percent === "number" &&
              listing.latest_price_drop_percent <= -5 ? (
                <p className="mt-2 text-sm font-semibold text-[#0A5C43]">
                  {listing.latest_price_drop_old_price_cents != null ? (
                    <>
                      Price dropped from{" "}
                      <span className="tabular-nums">
                        {listing.currency === "EUR"
                          ? formatEuroPrefix(listing.latest_price_drop_old_price_cents)
                          : new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: listing.currency,
                              minimumFractionDigits: listing.latest_price_drop_old_price_cents % 100 === 0 ? 0 : 2,
                              maximumFractionDigits: 2,
                            }).format(listing.latest_price_drop_old_price_cents / 100)}
                      </span>
                    </>
                  ) : (
                    <>Price dropped {Math.round(Math.abs(listing.latest_price_drop_percent))}%</>
                  )}
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span className={cn("inline-flex size-2 shrink-0 rounded-full", conditionDotClass(listing.condition))} aria-hidden />
                <span className="font-semibold text-mint">{shortCondition[listing.condition]}</span>
                <span className="text-ink-3">·</span>
                <span className="text-ink-3">{listing.location?.trim() || "—"}</span>
                {showWatcher ? (
                  <>
                    <span className="text-ink-3">·</span>
                    <span className="text-ink-3 tabular-nums">
                      {watcherCount === 1 ? "1 watching" : `${watcherCount} watching`}
                    </span>
                  </>
                ) : null}
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-[#F7F6F3] p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E8F7F1] text-sm font-bold text-[#0A5C43]">
                  {initials(listing.seller_display_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{listing.seller_display_name}</p>
                  <p className="text-xs text-ink-3">
                    {sellerSubline(listing.seller_sales_count, listing.seller_rating)}
                  </p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-ink-3" aria-hidden />
              </div>

              {listing.protected_delivery_enabled ? <ListingProtectedDeliveryTrustDetail /> : null}

              {listing.description ? (
                <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-[#444444]">{listing.description}</p>
              ) : null}

              {showMobileSticky && stickyMode !== "none" ? (
                <div className="mt-8 hidden lg:flex lg:flex-col lg:gap-3">
                  <ListingBuyerCtaStack
                    mode={stickyMode}
                    listingId={listing.id}
                    slug={listing.slug}
                    priceCents={listing.price_cents}
                    currency={listing.currency}
                    offersEnabled={listing.offers_enabled}
                    loginNextPath={loginNextPath}
                    direction="col"
                  />
                </div>
              ) : null}

              {!showMobileSticky ? (
                <div className="mt-6">
                  <ListingPurchaseSection listing={listing} viewer={profile} isOwnerSeller={isOwnerSeller} />
                </div>
              ) : null}

              <section id="offers" className="scroll-mt-24 pb-8 pt-10">
                <ListingOfferPanel
                  listingId={listing.id}
                  slug={listing.slug}
                  currency={listing.currency}
                  offersEnabled={listing.offers_enabled}
                  listingActive={listing.status === "active"}
                  viewer={profile}
                  isListingSeller={isOwnerSeller}
                />
              </section>
            </div>
          </div>
        </div>

        {showManagement ? (
          <div className="mt-10 w-full rounded-xl border border-dashed border-border bg-[#F7F6F3]/80 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-3">Seller / admin</p>
            <ListingManagementPanel
              listingId={listing.id}
              slug={listing.slug}
              status={listing.status}
              isOwnerSeller={isOwnerSeller}
              isAdmin={Boolean(isAdmin)}
              rejectionReason={listing.rejection_reason}
            />
          </div>
        ) : null}
      </div>

      <ListingStickyCta
        mode={stickyMode}
        listingId={listing.id}
        slug={listing.slug}
        priceCents={listing.price_cents}
        currency={listing.currency}
        offersEnabled={listing.offers_enabled}
        loginNextPath={loginNextPath}
      />
    </div>
  );
}
