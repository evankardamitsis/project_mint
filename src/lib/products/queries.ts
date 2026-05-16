import { createClient } from "@/lib/supabase/server";
import type {
  ProductPhotoRequirementRow,
  ProductPriceEstimateRow,
  ProductSearchHit,
  ProductShippingProfileRow,
  ProductWizardBundle,
  CatalogProductRow,
} from "@/types/product-catalog";

export async function searchProducts(query: string, limit = 24): Promise<ProductSearchHit[]> {
  const q = query.trim();
  if (q.length < 2) {
    return [];
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_products", {
    p_query: q,
    p_limit: Math.min(Math.max(limit, 1), 48),
  });
  if (error) {
    console.error("[products] searchProducts", error.message);
    return [];
  }
  return (data ?? []) as ProductSearchHit[];
}

function sortPhotoRequirements(rows: ProductPhotoRequirementRow[]): ProductPhotoRequirementRow[] {
  return [...rows].sort((a, b) => {
    const ap = a.product_id ? 1 : 0;
    const bp = b.product_id ? 1 : 0;
    if (ap !== bp) {
      return bp - ap;
    }
    return a.sort_order - b.sort_order;
  });
}

/**
 * Photo checklist + shipping hint for a category, optionally refined by a catalog product.
 */
export async function fetchListingWizardContext(args: {
  categoryId: string;
  productId?: string | null;
}): Promise<ProductWizardBundle> {
  const supabase = await createClient();
  const { categoryId, productId } = args;

  const productPromise = productId
    ? supabase
        .from("products")
        .select(
          "id, category_id, brand_id, name, slug, model, default_title_template, description_prompt, protected_delivery_recommended",
        )
        .eq("id", productId)
        .maybeSingle()
    : Promise.resolve({ data: null, error: null });

  const photosPromise = productId
    ? supabase
        .from("product_photo_requirements")
        .select("*")
        .or(`product_id.eq.${productId},and(category_id.eq.${categoryId},product_id.is.null)`)
        .order("sort_order", { ascending: true })
    : supabase
        .from("product_photo_requirements")
        .select("*")
        .eq("category_id", categoryId)
        .is("product_id", null)
        .order("sort_order", { ascending: true });

  const shipsPromise = productId
    ? supabase
        .from("product_shipping_profiles")
        .select("*")
        .or(`product_id.eq.${productId},and(category_id.eq.${categoryId},product_id.is.null)`)
    : supabase
        .from("product_shipping_profiles")
        .select("*")
        .eq("category_id", categoryId)
        .is("product_id", null);

  const pricesPromise = productId
    ? supabase.from("product_price_estimates").select("*").eq("product_id", productId)
    : Promise.resolve({ data: [] as ProductPriceEstimateRow[], error: null });

  const [productRes, photosRes, shipsRes, pricesRes] = await Promise.all([
    productPromise,
    photosPromise,
    shipsPromise,
    pricesPromise,
  ]);

  if (photosRes.error) {
    console.error("[products] photo requirements", photosRes.error.message);
  }
  if (shipsRes.error) {
    console.error("[products] shipping profiles", shipsRes.error.message);
  }

  const photos = sortPhotoRequirements((photosRes.data ?? []) as ProductPhotoRequirementRow[]);

  const ships = (shipsRes.data ?? []) as ProductShippingProfileRow[];
  const shippingProfile =
    ships.sort((a, b) => {
      const ap = a.product_id ? 1 : 0;
      const bp = b.product_id ? 1 : 0;
      return bp - ap;
    })[0] ?? null;

  return {
    product: (productRes.data ?? null) as CatalogProductRow | null,
    categoryId,
    priceEstimates: (pricesRes.data ?? []) as ProductPriceEstimateRow[],
    photoRequirements: photos,
    shippingProfile,
  };
}
