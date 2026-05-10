"use client";

import Image from "next/image";
import { forwardRef, useCallback, useState } from "react";

import { Label } from "@/components/ui/label";
import {
  LISTING_IMAGE_ACCEPTED_TYPES,
  LISTING_IMAGE_MAX_BYTES,
  MAX_LISTING_IMAGES,
} from "@/lib/listings/constants";
import { cn } from "@/lib/utils";

type Preview = { name: string; src: string };

export const ListingImageUploader = forwardRef<
  HTMLInputElement,
  { className?: string; error?: string }
>(function ListingImageUploader({ className, error }, ref) {
  const [previews, setPreviews] = useState<Preview[]>([]);

  const onFiles = useCallback((list: FileList | null) => {
    if (!list?.length) {
      setPreviews([]);
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
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="listing-images">Photos (optional, up to {MAX_LISTING_IMAGES})</Label>
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
        JPEG, PNG, WebP, or GIF — max {LISTING_IMAGE_MAX_BYTES / 1024 / 1024} MB each. Public bucket
        URLs are stored after upload.
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
