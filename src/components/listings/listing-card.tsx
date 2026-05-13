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

import { ListingCardHeartButton } from "@/components/listings/listing-card-heart-button";
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
  listingId,
  viewerUserId = null,
  sellerOwnerUserId = null,
  isSaved = false,
  isGuest = true,
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
  listingId?: string;
  viewerUserId?: string | null;
  sellerOwnerUserId?: string | null;
  isSaved?: boolean;
  isGuest?: boolean;
}) {
  const reserved = status === "reserved";
  const shopName = sellerDisplayName?.trim() ?? "";
  const cityLine = location?.trim() ?? "";
  const metaLine =
    shopName && cityLine ? `${shopName} · ${cityLine}` : shopName || cityLine || null;
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

  const href = `/listing/${slug}`;
  const conditionLabel = conditionDisplayLabel(condition);
  const pillColor = conditionPillColor(condition);

  return (
    <article className={cn("group relative block w-full bg-[var(--color-background-page)]", className)}>
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
                className="pointer-events-none absolute right-2 top-10 z-10 bg-[#1a7a4a] px-[7px] py-1 text-[8px] font-black uppercase tracking-widest text-[#ffffff]"
                aria-label="Protected delivery"
              >
                PROTECTED
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
            <p className="text-[19px] font-black leading-none tracking-[-0.03em] text-[#111111] tabular-nums">{priceLabel}</p>
            {metaLine ? (
              <p className="max-w-[110px] shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-[9px] uppercase tracking-[0.04em] text-text-muted">
                {metaLine}
              </p>
            ) : null}
          </div>
        </div>
      </Link>

      {listingId ? (
        <ListingCardHeartButton
          listingId={listingId}
          initialSaved={isSaved}
          isGuest={isGuest}
          isOwner={isOwnerSeller}
          className="absolute right-2 top-2 z-30 flex size-[26px] items-center justify-center bg-[rgba(255,255,255,0.88)] text-[#333333] shadow-sm"
        />
      ) : null}

      {footer ? <div className="mt-2">{footer}</div> : null}
    </article>
  );
}
