import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  IconAdjustments,
  IconDisc,
  IconGuitarPick,
  IconMetronome,
  IconMicrophone,
  IconPackage,
  IconPiano,
  IconSpeakerphone,
} from "@tabler/icons-react";
import { ShieldCheck } from "lucide-react";

import { FollowButton } from "@/components/listings/follow-button";
import { cn, formatEuroPrefix } from "@/lib/utils";
import type { ListingCondition, ListingStatus } from "@/types/domain";

const CONDITION_LABELS: Record<ListingCondition, string> = {
  brand_new: "Καινούριο",
  mint: "Άριστο",
  excellent: "Άριστο",
  very_good: "Πολύ καλό",
  good: "Καλό",
  fair: "Μέτρια",
  poor: "Φθαρμένο",
  non_functioning: "Ανταλλακτικά",
};

const CONDITION_PILL: Record<ListingCondition, { color: string; bg: string }> = {
  brand_new:      { color: "#0a6640", bg: "#e6f4ed" },
  mint:           { color: "#0a6640", bg: "#e6f4ed" },
  excellent:      { color: "#0a6640", bg: "#e6f4ed" },
  very_good:      { color: "#1d4ed8", bg: "#eff4ff" },
  good:           { color: "#92400e", bg: "#fef3c7" },
  fair:           { color: "#9f1239", bg: "#fef2f2" },
  poor:           { color: "#9f1239", bg: "#fef2f2" },
  non_functioning:{ color: "#6b7280", bg: "#f3f4f6" },
};

function formatCity(location: string | null | undefined): string {
  if (!location) return "";
  const city = location.split(",")[0]!.trim();
  return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
}

