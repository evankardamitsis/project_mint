"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { conditionSelectOptions } from "@/lib/listings/condition-display";
import type { BrandOption, CategoryOption } from "@/types/listings";

const conditions = conditionSelectOptions();

export type BrowseFilterChipLabels = {
  clearAllLink: string;
  filterCategory: string;
  filterBrand: string;
  filterCondition: string;
  filterPrice: string;
  filterPriceDrops: string;
  filterAllCategories: string;
  filterAllBrands: string;
  filterAnyCondition: string;
  sortNewest: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  priceAny: string;
  priceUnder250: string;
  price250to500: string;
  price500to1000: string;
  priceOver1000: string;
};

type Values = {
  q: string;
  category: string;
  brand: string;
  condition: string;
  min_price: string;
  max_price: string;
  sort: string;
  deal: string;
  priceDrop: string;
};

function browseHref(patch: Partial<Record<string, string>>) {
  const p = new URLSearchParams();
  const merged: Record<string, string> = { ...patch } as Record<string, string>;
  for (const [k, v] of Object.entries(merged)) {
    if (v) {
      p.set(k, v);
    }
  }
  const s = p.toString();
  return s ? `/browse?${s}` : "/browse";
}

function hrefWith(base: Values, patch: Partial<Values>) {
  const next = { ...base, ...patch };
  return browseHref({
    ...(next.q ? { q: next.q } : {}),
    ...(next.category ? { category: next.category } : {}),
    ...(next.brand ? { brand: next.brand } : {}),
    ...(next.condition ? { condition: next.condition } : {}),
    ...(next.min_price ? { min_price: next.min_price } : {}),
    ...(next.max_price ? { max_price: next.max_price } : {}),
    ...(next.sort && next.sort !== "newest" ? { sort: next.sort } : {}),
    ...(next.deal === "price-drops" ? { deal: next.deal } : {}),
    ...(next.priceDrop === "true" ? { priceDrop: "true" } : {}),
  });
}

function ChipDetails({
  label,
  active,
  children,
}: {
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="group relative">
      <summary
        data-mint-browse-chip
        className={cn(
          "inline-flex cursor-pointer list-none items-center gap-1.25 rounded-none border border-[#cccccc] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#444444] marker:content-none [&::-webkit-details-marker]:hidden",
          active && "border-[#111111] bg-[#111111] text-white",
        )}
      >
        <span className="max-w-40 truncate">{label}</span>
        <span className="shrink-0 text-[10px] opacity-80" aria-hidden>
          ▾
        </span>
      </summary>
      <div className="absolute left-0 z-40 mt-1 max-h-[min(70vh,20rem)] min-w-44 overflow-auto rounded-none border border-[#111111] bg-white py-1 shadow-md">
        {children}
      </div>
    </details>
  );
}

