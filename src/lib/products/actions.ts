"use server";

import { fetchListingWizardContext, searchProducts } from "@/lib/products/queries";
import type { ProductSearchHit, ProductWizardBundle } from "@/types/product-catalog";

export async function searchProductsAction(query: string): Promise<ProductSearchHit[]> {
  return searchProducts(query, 24);
}

export async function fetchListingWizardContextAction(args: {
  categoryId: string;
  productId?: string | null;
}): Promise<ProductWizardBundle | null> {
  if (!args.categoryId) {
    return null;
  }
  return fetchListingWizardContext(args);
}
