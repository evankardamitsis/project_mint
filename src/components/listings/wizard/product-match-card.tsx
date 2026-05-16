import type { ProductSearchHit } from "@/types/product-catalog";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductMatchCard({
  hit,
  onSelect,
  className,
}: {
  hit: ProductSearchHit;
  onSelect: (hit: ProductSearchHit) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-1 rounded-2xl border border-[#e8e4df] bg-white p-4 text-left shadow-sm transition hover:border-[#111111]/25 hover:shadow-md",
        className,
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#888888]">
        {hit.brand_name} · {hit.category_name}
      </span>
      <span className="text-[15px] font-semibold text-[#111111]">{hit.name}</span>
      {hit.model ? <span className="text-[12px] text-[#666666]">Model: {hit.model}</span> : null}
      <Button
        type="button"
        className="mt-2 w-full rounded-xl bg-[#111111] text-[11px] font-bold uppercase tracking-wide text-white"
        onClick={() => onSelect(hit)}
      >
        Use this template
      </Button>
    </div>
  );
}
