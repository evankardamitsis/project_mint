import Link from "next/link";
import { notFound } from "next/navigation";

import { ListingGallery } from "@/components/listings/listing-gallery";
import { ListingManagementPanel } from "@/components/listings/listing-management-panel";
import { ListingPurchaseSection } from "@/components/listings/listing-purchase-section";
import { ListingOfferPanel } from "@/components/offers/listing-offer-panel";
import { ConditionBadge } from "@/components/condition-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile } from "@/lib/auth/guards";
import { fetchListingBySlug, fetchSellerProfileForUser } from "@/lib/listings/queries";

type PageProps = { params: Promise<{ slug: string }> };

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
  const showManagement = isAdmin || isOwnerSeller;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" size="sm" render={<Link href="/browse" />}>
          Back to browse
        </Button>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <ListingGallery title={listing.title} images={listing.images} />
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-2xl font-semibold tracking-tight">{listing.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <ConditionBadge condition={listing.condition} />
              {listing.protected_delivery_enabled ? (
                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                  Protected delivery
                </span>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">{listing.location ?? "—"}</p>
            <p className="text-sm text-muted-foreground">
              Seller:{" "}
              <span className="font-medium text-foreground">{listing.seller_display_name}</span>
            </p>
            {listing.category ? (
              <p className="text-xs text-muted-foreground">
                Category:{" "}
                <span className="text-foreground">{listing.category.name}</span>
                {listing.brand ? (
                  <>
                    {" "}
                    · Brand: <span className="text-foreground">{listing.brand.name}</span>
                  </>
                ) : null}
              </p>
            ) : null}
            {listing.offers_enabled ? (
              <p className="text-xs text-muted-foreground">Offers are enabled for this listing.</p>
            ) : (
              <p className="text-xs text-muted-foreground">Price is firm — offers are disabled.</p>
            )}
          </div>
          {listing.description ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{listing.description}</p>
              </CardContent>
            </Card>
            ) : null}
          {showManagement ? (
            <ListingManagementPanel
              listingId={listing.id}
              slug={listing.slug}
              status={listing.status}
              isOwnerSeller={isOwnerSeller}
              isAdmin={Boolean(isAdmin)}
              rejectionReason={listing.rejection_reason}
            />
          ) : null}
          <ListingPurchaseSection listing={listing} viewer={profile} isOwnerSeller={isOwnerSeller} />
          <ListingOfferPanel
            listingId={listing.id}
            slug={listing.slug}
            currency={listing.currency}
            offersEnabled={listing.offers_enabled}
            listingActive={listing.status === "active"}
            viewer={profile}
            isListingSeller={isOwnerSeller}
          />
        </div>
      </div>
    </div>
  );
}
