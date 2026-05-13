"use client";

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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createListingAction,
  type CreateListingState,
} from "@/lib/listings/actions";
import { conditionSelectOptions } from "@/lib/listings/condition-display";
import type { BrandOption, CategoryOption } from "@/types/listings";
import type { ListingCondition } from "@/types/domain";

const conditions = conditionSelectOptions();

function buildListingFormData(
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

export function ListingForm({
  categories,
  brands,
}: {
  categories: CategoryOption[];
  brands: BrandOption[];
}) {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const initial = useMemo<CreateListingState>(() => ({ ok: false }), []);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState<ListingCondition>("excellent");
  const [priceEuros, setPriceEuros] = useState("");
  const [location, setLocation] = useState("");
  const [offersEnabled, setOffersEnabled] = useState(true);
  const [protectedDeliveryEnabled, setProtectedDeliveryEnabled] = useState(false);

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

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) {
      return;
    }
    const fd = buildListingFormData(
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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
              placeholder="e.g. Fender Player Stratocaster"
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
              placeholder="Condition details, what is included, history…"
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
              placeholder="e.g. 850 or 1299.50"
              value={priceEuros}
              onChange={(ev) => setPriceEuros(ev.target.value)}
            />
            {fieldErrors?.price_euros ? (
              <p className="text-xs text-destructive">{fieldErrors.price_euros}</p>
            ) : null}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="City or region"
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photos</CardTitle>
        </CardHeader>
        <CardContent>
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
          {pending ? "Publishing…" : "Submit for review"}
        </Button>
        <Button variant="outline" type="button" render={<Link href="/seller/listings" />}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
