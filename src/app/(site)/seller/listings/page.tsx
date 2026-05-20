import Link from "next/link";
import { Layers, Plus } from "lucide-react";

import { SellerListingCard } from "@/components/seller/seller-listing-card";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  fetchSellerHubCounts,
  fetchSellerListings,
  fetchSellerProfileForUser,
} from "@/lib/listings/queries";

export default async function SellerListingsPage() {
  const seller = await fetchSellerProfileForUser();
  const listings = seller ? await fetchSellerListings(seller.id) : [];
  const hub = seller ? await fetchSellerHubCounts(seller.id) : { activeOffers: 0, activeOrders: 0 };

  const liveCount = listings.filter((l) => l.status === "active").length;
  const sellerName = seller?.display_name?.trim() || "Πωλητής";

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Οι αγγελίες μου</h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            {sellerName} · Πωλητής
          </p>
        </div>
        <Link
          href="/seller/listings/new"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-[#1D9E75] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#188A65]"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Νέα αγγελία
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#EEECE8] bg-white p-5">
          <div className="text-4xl font-black tracking-tight text-[#111111] tabular-nums">{liveCount}</div>
          <div className="mt-2 text-sm font-medium text-[#6B6B6B]">Ενεργές αγγελίες</div>
        </div>
        <div className="rounded-2xl border border-[#EEECE8] bg-white p-5">
          <div className="text-4xl font-black tracking-tight text-[#111111] tabular-nums">{hub.activeOffers}</div>
          <div className="mt-2 text-sm font-medium text-[#6B6B6B]">Ανοιχτές προσφορές</div>
        </div>
        <div className="rounded-2xl border border-[#EEECE8] bg-white p-5">
          <div className="text-4xl font-black tracking-tight text-[#111111] tabular-nums">{hub.activeOrders}</div>
          <div className="mt-2 text-sm font-medium text-[#6B6B6B]">Παραγγελίες</div>
        </div>
      </div>

      {!seller || listings.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={seller ? "Δεν έχεις αγγελίες ακόμα" : "Δημιούργησε προφίλ πωλητή"}
          description={
            seller
              ? "Δημοσίευσε τον πρώτο σου εξοπλισμό — οι φωτογραφίες βοηθούν στην πώληση."
              : "Χρειάζεσαι προφίλ πωλητή πριν δημιουργήσεις αγγελίες."
          }
        >
          {seller ? (
            <Button render={<Link href="/seller/listings/new" />}>Νέα αγγελία</Button>
          ) : (
            <Button render={<Link href="/seller/profile" />}>Ρύθμιση προφίλ</Button>
          )}
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {listings.map((row) => (
            <SellerListingCard
              key={row.id}
              listingId={row.id}
              slug={row.slug}
              title={row.title}
              categoryName={row.category_name ?? null}
              status={row.status}
              priceCents={row.price_cents}
              currency={row.currency}
              imageUrl={row.primary_image_url}
              followCount={row.follow_count ?? 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
