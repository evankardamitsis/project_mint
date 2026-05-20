"use client";

import Image from "next/image";
import Link from "next/link";
import { Archive, Eye, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import { archiveSellerListingAction } from "@/lib/listings/seller-actions";
import { cn } from "@/lib/utils";
import type { ListingStatus } from "@/types/domain";

type SellerListingCardProps = {
  listingId: string;
  slug: string;
  title: string;
  categoryName: string | null;
  status: ListingStatus;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  followCount: number;
};

function badgeKey(status: ListingStatus): "live" | "reserved" | "draft" | "pending" | "archived" | "other" {
  if (status === "active") return "live";
  if (status === "reserved") return "reserved";
  if (status === "draft") return "draft";
  if (status === "pending_review") return "pending";
  if (status === "archived") return "archived";
  return "other";
}

function statusLabel(status: ListingStatus): string {
  const labels: Record<string, string> = {
    live: "Ενεργή",
    reserved: "Δεσμευμένη",
    draft: "Προσχέδιο",
    pending: "Υπό έγκριση",
    archived: "Αρχειοθετημένη",
    sold: "Πωλήθηκε",
    rejected: "Απορρίφθηκε",
  };
  return labels[badgeKey(status)] ?? status.replace(/_/g, " ");
}

function badgeClass(key: ReturnType<typeof badgeKey>): string {
  const base = "rounded-full px-3 py-1.5 text-[10px] font-bold";
  switch (key) {
    case "live":
      return cn(base, "bg-[#E8F7F1] text-[#0A5C43]");
    case "reserved":
      return cn(base, "bg-[#FEF3E2] text-[#C47A15]");
    case "draft":
      return cn(base, "bg-[#F7F6F3] text-[#6B6B6B]");
    case "pending":
      return cn(base, "bg-[#E6F1FB] text-[#0C447C]");
    case "archived":
      return cn(base, "bg-[#F7F6F3] text-[#6B6B6B]");
    default:
      return cn(base, "bg-[#F7F6F3] text-[#6B6B6B]");
  }
}

function formatPrice(cents: number, currency: string): string {
  if (currency === "EUR") {
    return `€${(cents / 100).toLocaleString("el-GR", { maximumFractionDigits: cents % 100 === 0 ? 0 : 2 })}`;
  }
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function SellerListingCard({
  listingId,
  slug,
  title,
  categoryName,
  status,
  priceCents,
  currency,
  imageUrl,
  followCount,
}: SellerListingCardProps) {
  const router = useRouter();
  const key = badgeKey(status);
  const canEdit = status !== "sold";
  const canArchive = status !== "sold" && status !== "archived";

  async function onArchive() {
    if (!confirm("Αρχειοθέτηση αυτής της αγγελίας;")) {
      return;
    }
    const r = await archiveSellerListingAction(listingId);
    if (r.ok) {
      router.refresh();
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#EEECE8] bg-white p-5 transition-all hover:border-[#DDDBD6] hover:shadow-sm">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F7F6F3]">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover" sizes="64px" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-1 truncate text-sm font-semibold text-[#111111]">{title}</p>
        <p className="text-xs text-[#ABABAB]">{categoryName ?? "Αγγελία"}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className={badgeClass(key)}>{statusLabel(status)}</span>
        </div>
      </div>

      <div className={cn("flex shrink-0 items-center", followCount > 0 && "gap-3")}>
        {followCount > 0 && (
          <span className="flex items-center gap-1 text-xs font-semibold text-[#1D9E75]">
            <Eye className="h-3.5 w-3.5" aria-hidden />
            {followCount}
          </span>
        )}
        <span className="text-lg font-black text-[#111111] tabular-nums">{formatPrice(priceCents, currency)}</span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Link
          href={`/listing/${slug}`}
          className="rounded-lg p-2 transition-colors hover:bg-[#F7F6F3]"
          title="Προβολή"
        >
          <Eye className="h-4 w-4 text-[#6B6B6B]" aria-hidden />
        </Link>
        {canEdit ? (
          <Link
            href={`/seller/listings/${listingId}/edit`}
            className="rounded-lg p-2 transition-colors hover:bg-[#F7F6F3]"
            title="Επεξεργασία"
          >
            <Pencil className="h-4 w-4 text-[#6B6B6B]" aria-hidden />
          </Link>
        ) : (
          <span
            className="cursor-not-allowed rounded-lg p-2 opacity-40"
            title="Η αγγελία έχει πωληθεί"
          >
            <Pencil className="h-4 w-4 text-[#6B6B6B]" aria-hidden />
          </span>
        )}
        {canArchive ? (
          <button
            type="button"
            className="rounded-lg p-2 transition-colors hover:bg-[#FEEDED]"
            title="Αρχειοθέτηση"
            onClick={() => void onArchive()}
          >
            <Archive className="h-4 w-4 text-[#6B6B6B] hover:text-[#CC4444]" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
