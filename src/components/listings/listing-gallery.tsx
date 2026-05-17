"use client";

import Image from "next/image";
import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, Images } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ListingImageRow } from "@/types/listings";

function Lightbox({
  images,
  activeIndex,
  onClose,
  onSetIndex,
}: {
  images: ListingImageRow[];
  activeIndex: number;
  onClose: () => void;
  onSetIndex: (i: number) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onSetIndex(Math.max(0, activeIndex - 1));
      if (e.key === "ArrowRight") onSetIndex(Math.min(images.length - 1, activeIndex + 1));
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [activeIndex, images.length, onClose, onSetIndex]);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95" onClick={onClose}>
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-4 py-3"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-sm font-medium text-white/50">
          {activeIndex + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Main image */}
      <div className="relative min-h-0 flex-1" onClick={(e) => e.stopPropagation()}>
        <Image
          src={images[activeIndex]!.url}
          alt=""
          fill
          className="object-contain"
          sizes="100vw"
        />
        {activeIndex > 0 && (
          <button
            type="button"
            onClick={() => onSetIndex(activeIndex - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
        {activeIndex < images.length - 1 && (
          <button
            type="button"
            onClick={() => onSetIndex(activeIndex + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-5 pt-3"
          onClick={(e) => e.stopPropagation()}
          style={{ scrollbarWidth: "none" }}
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => onSetIndex(i)}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                i === activeIndex
                  ? "border-white opacity-100"
                  : "border-transparent opacity-40 hover:opacity-70",
              )}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="56px" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  );
}

export function ListingGallery({
  title,
  images,
  className,
  bleed,
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

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [desktopSelected, setDesktopSelected] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setCarouselIndex(i);
  }, []);

  if (!sorted.length) {
    return (
      <div
        className={cn(
          "flex min-h-60 items-center justify-center bg-[#F7F6F3] text-sm text-[#AAAAAA] sm:min-h-72",
          detailLayout && bleed ? "rounded-none lg:rounded-2xl" : "rounded-2xl",
          className,
        )}
      >
        No photos for this listing yet.
      </div>
    );
  }

  const n = sorted.length;

  if (!detailLayout) {
    // Simple layout for non-detail contexts
    return (
      <div className={cn("space-y-2", className)}>
        <div
          className={cn(
            "relative aspect-4/3 w-full overflow-hidden bg-[#F7F6F3]",
            bleed ? "rounded-none sm:rounded-2xl" : "rounded-2xl",
          )}
        >
          <Image
            src={sorted[carouselIndex]!.url}
            alt={`${title} — photo ${carouselIndex + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
            priority
          />
        </div>
        {n > 1 && (
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {sorted.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setCarouselIndex(i)}
                className={cn(
                  "relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                  i === carouselIndex
                    ? "border-[#1D9E75] opacity-100"
                    : "border-transparent opacity-50 hover:opacity-100",
                )}
              >
                <Image src={img.url} alt="" fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── DETAIL LAYOUT ────────────────────────────────────────────────────────────

  return (
    <div className={cn(className)}>
      {/* ── Mobile: scroll-snap carousel ───────────────────────────── */}
      <div className="relative lg:hidden">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex snap-x snap-mandatory overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {sorted.map((img, i) => (
            <button
              key={img.id}
              type="button"
              className="relative aspect-4/3 w-full shrink-0 snap-start overflow-hidden bg-[#F7F6F3]"
              style={{ minWidth: "100%" }}
              onClick={() => openLightbox(i)}
            >
              <Image
                src={img.url}
                alt={`${title} — photo ${i + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
              />
            </button>
          ))}
        </div>
        {/* Counter badge */}
        {n > 1 && (
          <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {carouselIndex + 1} / {n}
          </div>
        )}
      </div>

      {/* ── Desktop: cover + thumbnail strip ───────────────────────── */}
      <div className="hidden lg:block">
        {/* Cover image */}
        <button
          type="button"
          onClick={() => openLightbox(desktopSelected)}
          className="relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F7F6F3] group"
        >
          <Image
            src={sorted[desktopSelected]!.url}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="55vw"
            priority
          />
          {/* "All photos" pill */}
          {n > 1 && (
            <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-white/30 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <Images className="size-3.5" />
              {n} photos
            </span>
          )}
        </button>

        {/* Thumbnail strip */}
        {n > 1 && (
          <div
            className="mt-2 flex gap-2 overflow-x-auto pb-0.5"
            style={{ scrollbarWidth: "none" }}
          >
            {sorted.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setDesktopSelected(i)}
                className={cn(
                  "relative h-[72px] w-[96px] shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-150",
                  i === desktopSelected
                    ? "border-[#111111] opacity-100"
                    : "border-transparent opacity-55 hover:opacity-90",
                )}
              >
                <Image src={img.url} alt="" fill className="object-cover" sizes="96px" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          images={sorted}
          activeIndex={lightboxIndex}
          onClose={closeLightbox}
          onSetIndex={setLightboxIndex}
        />
      )}
    </div>
  );
}
