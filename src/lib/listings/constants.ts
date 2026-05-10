/** Supabase Storage bucket for listing photos (public bucket — URLs stored in DB). */
export const LISTING_IMAGES_BUCKET = "listing-images";

/** Max single file size (matches bucket file_size_limit in migration). */
export const LISTING_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const LISTING_IMAGE_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type ListingImageMime = (typeof LISTING_IMAGE_ACCEPTED_TYPES)[number];

export const MAX_LISTING_IMAGES = 10;

/** Extract `bucket/object/path` object path from a public object URL, or null. */
export function listingImageObjectPathFromPublicUrl(publicUrl: string): string | null {
  const marker = `/object/public/${LISTING_IMAGES_BUCKET}/`;
  const i = publicUrl.indexOf(marker);
  if (i === -1) {
    return null;
  }
  try {
    return decodeURIComponent(publicUrl.slice(i + marker.length));
  } catch {
    return null;
  }
}
