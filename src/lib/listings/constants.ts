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
