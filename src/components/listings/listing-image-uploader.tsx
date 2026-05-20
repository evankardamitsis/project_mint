"use client";

import Image from "next/image";
import { Upload } from "lucide-react";
import { forwardRef, useCallback, useState } from "react";

import { Label } from "@/components/ui/label";
import {
  LISTING_IMAGE_ACCEPTED_TYPES,
  LISTING_IMAGE_MAX_BYTES,
  MAX_LISTING_IMAGES,
} from "@/lib/listings/constants";
import { cn } from "@/lib/utils";

type Preview = { name: string; src: string };

const WIZARD_ACCEPT = "image/jpeg,image/png,image/webp";

export const ListingImageUploader = forwardRef<
  HTMLInputElement,
  {
    className?: string;
    error?: string;
    hideLabel?: boolean;
    variant?: "default" | "wizard";
    onFileCountChange?: (count: number) => void;
    onFilesSelected?: (files: FileList) => void;
    uploadZoneId?: string;
  }
>(function ListingImageUploader(
  {
    className,
    error,
    hideLabel,
    variant = "default",
    onFileCountChange,
    onFilesSelected,
    uploadZoneId = "listing-images",
  },
  ref,
) {
  const [previews, setPreviews] = useState<Preview[]>([]);

  const onFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length) {
        setPreviews([]);
        onFileCountChange?.(0);
        return;
      }
      const next: Preview[] = [];
      const files = Array.from(list).slice(0, MAX_LISTING_IMAGES);
      for (const file of files) {
        if (file.size > LISTING_IMAGE_MAX_BYTES) {
          continue;
        }
        if (!(LISTING_IMAGE_ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
          continue;
        }
        next.push({ name: file.name, src: URL.createObjectURL(file) });
      }
      setPreviews((prev) => {
        for (const p of prev) {
          URL.revokeObjectURL(p.src);
        }
        return next;
      });
      onFileCountChange?.(next.length);
      onFilesSelected?.(list);
    },
    [onFileCountChange, onFilesSelected],
  );

  if (variant === "wizard") {
    return (
      <div className={cn("space-y-4", className)}>
        <label htmlFor={uploadZoneId} className="block cursor-pointer">
          <div className="mt-4 rounded-2xl border-2 border-dashed border-[#EEECE8] p-8 text-center transition-all hover:border-[#1D9E75] hover:bg-[#E8F7F1]/20 active:scale-[0.99]">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F6F3]">
              <Upload className="h-7 w-7 text-[#6B6B6B]" aria-hidden />
            </div>
            <p className="mb-1 text-sm font-bold text-[#111111]">Ανέβασε φωτογραφίες</p>
            <p className="text-xs leading-relaxed text-[#6B6B6B]">
              Πάτα εδώ ή σύρε φωτογραφίες — έως {MAX_LISTING_IMAGES} εικόνες
            </p>
            <p className="mt-2 text-xs text-[#ABABAB]">
              JPEG, PNG, WebP · max {LISTING_IMAGE_MAX_BYTES / 1024 / 1024}MB η καθεμία
            </p>
          </div>
          <input
            ref={ref}
            id={uploadZoneId}
            name="images"
            type="file"
            multiple
            accept={WIZARD_ACCEPT}
            className="sr-only"
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        {previews.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {previews.map((p) => (
              <div
                key={p.src}
                className="relative size-20 overflow-hidden rounded-xl border border-[#EEECE8] bg-[#F7F6F3]"
              >
                <Image
                  src={p.src}
                  alt=""
                  width={80}
                  height={80}
                  unoptimized
                  className="size-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {hideLabel ? null : (
        <Label htmlFor="listing-images">Photos (optional, up to {MAX_LISTING_IMAGES})</Label>
      )}
      <input
        ref={ref}
        id="listing-images"
        name="images"
        type="file"
        multiple
        accept={LISTING_IMAGE_ACCEPTED_TYPES.join(",")}
        className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground"
        onChange={(e) => onFiles(e.target.files)}
      />
      <p className="text-xs text-muted-foreground">
        JPEG, PNG, WebP, or GIF — max {LISTING_IMAGE_MAX_BYTES / 1024 / 1024} MB each.
      </p>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {previews.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {previews.map((p) => (
            <div
              key={p.src}
              className="relative size-20 overflow-hidden rounded-md border border-border bg-muted"
            >
              <Image
                src={p.src}
                alt=""
                width={80}
                height={80}
                unoptimized
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
});

ListingImageUploader.displayName = "ListingImageUploader";
