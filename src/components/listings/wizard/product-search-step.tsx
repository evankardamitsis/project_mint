"use client";

import { PenLine } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { searchProductsAction } from "@/lib/products/actions";
import type { ProductSearchHit } from "@/types/product-catalog";

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
        <label htmlFor="product-search" className="text-xs font-medium text-[#666666]">
          Μάρκα ή μοντέλο
        </label>
        <input
          id="product-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="π.χ. Strat, SM7B, Minilogue…"
          autoComplete="off"
          className="w-full rounded-xl border border-[#EEECE8] bg-white px-4 py-3.5 text-sm text-[#111111] outline-none transition-all placeholder:text-[#ABABAB] focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]"
        />
        {loading ? <p className="text-xs text-[#999999]">Αναζήτηση…</p> : null}
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
        <p className="rounded-xl border border-dashed border-[#EEECE8] bg-[#FAFAF8] px-4 py-6 text-center text-sm text-[#6B6B6B]">
          Δεν βρέθηκε πρότυπο. Δοκίμασε άλλη ονομασία ή ξεκίνα από το μηδέν.
        </p>
      ) : null}

      <div className="rounded-2xl border border-[#EEECE8] bg-[#FAFAF8] p-4">
        <p className="text-sm text-[#6B6B6B]">
          Δεν βρίσκεις το ακριβές μοντέλο; Μπορείς να δημιουργήσεις αγγελία χωρίς πρότυπο.
        </p>
        <button
          type="button"
          onClick={onListFromScratch}
          className="mt-3 flex items-center gap-2 rounded-xl border border-[#EEECE8] bg-[#F7F6F3] px-5 py-3 text-sm font-semibold text-[#111111] transition-all hover:border-[#DDDBD6] hover:bg-[#F0EEE9]"
        >
          <PenLine className="h-4 w-4 text-[#6B6B6B]" aria-hidden />
          Ξεκίνα από το μηδέν
        </button>
      </div>
    </div>
  );
}
