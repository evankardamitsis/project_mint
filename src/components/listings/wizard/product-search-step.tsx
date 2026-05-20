"use client";

import { ChevronRight, PenLine } from "lucide-react";
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
    <div className={cn("mt-4 space-y-4", className)}>
      <div className="rounded-2xl border border-[#EEECE8] p-5 transition-all focus-within:border-[#1D9E75]">
        <p className="mb-3 text-xs font-bold tracking-widest text-[#ABABAB] uppercase">Ψάξε το μοντέλο</p>
        <input
          id="product-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="π.χ. Strat, SM7B, Minilogue…"
          autoComplete="off"
          className="w-full rounded-xl border border-[#EEECE8] bg-white px-4 py-3.5 text-sm text-[#111111] outline-none transition-all placeholder:text-[#ABABAB] focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]"
        />
        {loading ? <p className="mt-2 text-xs text-[#999999]">Αναζήτηση…</p> : null}
        {hits.length > 0 ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {hits.map((hit) => (
              <li key={hit.id}>
                <ProductMatchCard hit={hit} onSelect={onSelectProduct} />
              </li>
            ))}
          </ul>
        ) : q.trim().length >= 2 && !loading ? (
          <p className="mt-4 rounded-xl border border-dashed border-[#EEECE8] bg-[#FAFAF8] px-4 py-6 text-center text-sm text-[#6B6B6B]">
            Δεν βρέθηκε πρότυπο. Δοκίμασε άλλη ονομασία ή ξεκίνα από το μηδέν.
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#EEECE8]" />
        <span className="px-1 text-xs font-medium text-[#ABABAB]">ή</span>
        <div className="h-px flex-1 bg-[#EEECE8]" />
      </div>

      <button
        type="button"
        onClick={onListFromScratch}
        className="group flex w-full items-center gap-4 rounded-2xl border border-[#EEECE8] bg-[#F7F6F3] p-5 text-left transition-all hover:border-[#DDDBD6] hover:bg-[#F0EEE9]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
          <PenLine className="h-5 w-5 text-[#6B6B6B] transition-colors group-hover:text-[#111111]" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#111111]">Ξεκίνα από το μηδέν</p>
          <p className="mt-0.5 text-xs text-[#ABABAB]">Δημιούργησε αγγελία χωρίς πρότυπο</p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-[#ABABAB]" aria-hidden />
      </button>
    </div>
  );
}
