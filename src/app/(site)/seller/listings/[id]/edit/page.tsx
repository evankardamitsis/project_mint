import Link from "next/link";
import { notFound } from "next/navigation";

import { ListingEditForm } from "@/components/listings/listing-edit-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import {
  fetchBrands,
  fetchCategories,
  fetchSellerListingForEdit,
  fetchSellerProfileForUser,
} from "@/lib/listings/queries";
import { fetchListingFollowCount } from "@/lib/follows/queries";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditSellerListingPage(props: PageProps) {
  const { id } = await props.params;
  const [seller, listing, categories, brands] = await Promise.all([
    fetchSellerProfileForUser(),
    fetchSellerListingForEdit(id),
    fetchCategories(),
    fetchBrands(),
  ]);

  if (!seller || !listing || listing.seller_id !== seller.id) {
    notFound();
  }

  const followCount = await fetchListingFollowCount(listing.id);
  const followLabel =
    followCount === 0
      ? null
      : followCount === 1
        ? "1 ακολουθεί"
        : `${followCount} ακολουθούν`;

  if (listing.status === "sold") {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <PageHeader title="Listing is sold" description="Sold listings cannot be edited." />
        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-muted-foreground">
              This gear has been marked sold. You can still view the public page for your records.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button render={<Link href={`/listing/${listing.slug}`} />}>View listing</Button>
              <Button variant="outline" render={<Link href="/seller/listings" />}>
                Back to listings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Edit listing"
        description={`Changes to active or rejected listings send the item back to admin review.${followLabel ? ` ${followLabel}.` : ""}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge domain="listing" value={listing.status} />
            <Button size="sm" variant="outline" render={<Link href="/seller/listings" />}>
              Back
            </Button>
          </div>
        }
      />
      <ListingEditForm listing={listing} categories={categories} brands={brands} />
    </div>
  );
}
