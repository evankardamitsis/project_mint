"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { ListingImageUploader } from "@/components/listings/listing-image-uploader";
import {
  type UpdateSellerListingState,
  deleteListingImageAction,
  updateSellerListingAction,
} from "@/lib/listings/seller-actions";
import { centsToEurosInput } from "@/lib/listings/money";
import { formatEuroPrefix } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { conditionSelectOptions } from "@/lib/listings/condition-display";
import type { BrandOption, CategoryOption, SellerListingEditData } from "@/types/listings";
import type { ListingCondition } from "@/types/domain";

const conditions = conditionSelectOptions();

function buildEditFormData(
  listingId: string,
  fields: {
    title: string;
    categoryId: string;
    brandId: string;
    description: string;
    condition: ListingCondition;
    priceEuros: string;
    location: string;
    offersEnabled: boolean;
    protectedDeliveryEnabled: boolean;
  },
  imageInput: HTMLInputElement | null,
): FormData {
  const fd = new FormData();
  fd.set("listing_id", listingId);
  fd.set("title", fields.title);
  fd.set("category_id", fields.categoryId);
  fd.set("brand_id", fields.brandId);
  fd.set("description", fields.description);
  fd.set("condition", fields.condition);
  fd.set("price_euros", fields.priceEuros);
  fd.set("location", fields.location);
  if (fields.offersEnabled) {
    fd.set("offers_enabled", "on");
  }
  if (fields.protectedDeliveryEnabled) {
    fd.set("protected_delivery_enabled", "on");
  }
  const list = imageInput?.files;
  if (list?.length) {
    for (let i = 0; i < list.length; i += 1) {
      const file = list.item(i);
      if (file && file.size > 0) {
        fd.append("images", file);
      }
    }
  }
  return fd;
}

export function ListingEditForm({
  listing,
  categories,
  brands,
}: {
  listing: SellerListingEditData;
  categories: CategoryOption[];
  brands: BrandOption[];
}) {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const initial = useMemo<UpdateSellerListingState>(() => ({ ok: false }), []);

  const [title, setTitle] = useState(listing.title);
  const [categoryId, setCategoryId] = useState(listing.category_id);
  const [brandId, setBrandId] = useState(listing.brand_id ?? "");
  const [description, setDescription] = useState(listing.description ?? "");
  const [condition, setCondition] = useState<ListingCondition>(listing.condition);
  const [priceEuros, setPriceEuros] = useState(centsToEurosInput(listing.price_cents));
  const [location, setLocation] = useState(listing.location ?? "");
  const [offersEnabled, setOffersEnabled] = useState(listing.offers_enabled);
  const [protectedDeliveryEnabled, setProtectedDeliveryEnabled] = useState(
    listing.protected_delivery_enabled,
  );
  const [images, setImages] = useState(listing.images);

  const [state, formAction, pending] = useActionState(updateSellerListingAction, initial);

  useEffect(() => {
    if (state.ok) {
      router.push(`/listing/${state.slug}`);
      router.refresh();
    }
  }, [router, state]);

  const fieldErrors =
    state.ok === false && "fieldErrors" in state ? state.fieldErrors : undefined;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) {
      return;
    }
    const fd = buildEditFormData(
      listing.id,
      {
        title,
        categoryId,
        brandId,
        description,
        condition,
        priceEuros,
        location,
        offersEnabled,
        protectedDeliveryEnabled,
      },
      imageInputRef.current,
    );
    startTransition(() => {
      formAction(fd);
    });
  }

  async function removeImage(imageId: string) {
    const res = await deleteListingImageAction(listing.id, imageId);
    if (res.ok) {
      setImages((prev) => prev.filter((i) => i.id !== imageId));
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <input type="hidden" name="listing_id" value={listing.id} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              minLength={3}
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
            />
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
              value={categoryId}
              onChange={(ev) => setCategoryId(ev.target.value)}
            >
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
              value={brandId}
              onChange={(ev) => setBrandId(ev.target.value)}
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
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
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
              value={condition}
              onChange={(ev) => setCondition(ev.target.value as ListingCondition)}
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
              value={priceEuros}
              onChange={(ev) => setPriceEuros(ev.target.value)}
            />
            {fieldErrors?.price_euros ? (
              <p className="text-xs text-destructive">{fieldErrors.price_euros}</p>
            ) : null}
            {listing.price_history?.[0] ? (
              <p className="text-xs text-muted-foreground">
                Last recorded change:{" "}
                <span className="font-medium tabular-nums text-foreground">
                  {formatEuroPrefix(listing.price_history[0].old_price_cents)} →{" "}
                  {formatEuroPrefix(listing.price_history[0].new_price_cents)}
                </span>
                {listing.price_history[0].change_percent != null ? (
                  <span className="tabular-nums">
                    {" "}
                    ({Number(listing.price_history[0].change_percent) >= 0 ? "+" : ""}
                    {Number(listing.price_history[0].change_percent).toFixed(1)}%)
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={location}
              onChange={(ev) => setLocation(ev.target.value)}
            />
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
                checked={offersEnabled}
                onChange={(ev) => setOffersEnabled(ev.target.checked)}
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
                checked={protectedDeliveryEnabled}
                onChange={(ev) => setProtectedDeliveryEnabled(ev.target.checked)}
                className="size-4 rounded border border-input accent-primary"
              />
              <Label htmlFor="protected_delivery_enabled" className="font-normal">
                Offer protected delivery
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {listing.price_history && listing.price_history.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Price history</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {listing.price_history.map((h) => (
                <li key={h.id} className="flex flex-wrap items-baseline gap-x-2 tabular-nums">
                  <span className="font-medium text-foreground">
                    {formatEuroPrefix(h.old_price_cents)} → {formatEuroPrefix(h.new_price_cents)}
                  </span>
                  <span className="text-xs">
                    {new Date(h.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                  {h.change_percent != null ? (
                    <span className="text-xs">
                      ({Number(h.change_percent) >= 0 ? "+" : ""}
                      {Number(h.change_percent).toFixed(1)}%)
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {images.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative flex flex-col gap-2 rounded-lg border border-border p-2"
                >
                  <div className="relative size-24 overflow-hidden rounded-md bg-muted">
                    <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => void removeImage(img.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No photos yet.</p>
          )}
          <ListingImageUploader ref={imageInputRef} />
        </CardContent>
      </Card>

      {!state.ok && state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok && "warning" in state && state.warning ? (
        <p className="text-sm text-amber-warn" role="status">
          {state.warning}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        <Button variant="outline" type="button" render={<Link href={`/listing/${listing.slug}`} />}>
          View listing
        </Button>
        <Button variant="outline" type="button" render={<Link href="/seller/listings" />}>
          Back to listings
        </Button>
      </div>
    </form>
  );
}