function ChipLinkRow({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-none px-3 py-2 text-[12px] text-[#444444] hover:bg-[#f5f3ee]"
      onClick={() => {
        document.querySelectorAll("details[open]").forEach((d) => {
          if (d instanceof HTMLDetailsElement) {
            d.open = false;
          }
        });
      }}
    >
      {children}
    </Link>
  );
}

const PRICE_PRESETS: { min: string; max: string; key: keyof Pick<BrowseFilterChipLabels, "priceAny" | "priceUnder250" | "price250to500" | "price500to1000" | "priceOver1000"> }[] = [
  { key: "priceAny", min: "", max: "" },
  { key: "priceUnder250", min: "", max: "250" },
  { key: "price250to500", min: "250", max: "500" },
  { key: "price500to1000", min: "500", max: "1000" },
  { key: "priceOver1000", min: "1000", max: "" },
];

export function ListingFilterChips({
  categories,
  brands,
  values,
  labels,
}: {
  categories: CategoryOption[];
  brands: BrandOption[];
  values: Values;
  labels: BrowseFilterChipLabels;
}) {
  const categoryLabel = values.category
    ? (categories.find((c) => c.slug === values.category)?.name ?? labels.filterCategory)
    : labels.filterCategory;
  const brandLabel = values.brand
    ? (brands.find((b) => b.slug === values.brand)?.name ?? labels.filterBrand)
    : labels.filterBrand;
  const conditionLabel = values.condition
    ? (conditions.find((c) => c.value === values.condition)?.label ?? labels.filterCondition)
    : labels.filterCondition;

  const priceActive = Boolean(values.min_price || values.max_price);
  let priceLabel = labels.filterPrice;
  if (priceActive) {
    const { min_price: minP, max_price: maxP } = values;
    if (minP && maxP) {
      priceLabel = `€${minP}–€${maxP}`;
    } else if (maxP) {
      priceLabel = `≤€${maxP}`;
    } else if (minP) {
      priceLabel = `≥€${minP}`;
    }
  }

  const sortLabels: Record<string, string> = {
    newest: labels.sortNewest,
    price_asc: labels.sortPriceAsc,
    price_desc: labels.sortPriceDesc,
  };
  const sortLabel = sortLabels[values.sort || "newest"] ?? labels.sortNewest;
  const sortActive = Boolean(values.sort && values.sort !== "newest");

  const filtersActive = Boolean(
    values.q?.trim() ||
      values.category ||
      values.brand ||
      values.condition ||
      values.min_price ||
      values.max_price ||
      (values.sort && values.sort !== "newest") ||
      values.deal === "price-drops" ||
      values.priceDrop === "true",
  );

  const priceDropsActive = values.deal === "price-drops" || values.priceDrop === "true";

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <ChipDetails label={categoryLabel} active={Boolean(values.category)}>
          <ChipLinkRow href={hrefWith(values, { category: "" })}>{labels.filterAllCategories}</ChipLinkRow>
          {categories.map((c) => (
            <ChipLinkRow key={c.id} href={hrefWith(values, { category: c.slug })}>
              {c.name}
            </ChipLinkRow>
          ))}
        </ChipDetails>

        <ChipDetails label={brandLabel} active={Boolean(values.brand)}>
          <ChipLinkRow href={hrefWith(values, { brand: "" })}>{labels.filterAllBrands}</ChipLinkRow>
          {brands.map((b) => (
            <ChipLinkRow key={b.id} href={hrefWith(values, { brand: b.slug })}>
              {b.name}
            </ChipLinkRow>
          ))}
        </ChipDetails>

        <ChipDetails label={conditionLabel} active={Boolean(values.condition)}>
          <ChipLinkRow href={hrefWith(values, { condition: "" })}>{labels.filterAnyCondition}</ChipLinkRow>
          {conditions.map((c) => (
            <ChipLinkRow key={c.value} href={hrefWith(values, { condition: c.value })}>
              <span className="mint-condition-pill inline-block rounded-none border border-[#cccccc] bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#444444]">
                {c.label}
              </span>
            </ChipLinkRow>
          ))}
        </ChipDetails>

        <ChipDetails label={priceLabel} active={priceActive}>
          {PRICE_PRESETS.map((preset) => (
            <ChipLinkRow key={preset.key} href={hrefWith(values, { min_price: preset.min, max_price: preset.max })}>
              {labels[preset.key]}
            </ChipLinkRow>
          ))}
        </ChipDetails>

        <Link
          href={hrefWith(values, {
            deal: priceDropsActive ? "" : "price-drops",
            priceDrop: "",
          })}
          className={cn(
            "inline-flex shrink-0 list-none items-center gap-1.25 rounded-none border border-[#cccccc] bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#444444] hover:border-[#111111]/70",
            priceDropsActive && "border-[#111111] bg-[#111111] text-white",
          )}
        >
          {labels.filterPriceDrops}
        </Link>

        {filtersActive ? (
          <Link
            href="/browse"
            className="ml-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#1a7a4a] underline decoration-[#1a7a4a] underline-offset-2 hover:opacity-90"
          >
            {labels.clearAllLink}
          </Link>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center self-end sm:self-center sm:border-l-[0.5px] sm:border-[#ddd] sm:pl-3">
        <ChipDetails label={sortLabel} active={sortActive}>
          <ChipLinkRow href={hrefWith(values, { sort: "newest" })}>{labels.sortNewest}</ChipLinkRow>
          <ChipLinkRow href={hrefWith(values, { sort: "price_asc" })}>{labels.sortPriceAsc}</ChipLinkRow>
          <ChipLinkRow href={hrefWith(values, { sort: "price_desc" })}>{labels.sortPriceDesc}</ChipLinkRow>
        </ChipDetails>
      </div>
    </div>
  );
}
