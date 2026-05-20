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
import { TierBadge } from "@/components/seller/tier-badge";
import type { SellerTier } from "@/types/domain";
import { cn, formatEuroPrefix } from "@/lib/utils";
import { conditionDisplayLabel } from "@/lib/listings/condition-display";
import type { ListingCondition, ListingStatus } from "@/types/domain";

function conditionPillColor(condition: ListingCondition): string {
  switch (condition) {
    case "brand_new":
    case "mint":
    case "excellent":
      return "#1a7a4a";
    case "very_good":
      return "#2563eb";
    case "good":
      return "#b45309";
    case "fair":
    case "poor":
    case "non_functioning":
      return "#9f1239";
    default:
      return "#1a7a4a";
  }
}

function pillBackground(hex: string): string {
  if (hex.length === 7 && hex.startsWith("#")) {
    return `${hex}14`;
  }
  return "rgba(26, 122, 74, 0.08)";
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
  sellerDisplayName,
  sellerTier = null,
  listingId,
  viewerUserId = null,
  sellerOwnerUserId = null,
  isFollowed = false,
  isGuest = true,
  latestPriceDropPercent = null,
  latestPriceDropOldPriceCents = null,
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
  sellerTier?: SellerTier | null;
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
  const cityLine = location?.trim() ?? "";
  const metaLine = cityLine || null;
  const categoryTrimmed = categoryName?.trim() ?? "";
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

  const pct = latestPriceDropPercent;
  const hasMeaningfulDrop = typeof pct === "number" && Number.isFinite(pct) && pct <= -5;
  const majorDrop = typeof pct === "number" && Number.isFinite(pct) && pct <= -10;
  const dropPctRounded = hasMeaningfulDrop ? Math.round(Math.abs(pct)) : 0;
  const oldStrike =
    hasMeaningfulDrop &&
    typeof latestPriceDropOldPriceCents === "number" &&
    latestPriceDropOldPriceCents > priceCents
      ? currency === "EUR"
        ? formatEuroPrefix(latestPriceDropOldPriceCents)
        : new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: latestPriceDropOldPriceCents % 100 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
          }).format(latestPriceDropOldPriceCents / 100)
      : null;
  const newDropSinceWatch =
    Boolean(followedAt && latestPriceDropCreatedAt) &&
    new Date(latestPriceDropCreatedAt as string).getTime() > new Date(followedAt as string).getTime();

  const href = `/listing/${slug}`;
  const conditionLabel = conditionDisplayLabel(condition);
  const pillColor = conditionPillColor(condition);

  return (
    <article
      className={cn(
        "group relative block w-full bg-[var(--color-background-page)]",
        newDropSinceWatch && "shadow-[inset_3px_0_0_0_#1a7a4a]",
        className,
      )}
    >
      <Link
        href={href}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
        aria-label={`${title}, ${priceLabel}`}
      >
        <div className={cn("relative w-full overflow-hidden", reserved && "opacity-95")}>
          <div className="relative aspect-[3/5] w-full overflow-hidden bg-[#e8e5de]">
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

            {protectedDeliveryEnabled ? (
              <div
                className="pointer-events-none absolute right-2 top-10 z-10 flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1 backdrop-blur-sm"
                aria-label="Protected delivery"
              >
                <ShieldCheck className="size-3 text-[#0A5C43]" strokeWidth={2.5} aria-hidden />
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#0A5C43]">Protected</span>
              </div>
            ) : null}

            {reserved ? <div className="pointer-events-none absolute inset-0 z-10 bg-black/10" aria-hidden /> : null}
          </div>
        </div>

        <div className="border-t border-[#111111] px-[10px] pb-4 pt-3">
          <p className="mb-[5px] overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold tracking-[-0.01em] text-[#111111]">
            {title}
          </p>
          <p className="mb-[7px] flex min-w-0 items-center gap-[5px]">
            <span
              className="mint-condition-pill shrink-0 rounded-none border px-[5px] py-0.5 text-[9px] font-bold uppercase tracking-[0.07em]"
              style={{
                color: pillColor,
                borderColor: pillColor,
                backgroundColor: pillBackground(pillColor),
              }}
            >
              {conditionLabel}
            </span>
            {categoryTrimmed ? (
              <>
                <span className="shrink-0 select-none text-[9px] text-[#cccccc]" aria-hidden>
                  ·
                </span>
                <span className="min-w-0 flex-1 truncate text-[9px] font-bold uppercase tracking-wider text-[#999999]">
                  {categoryTrimmed}
                </span>
              </>
            ) : null}
          </p>
          <div className="flex items-baseline justify-between gap-1">
            <div className="min-w-0">
              {oldStrike ? (
                <p className="mb-0.5 text-[11px] font-semibold tabular-nums text-[#999999] line-through">{oldStrike}</p>
              ) : null}
              <p className="text-[19px] font-black leading-none tracking-[-0.03em] text-[#111111] tabular-nums">
                {priceLabel}
              </p>
              {hasMeaningfulDrop ? (
                <p className="mt-1 text-[8px] font-black uppercase tracking-[0.12em] text-[#1a7a4a]">
                  {majorDrop ? `−${dropPctRounded}%` : "Price drop"}
                </p>
              ) : null}
            </div>
            <div className="flex max-w-[110px] shrink-0 flex-col items-end gap-1">
              {sellerTier && sellerTier !== "new" ? (
                <TierBadge tier={sellerTier} size="sm" />
              ) : null}
              {metaLine ? (
                <p className="overflow-hidden text-ellipsis whitespace-nowrap text-[9px] uppercase tracking-[0.04em] text-text-muted">
                  {metaLine}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </Link>

      {listingId && !isOwnerSeller ? (
        <FollowButton
          listingId={listingId}
          initialFollowing={isFollowed}
          isGuest={isGuest}
          size="sm"
          className="absolute right-2 top-2 z-30 shadow-sm"
        />
      ) : null}

      {footer ? <div className="mt-2">{footer}</div> : null}
    </article>
  );
}
