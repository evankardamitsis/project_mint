import Image from "next/image";
import Link from "next/link";

import { SellerListingRowActions } from "@/components/listings/seller-listing-row-actions";
import { EmptyState } from "@/components/empty-state";
import { Price } from "@/components/price";
import { Button } from "@/components/ui/button";
import { fetchSellerListings, fetchSellerProfileForUser } from "@/lib/listings/queries";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

function statusColor(status: string) {
  if (status === "active") {
    return "text-mint";
  }
  if (status === "pending_review") {
    return "text-amber";
  }
  if (status === "draft") {
    return "text-ink-3";
  }
  if (status === "reserved") {
    return "text-amber";
  }
  return "text-ink-2";
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export default async function SellerListingsPage() {
  const seller = await fetchSellerProfileForUser();
  const listings = seller ? await fetchSellerListings(seller.id) : [];

  const live = listings.filter((l) => l.status === "active").length;

  return (
    <div className="space-y-0">
      <div className="-mx-4 -mt-8 mb-8 bg-[#111111] px-6 py-8 text-white sm:-mx-6 sm:rounded-2xl">
        <p className="text-sm font-medium text-white/80">{seller?.display_name ?? "Seller"}</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Your listings</h1>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/10 p-3 text-center">
            <p className="text-2xl font-extrabold tabular-nums">{live}</p>
            <p className="text-[0.65rem] font-medium uppercase tracking-wide text-white/70">Live</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-center">
            <p className="text-2xl font-extrabold tabular-nums">—</p>
            <p className="text-[0.65rem] font-medium uppercase tracking-wide text-white/70">Offers</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-center">
            <p className="text-2xl font-extrabold tabular-nums">—</p>
            <p className="text-[0.65rem] font-medium uppercase tracking-wide text-white/70">Orders</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
        <p className="text-sm font-medium text-ink-2">
          {listings.length} listing{listings.length === 1 ? "" : "s"}
        </p>
        <Button className="rounded-full bg-[#111111] px-5 font-semibold text-white hover:bg-ink/90" render={<Link href="/seller/listings/new" />}>
          + New listing
        </Button>
      </div>

      {!seller || listings.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={seller ? "No listings yet" : "Create a seller profile first"}
          description={
            seller
              ? "Publish your first piece of gear — photos up front help it sell."
              : "You need a seller profile before listings can be created."
          }
        >
          {seller ? (
            <Button render={<Link href="/seller/listings/new" />}>Create listing</Button>
          ) : (
            <Button render={<Link href="/seller/profile" />}>Set up profile</Button>
          )}
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {listings.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center gap-4 rounded-xl bg-white p-3 shadow-sm sm:flex-nowrap sm:gap-5 sm:p-4"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[#F0EEE9] sm:size-20">
                {row.primary_image_url ? (
                  <Image src={row.primary_image_url} alt="" fill className="object-cover" sizes="80px" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{row.title}</p>
                <p className="text-xs text-ink-3">{row.category_name ?? "Listing"}</p>
                <p className={cn("mt-1 text-xs font-medium capitalize", statusColor(row.status))}>{statusLabel(row.status)}</p>
              </div>
              <div className="flex w-full shrink-0 items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end">
                <Price amountCents={row.price_cents} currency={row.currency} className="text-lg font-extrabold tracking-tight text-ink" />
                <SellerListingRowActions listingId={row.id} slug={row.slug} status={row.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
