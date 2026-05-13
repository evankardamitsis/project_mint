import Image from "next/image";
import Link from "next/link";

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
  sellerDisplayName?: string | null;
}) {
  const reserved = status === "reserved";
  const shopName = sellerDisplayName?.trim() ?? "";
  const cityLine = location?.trim() ?? "";
  const metaLine =
    shopName && cityLine ? `${shopName} · ${cityLine}` : shopName || cityLine || null;
  const categoryTrimmed = categoryName?.trim() ?? "";

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
        className="block outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
        aria-label={`${title}, ${priceLabel}`}
      >
        <div className={cn("relative w-full overflow-hidden", reserved && "opacity-95")}>
          <div className="relative aspect-3/4 w-full overflow-hidden">
            <div className="relative h-full w-full overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={imageAlt ?? title}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]",
                    reserved && "brightness-[0.97] saturate-[0.85]",
                  )}
                  sizes="(max-width: 768px) 50vw, 33vw"
                  priority={Boolean(imagePriority)}
                  loading={imagePriority ? "eager" : "lazy"}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[11px] font-medium text-[#888888]">
                  Photo soon
                </div>
              )}
            </div>

            {protectedDeliveryEnabled ? (
              <div
                className="pointer-events-none absolute right-2 top-2 z-10 bg-[#1a7a4a] px-[7px] py-1 text-[8px] font-black uppercase tracking-[0.1em] text-[#ffffff]"
                aria-label="Protected delivery"
              >
                PROTECTED
              </div>
            ) : null}

            {reserved ? <div className="pointer-events-none absolute inset-0 z-10 bg-black/10" aria-hidden /> : null}
          </div>
        </div>

        <div className="border-t border-[#111111] px-[10px] pb-[14px] pt-[10px]">
          <p className="mb-[5px] overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold tracking-[-0.01em] text-[#111111]">
            {title}
          </p>
          <p className="mb-[7px] flex min-w-0 items-center gap-[5px]">
            <span
              className="shrink-0 border px-[5px] py-0.5 text-[9px] font-bold uppercase tracking-[0.07em]"
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
                <span className="min-w-0 flex-1 truncate text-[9px] font-bold uppercase tracking-[0.05em] text-[#999999]">
                  {categoryTrimmed}
                </span>
              </>
            ) : null}
          </p>
          <div className="flex items-baseline justify-between gap-1">
            <p className="text-[19px] font-black leading-none tracking-[-0.03em] text-[#111111] tabular-nums">{priceLabel}</p>
            {metaLine ? (
              <p className="max-w-[110px] shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-[9px] uppercase tracking-[0.04em] text-[#bbbbbb]">
                {metaLine}
              </p>
            ) : null}
          </div>
        </div>
      </Link>

      <ListingCardHeartButton className="absolute left-2 top-2 z-20 flex size-[26px] items-center justify-center bg-[rgba(255,255,255,0.88)] text-[#333333]" />

      {footer ? <div className="mt-2">{footer}</div> : null}
    </article>
  );
}
