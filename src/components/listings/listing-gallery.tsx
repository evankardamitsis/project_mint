"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { ListingImageRow } from "@/types/listings";

export function ListingGallery({
  title,
  images,
  className,
  /** Edge-to-edge on small screens (listing detail hero). */
  bleed,
  /** Listing detail: aspects, thumb strip, mobile flat hero. */
  detailLayout,
}: {
  title: string;
  images: ListingImageRow[];
  className?: string;
  bleed?: boolean;
  detailLayout?: boolean;
}) {
  const sorted = useMemo(
    () => [...images].sort((a, b) => a.sort_order - b.sort_order),
    [images],
  );
  const [active, setActive] = useState(0);
  const current = sorted[active];

  if (!sorted.length) {
    return (
      <div
        className={cn(
          "flex min-h-60 items-center justify-center bg-warm-bg text-sm text-(--color-text-muted) sm:min-h-70",
          detailLayout && bleed ? "rounded-none lg:rounded-2xl" : "sm:rounded-2xl",
          bleed && !detailLayout && "rounded-none sm:rounded-2xl",
          className,
        )}
      >
        No photos for this listing yet.
      </div>
    );
  }

  const mainFrame = cn(
    "relative w-full overflow-hidden bg-warm-bg",
    detailLayout
      ? "aspect-4/3 lg:aspect-3/2 rounded-none lg:rounded-2xl"
      : "aspect-4/3 sm:rounded-2xl",
    bleed && !detailLayout && "rounded-none sm:rounded-2xl",
  );

  const thumbBtn = (i: number) =>
    cn(
      "relative shrink-0 overflow-hidden rounded-xl transition-opacity",
      detailLayout ? "size-16 cursor-pointer opacity-60 hover:opacity-100" : "size-14 sm:size-16 ring-2",
      !detailLayout && (i === active ? "ring-mint" : "ring-transparent hover:ring-border"),
      detailLayout && i === active && "opacity-100 ring-2 ring-mint",
    );

  return (
    <div className={cn(detailLayout ? "space-y-3" : "space-y-2 sm:space-y-3", className)}>
      <div className={mainFrame}>
        <Image
          src={current.url}
          alt={`${title} — photo ${active + 1}`}
          fill
          className={cn(
            "object-cover",
            detailLayout && bleed ? "rounded-none lg:rounded-2xl" : "",
            !detailLayout && bleed && "rounded-none sm:rounded-2xl",
            !detailLayout && !bleed && "sm:rounded-2xl",
          )}
          sizes="(max-width: 1024px) 100vw, 55vw"
          priority
          loading="eager"
        />
      </div>
      {sorted.length > 1 ? (
        <div className={cn("flex gap-2 overflow-x-auto", detailLayout ? "mt-3" : "px-1 pb-1 sm:px-0")}>
          {sorted.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={thumbBtn(i)}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
