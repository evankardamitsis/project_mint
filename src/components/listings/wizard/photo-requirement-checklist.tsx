import type { ProductPhotoRequirementRow } from "@/types/product-catalog";

import { cn } from "@/lib/utils";

export function PhotoRequirementChecklist({
  items,
  className,
}: {
  items: ProductPhotoRequirementRow[];
  className?: string;
}) {
  if (items.length === 0) {
    return (
      <p className={cn("text-[13px] text-[#777777]", className)}>
        Add several clear angles — buyers trust listings with honest, well-lit photos.
      </p>
    );
  }

  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((row) => (
        <li
          key={row.id}
          className="flex gap-3 rounded-xl border border-[#ece8e2] bg-white px-3 py-3 shadow-sm"
        >
          <span
            className={cn(
              "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
              row.required ? "bg-[#111111] text-white" : "bg-[#eeeeee] text-[#666666]",
            )}
            aria-hidden
          >
            {row.required ? "!" : "·"}
          </span>
          <div>
            <p className="text-[13px] font-semibold text-[#111111]">{row.label}</p>
            {row.helper_text ? <p className="mt-0.5 text-[12px] text-[#777777]">{row.helper_text}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
