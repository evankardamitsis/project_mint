import { z } from "zod";

import type { ListingCondition } from "@/types/domain";

const conditions: [ListingCondition, ...ListingCondition[]] = [
  "brand_new",
  "mint",
  "excellent",
  "very_good",
  "good",
  "fair",
  "poor",
  "non_functioning",
];

export const listingCreateFieldSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(200, "Title is too long."),
  category_id: z.string().uuid("Pick a category."),
  brand_id: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().uuid().optional(),
  ),
  description: z
    .string()
    .trim()
    .max(20_000, "Description is too long.")
    .optional()
    .default(""),
  condition: z.enum(conditions),
  price_euros: z.string().min(1, "Price is required."),
  location: z
    .string()
    .trim()
    .max(200, "Location is too long.")
    .optional()
    .default(""),
  offers_enabled: z.coerce.boolean(),
  protected_delivery_enabled: z.coerce.boolean(),
  product_id: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().uuid().optional(),
  ),
});

export type ListingCreateFields = z.infer<typeof listingCreateFieldSchema>;

/** Same field rules as create; used for seller edits. */
export const listingEditFieldSchema = listingCreateFieldSchema;

export type ListingEditFields = z.infer<typeof listingEditFieldSchema>;
