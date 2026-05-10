import Link from "next/link";

import { ListingCard } from "@/components/listings/listing-card";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchSellerListingStats,
  fetchSellerListings,
  fetchSellerProfileForUser,
} from "@/lib/listings/queries";
import { Package, Plus, UserRound } from "lucide-react";

export default async function SellerHomePage() {
  const seller = await fetchSellerProfileForUser();

  if (!seller) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Seller dashboard"
          description="Create your seller profile to manage listings and track verification."
        />
        <EmptyState
          icon={UserRound}
          title="Complete your seller profile"
          description="We need a few details before you can publish listings and see analytics here."
        >
          <Button render={<Link href="/seller/profile" />}>Set up profile</Button>
        </EmptyState>
      </div>
    );
  }

  const [stats, listings] = await Promise.all([
    fetchSellerListingStats(seller.id),
    fetchSellerListings(seller.id),
  ]);
  const recent = listings.slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Seller dashboard"
        description={`Signed in as ${seller.display_name}.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" render={<Link href="/seller/listings/new" />}>
              <Plus className="size-4" />
              New listing
            </Button>
            <Button size="sm" variant="outline" render={<Link href="/seller/listings" />}>
              Manage listings
            </Button>
            <Button size="sm" variant="outline" render={<Link href="/seller/profile" />}>
              Edit profile
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verification</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <StatusBadge domain="seller_verification" value={seller.verification_status} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total listings</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{stats.total}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
            {stats.active}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In review</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{stats.pending_review}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sold</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums">{stats.sold}</CardContent>
        </Card>
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">{seller.display_name}</span>
              {seller.location ? ` · ${seller.location}` : null}
            </p>
            <Button size="sm" variant="outline" render={<Link href="/seller/profile" />}>
              Edit seller profile
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recent listings</h2>
          <Button variant="ghost" size="sm" render={<Link href="/seller/listings" />}>
            View all
          </Button>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No listings yet"
            description="Create your first listing — it will appear here after you submit it for review."
          >
            <Button render={<Link href="/seller/listings/new" />}>Create listing</Button>
          </EmptyState>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                footer={
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge domain="listing" value={row.status} />
                    {row.protected_delivery_enabled ? (
                      <span className="text-xs text-muted-foreground">Protected delivery</span>
                    ) : null}
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
