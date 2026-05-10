"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo } from "react";

import { ListingImageUploader } from "@/components/listings/listing-image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createListingAction,
  type CreateListingState,
} from "@/lib/listings/actions";
import type { BrandOption, CategoryOption } from "@/types/listings";
import type { ListingCondition } from "@/types/domain";

const conditions: { value: ListingCondition; label: string }[] = [
  { value: "brand_new", label: "Brand new" },
  { value: "mint", label: "Mint" },
  { value: "excellent", label: "Excellent" },
  { value: "very_good", label: "Very good" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "poor", label: "Poor" },
  { value: "non_functioning", label: "Non-functioning" },
];

export function ListingForm({
  categories,
  brands,
}: {
  categories: CategoryOption[];
  brands: BrandOption[];
}) {
  const router = useRouter();
  const initial = useMemo<CreateListingState>(() => ({ ok: false }), []);

  const [state, formAction, pending] = useActionState(
    createListingAction,
    initial,
  );

  useEffect(() => {
    if (state.ok) {
      router.push(`/listing/${state.slug}`);
    }
  }, [router, state]);

  const fieldErrors =
    state.ok === false && "fieldErrors" in state ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="e.g. Fender Player Stratocaster" />
            {fieldErrors?.title ? (
              <p className="text-xs text-destructive">{fieldErrors.title}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <select
              id="category_id"
              name="category_id"
              required
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              defaultValue=""
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {fieldErrors?.category_id ? (
              <p className="text-xs text-destructive">{fieldErrors.category_id}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand_id">Brand (optional)</Label>
            <select
              id="brand_id"
              name="brand_id"
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              defaultValue=""
            >
              <option value="">No brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={5}
              placeholder="Condition details, what is included, history…"
            />
            {fieldErrors?.description ? (
              <p className="text-xs text-destructive">{fieldErrors.description}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="condition">Condition</Label>
            <select
              id="condition"
              name="condition"
              required
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              defaultValue="excellent"
            >
              {conditions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {fieldErrors?.condition ? (
              <p className="text-xs text-destructive">{fieldErrors.condition}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="price_euros">Price (EUR)</Label>
            <Input
              id="price_euros"
              name="price_euros"
              type="text"
              inputMode="decimal"
              required
              placeholder="e.g. 850 or 1299.50"
            />
            {fieldErrors?.price_euros ? (
              <p className="text-xs text-destructive">{fieldErrors.price_euros}</p>
            ) : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" placeholder="City or region" />
            {fieldErrors?.location ? (
              <p className="text-xs text-destructive">{fieldErrors.location}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:col-span-2">
            <div className="flex items-center gap-2">
              <input
                id="offers_enabled"
                name="offers_enabled"
                type="checkbox"
                value="on"
                defaultChecked
                className="size-4 rounded border border-input accent-primary"
              />
              <Label htmlFor="offers_enabled" className="font-normal">
                Allow offers on this listing
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="protected_delivery_enabled"
                name="protected_delivery_enabled"
                type="checkbox"
                value="on"
                className="size-4 rounded border border-input accent-primary"
              />
              <Label htmlFor="protected_delivery_enabled" className="font-normal">
                Offer protected delivery (workflow coming later)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingImageUploader />
        </CardContent>
      </Card>

      {!state.ok && state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok && "warning" in state && state.warning ? (
        <p className="text-sm text-amber-700 dark:text-amber-400" role="status">
          {state.warning}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Publishing…" : "Submit for review"}
        </Button>
        <Button variant="outline" type="button" render={<Link href="/seller/listings" />}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
