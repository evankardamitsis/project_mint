import Image from "next/image";
import Link from "next/link";
import { Heart, Shield } from "lucide-react";

import { cn, formatEuroPrefix } from "@/lib/utils";
import type { ListingCondition, ListingStatus } from "@/types/domain";

const conditionLabels: Record<ListingCondition, string> = {
  brand_new: "New",
  mint: "Mint",
  excellent: "Excellent",
  very_good: "Very good",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
  non_functioning: "Parts",
};

function conditionDotClass(condition: ListingCondition): string {
  if (["brand_new", "mint", "excellent", "very_good"].includes(condition)) {
    return "bg-mint";
  }
  if (condition === "good") {
    return "bg-amber";
  }
  return "bg-danger";
}

function sellerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function ListingCard({
  title,
  slug,
  priceCents,
  currency = "EUR",
  condition,
  location,
  imageUrl,
  imageAlt,
  imagePriority,
  className,
  footer,
  protectedDeliveryEnabled,
  status = "active",
  categoryName,
  sellerDisplayName,
}: {
  title: string;
  slug: string;
  priceCents: number;
  currency?: string;
  condition: ListingCondition;
  location?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
  imagePriority?: boolean;
  className?: string;
  footer?: React.ReactNode;
  protectedDeliveryEnabled?: boolean;
  status?: ListingStatus;
  categoryName?: string | null;
  /** Seller shop name (`seller_profiles.display_name`). */
  sellerDisplayName?: string | null;
}) {
  const reserved = status === "reserved";
  const shopName = sellerDisplayName?.trim() ?? "";
  const initialsSource = shopName || title;
  const priceLabel =
    currency === "EUR"
      ? formatEuroPrefix(priceCents)
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          minimumFractionDigits: priceCents % 100 === 0 ? 0 : 2,
          maximumFractionDigits: 2,
        }).format(priceCents / 100);

  return (
    <Link href={`/listing/${slug}`} className={cn("group block", className)}>
      <article
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-2xl bg-white transition-shadow hover:shadow-md",
          reserved && "opacity-95",
        )}
      >
        <div className="relative aspect-[4/3] w-full shrink-0 rounded-t-2xl bg-[#F0EEE9]">
          {protectedDeliveryEnabled ? (
            <div className="pointer-events-none absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[10px] font-bold text-mint shadow-sm backdrop-blur-sm">
              <Shield className="size-3 shrink-0" aria-hidden strokeWidth={2.5} />
              Protected
            </div>
          ) : null}
          <div
            className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur-sm"
            aria-hidden
          >
            <Heart className="size-3.5 text-ink-2" strokeWidth={1.75} />
          </div>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt ?? title}
              fill
              className={cn(
                "rounded-t-2xl object-cover transition-transform duration-300 group-hover:scale-[1.02]",
                reserved && "brightness-[0.97] saturate-[0.85]",
              )}
              sizes="(max-width: 768px) 50vw, 33vw"
              {...(imagePriority ? { priority: true, loading: "eager" as const } : {})}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-t-2xl text-[11px] font-medium text-ink-3">Photo soon</div>
          )}
          {reserved ? <div className="pointer-events-none absolute inset-0 rounded-t-2xl bg-ink/10" aria-hidden /> : null}
        </div>
        <div className="flex flex-1 flex-col bg-white px-3 pb-4 pt-3">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <span className={cn("size-1.5 shrink-0 rounded-full", conditionDotClass(condition))} aria-hidden />
              <span className="truncate text-[11px] font-semibold text-ink-2">{conditionLabels[condition]}</span>
              {categoryName ? (
                <>
                  <span className="shrink-0 text-[11px] text-ink-3">·</span>
                  <span className="truncate text-[11px] text-ink-3">{categoryName}</span>
                </>
              ) : null}
            </div>
            <div className="flex max-w-[55%] shrink-0 items-center gap-1.5">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-mint-tint text-[10px] font-bold text-mint-dark">
                {sellerInitials(initialsSource)}
              </span>
              {shopName ? (
                <span className="truncate text-[10px] font-medium text-ink-2">{shopName}</span>
              ) : null}
            </div>
          </div>
          <h2 className="mb-2 line-clamp-2 min-w-0 text-[15px] font-semibold leading-snug text-ink">{title}</h2>
          <p className="text-2xl font-black tracking-tight text-ink tabular-nums">{priceLabel}</p>
          <p className="mt-1.5 line-clamp-1 text-[11px] text-ink-3">{location?.trim() ? location : "—"}</p>
          {footer ? <div className="mt-2">{footer}</div> : null}
        </div>
      </article>
    </Link>
  );
}
