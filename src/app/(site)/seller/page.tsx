import Link from "next/link";

import { ListingCard } from "@/components/listings/listing-card";
import { EmptyState } from "@/components/empty-state";
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
        <div className="-mx-4 rounded-2xl bg-ink px-6 py-8 text-white sm:-mx-6">
          <h1 className="text-2xl font-bold">Your listings</h1>
          <p className="mt-2 text-sm text-white/75">Create your seller profile to start selling.</p>
        </div>
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
    <div className="space-y-0">
      <div className="-mx-4 -mt-8 mb-8 bg-ink px-6 py-8 text-white sm:-mx-6 sm:rounded-2xl">
        <p className="text-sm font-medium text-white/80">{seller.display_name}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Your listings</h1>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/10 p-3 text-center">
            <p className="text-2xl font-extrabold tabular-nums">{stats.active}</p>
            <p className="text-[0.65rem] font-medium uppercase tracking-wide text-white/70">Live</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-center">
            <p className="text-2xl font-extrabold tabular-nums">{stats.total}</p>
            <p className="text-[0.65rem] font-medium uppercase tracking-wide text-white/70">Total</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-center">
            <p className="text-2xl font-extrabold tabular-nums">{stats.pending_review}</p>
            <p className="text-[0.65rem] font-medium uppercase tracking-wide text-white/70">In review</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Button size="sm" className="bg-mint text-white hover:bg-mint/90" render={<Link href="/seller/listings/new" />}>
            <Plus className="size-4" />
            New listing
          </Button>
          <Button size="sm" variant="outline" className="border-white/25 bg-transparent text-white hover:bg-white/10" render={<Link href="/seller/listings" />}>
            Manage listings
          </Button>
          <Button size="sm" variant="outline" className="border-white/25 bg-transparent text-white hover:bg-white/10" render={<Link href="/seller/profile" />}>
            Edit profile
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-ink-2">Verification</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <StatusBadge domain="seller_verification" value={seller.verification_status} />
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-ink-2">Sold</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums text-ink">{stats.sold}</CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-ink-2">In review</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold tabular-nums text-ink">{stats.pending_review}</CardContent>
        </Card>
        <Card className="border-dashed border-border bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-ink">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-ink-2">
            <p>
              <span className="font-medium text-ink">{seller.display_name}</span>
              {seller.location ? ` · ${seller.location}` : null}
            </p>
            <Button size="sm" variant="outline" render={<Link href="/seller/profile" />}>
              Edit seller profile
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Recent listings</h2>
          <Button variant="ghost" size="sm" className="text-ink-2 hover:text-ink" render={<Link href="/seller/listings" />}>
            View all
          </Button>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No listings yet"
            description="Create your first listing — it will appear here after you submit it for review."
            tone="selling"
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
                status={row.status}
                protectedDeliveryEnabled={row.protected_delivery_enabled}
                categoryName={row.category_name}
                sellerDisplayName={row.seller_display_name ?? seller.display_name}
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
