import { Package } from "lucide-react";

import { ListingWizard } from "@/components/listings/wizard/listing-wizard";
import { SetupSellerProfileButton } from "@/components/listings/setup-seller-profile-button";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import {
  fetchBrands,
  fetchCategories,
  fetchSellerProfileForUser,
} from "@/lib/listings/queries";

export default async function NewListingPage() {
  const [categories, brands, seller] = await Promise.all([
    fetchCategories(),
    fetchBrands(),
    fetchSellerProfileForUser(),
  ]);

  if (!seller) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="New listing"
          description="You need a seller profile before you can publish gear."
        />
        <EmptyState
          icon={Package}
          title="Set up your seller profile"
          description="Create a seller profile once. You can then add listings, photos, and submit them for review."
        >
          <SetupSellerProfileButton />
        </EmptyState>
      </div>
    );
  }

  return (
    <ListingWizard categories={categories} brands={brands} />
  );
}
