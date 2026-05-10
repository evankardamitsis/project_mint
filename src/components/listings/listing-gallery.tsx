"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { ListingImageRow } from "@/types/listings";

export function ListingGallery({
  title,
  images,
  className,
}: {
  title: string;
  images: ListingImageRow[];
  className?: string;
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
          "flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 text-sm text-muted-foreground",
          className,
        )}
      >
        No photos for this listing yet.
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10">
        <Image
          src={current.url}
          alt={`${title} — photo ${active + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
        />
      </div>
      {sorted.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg ring-2 transition-shadow",
                i === active ? "ring-foreground" : "ring-transparent hover:ring-muted-foreground/40",
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