function ListingCardImagePlaceholder({ categorySlug }: { categorySlug: string | null | undefined }) {
  const s = (categorySlug ?? "").trim().toLowerCase();
  const iconClass = "size-8 text-[#bbbbbb]";
  const stroke = 1.25;
  if (["electric-guitars", "acoustic-guitars", "bass"].includes(s)) {
    return <IconGuitarPick className={iconClass} stroke={stroke} aria-hidden />;
  }
  if (s === "synths-keyboards") {
    return <IconPiano className={iconClass} stroke={stroke} aria-hidden />;
  }
  if (s === "effects-pedals") {
    return <IconAdjustments className={iconClass} stroke={stroke} aria-hidden />;
  }
  if (s === "amps") {
    return <IconSpeakerphone className={iconClass} stroke={stroke} aria-hidden />;
  }
  if (s === "drums") {
    return <IconMetronome className={iconClass} stroke={stroke} aria-hidden />;
  }
  if (s === "dj-gear") {
    return <IconDisc className={iconClass} stroke={stroke} aria-hidden />;
  }
  if (s === "pro-audio") {
    return <IconMicrophone className={iconClass} stroke={stroke} aria-hidden />;
  }
  if (s === "accessories") {
    return <IconPackage className={iconClass} stroke={stroke} aria-hidden />;
  }
  return <IconPackage className={iconClass} stroke={stroke} aria-hidden />;
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
  categorySlug,
  sellerTier: _sellerTier = null,
  listingId,
  viewerUserId = null,
  sellerOwnerUserId = null,
  isFollowed = false,
  isGuest = true,
  latestPriceDropCreatedAt = null,
  followedAt = null,
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
  footer?: ReactNode;
  protectedDeliveryEnabled?: boolean;
  status?: ListingStatus;
  categoryName?: string | null;
  categorySlug?: string | null;
  sellerDisplayName?: string | null;
  sellerTier?: string | null;
  listingId?: string;
  viewerUserId?: string | null;
  sellerOwnerUserId?: string | null;
  isFollowed?: boolean;
  isGuest?: boolean;
  latestPriceDropPercent?: number | null;
  latestPriceDropOldPriceCents?: number | null;
  latestPriceDropCreatedAt?: string | null;
  followedAt?: string | null;
}) {
  const reserved = status === "reserved";
  const hasImage = Boolean(imageUrl?.trim());
  const isOwnerSeller = Boolean(
    viewerUserId && sellerOwnerUserId && viewerUserId === sellerOwnerUserId,
  );

  const priceLabel =
    currency === "EUR"
      ? formatEuroPrefix(priceCents)
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          minimumFractionDigits: priceCents % 100 === 0 ? 0 : 2,
          maximumFractionDigits: 2,
        }).format(priceCents / 100);

  const newDropSinceWatch =
    Boolean(followedAt && latestPriceDropCreatedAt) &&
    new Date(latestPriceDropCreatedAt as string).getTime() > new Date(followedAt as string).getTime();

  const conditionLabel = CONDITION_LABELS[condition] ?? condition;
  const conditionPill = CONDITION_PILL[condition] ?? { color: "#6b7280", bg: "#f3f4f6" };
  const categoryTrimmed = categoryName?.trim() ?? "";
  const city = formatCity(location);
  const href = `/listing/${slug}`;

  return (
    <article
      className={cn(
        "group relative block w-full bg-(--color-background-page)",
        newDropSinceWatch && "shadow-[inset_3px_0_0_0_#1a7a4a]",
        className,
      )}
    >
      <Link
        href={href}
        className="block focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-ring"
        aria-label={`${title}, ${priceLabel}`}
      >
        {/* Image */}
        <div className={cn("relative w-full overflow-hidden", reserved && "opacity-95")}>
          <div className="relative aspect-3/5 w-full overflow-hidden bg-[#e8e5de]">
            {hasImage ? (
              <Image
                src={imageUrl!.trim()}
                alt={imageAlt ?? title}
                fill
                className={cn(
                  "object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]",
                  reserved && "brightness-[0.97] saturate-[0.85]",
                )}
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                priority={Boolean(imagePriority)}
                loading={imagePriority ? "eager" : "lazy"}
              />
            ) : (
              <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-[#e8e5de]">
                <ListingCardImagePlaceholder categorySlug={categorySlug} />
              </div>
            )}

            {/* Protected badge — bottom-left */}
            <div className="absolute bottom-3 left-3 z-10">
              {protectedDeliveryEnabled ? (
                <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#1D9E75] backdrop-blur-sm">
                  <ShieldCheck className="h-3 w-3" aria-hidden />
                  PROTECTED
                </span>
              ) : null}
            </div>

            {reserved ? (
              <div className="pointer-events-none absolute inset-0 z-10 bg-black/10" aria-hidden />
            ) : null}
          </div>
        </div>

        {/* Card body — 3-line hierarchy */}
        <div className="border-t border-[#111111] p-3">
          {/* Line 1: Title */}
          <p className="truncate text-sm font-semibold leading-snug text-[#111111]">
            {title}
          </p>

          {/* Line 2: Condition pill · Category */}
          <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
            <span
              className="shrink-0 rounded-none px-2 py-[3px] text-[10px] font-black uppercase leading-none tracking-[0.08em]"
              style={{ color: conditionPill.color, backgroundColor: conditionPill.bg }}
            >
              {conditionLabel}
            </span>
            {categoryTrimmed ? (
              <span className="truncate text-xs text-[#ABABAB]">{categoryTrimmed}</span>
            ) : null}
          </div>

          {/* Line 3: Price + City */}
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-base font-black text-[#111111]">{priceLabel}</span>
            {city ? (
              <span className="text-xs text-[#ABABAB]">{city}</span>
            ) : null}
          </div>
        </div>
      </Link>

      {/* Eye / save button — top-right of image */}
      {listingId && !isOwnerSeller ? (
        <div className="absolute right-3 top-3 z-10">
          <FollowButton
            listingId={listingId}
            initialFollowing={isFollowed}
            isGuest={isGuest}
            size="sm"
            className="shadow-sm"
          />
        </div>
      ) : null}

      {footer ? <div className="mt-2">{footer}</div> : null}
    </article>
  );
}
