"use client";

import { useCallback, useEffect, useState } from "react";

import { searchProductsAction } from "@/lib/products/actions";
import type { ProductSearchHit } from "@/types/product-catalog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductMatchCard } from "@/components/listings/wizard/product-match-card";
import { cn } from "@/lib/utils";

export function ProductSearchStep({
  onSelectProduct,
  onListFromScratch,
  className,
}: {
  onSelectProduct: (hit: ProductSearchHit) => void;
  onListFromScratch: () => void;
  className?: string;
}) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<ProductSearchHit[]>([]);

  const runSearch = useCallback(async (query: string) => {
    const t = query.trim();
    if (t.length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    try {
      const rows = await searchProductsAction(t);
      setHits(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void runSearch(q);
    }, 300);
    return () => window.clearTimeout(id);
  }, [q, runSearch]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <label htmlFor="product-search" className="text-[11px] font-bold uppercase tracking-wide text-[#666666]">
          Search brand or model
        </label>
        <Input
          id="product-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="e.g. Strat, SM7B, Minilogue…"
          className="rounded-xl border-[#dcd6cf] bg-white text-[15px] placeholder:text-[#aaaaaa]"
          autoComplete="off"
        />
        {loading ? <p className="text-[12px] text-[#999999]">Searching…</p> : null}
      </div>

      {hits.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {hits.map((hit) => (
            <li key={hit.id}>
              <ProductMatchCard hit={hit} onSelect={onSelectProduct} />
            </li>
          ))}
        </ul>
      ) : q.trim().length >= 2 && !loading ? (
        <p className="rounded-xl border border-dashed border-[#dddddd] bg-[#faf9f6] px-4 py-6 text-center text-[13px] text-[#777777]">
          No templates match yet. Try another spelling, or list from scratch.
        </p>
      ) : null}

      <div className="rounded-2xl border border-[#ece8e2] bg-[#faf9f6] p-4">
        <p className="text-[13px] text-[#555555]">
          Can’t find your exact model? You can still list everything — we’ll just skip the template hints.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-3 rounded-xl border-[#111111] text-[11px] font-bold uppercase tracking-wide"
          onClick={onListFromScratch}
        >
          List from scratch
        </Button>
      </div>
    </div>
  );
}
