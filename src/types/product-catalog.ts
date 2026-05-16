import type { ListingCondition } from "@/types/domain";

/**
 * Curated catalog row (`public.products`). Same table can later back
 * image-based recognition, algorithmic pricing, and buyer saved-search personalization.
 */
export type CatalogProductRow = {
  id: string;
  category_id: string;
  brand_id: string;
  name: string;
  slug: string;
  model: string | null;
  default_title_template: string | null;
  description_prompt: string | null;
  protected_delivery_recommended: boolean;
};

/** One row returned by `public.search_products` (text search MVP). */
export type ProductSearchHit = {
  id: string;
  name: string;
  slug: string;
  model: string | null;
  brand_id: string;
  brand_name: string;
  brand_slug: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  default_title_template: string | null;
  description_prompt: string | null;
  protected_delivery_recommended: boolean;
};

export type ProductPriceEstimateRow = {
  id: string;
  product_id: string;
  condition: ListingCondition;
  low_price_cents: number;
  high_price_cents: number;
  median_price_cents: number | null;
  sample_size: number;
  source: string;
};

export type ProductPhotoRequirementRow = {
  id: string;
  product_id: string | null;
  category_id: string | null;
  label: string;
  helper_text: string | null;
  required: boolean;
  sort_order: number;
};

export type ProductShippingProfileRow = {
  id: string;
  product_id: string | null;
  category_id: string | null;
  package_length_cm: number | null;
  package_width_cm: number | null;
  package_height_cm: number | null;
  package_weight_kg: string | null;
  packaging_kit_label: string | null;
  packaging_notes: string | null;
};

/**
 * Everything the listing wizard needs after a template is chosen.
 * Future: vision-derived attributes, AI description drafts, dynamic price models.
 */
export type ProductWizardBundle = {
  product: CatalogProductRow | null;
  categoryId: string;
  priceEstimates: ProductPriceEstimateRow[];
  photoRequirements: ProductPhotoRequirementRow[];
  shippingProfile: ProductShippingProfileRow | null;
};
