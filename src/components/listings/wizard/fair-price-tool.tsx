"use client";

import { useEffect, useState } from "react";
import { BarChart2 } from "lucide-react";

import { getFairPriceData, type FairPriceData } from "@/app/actions/fair-price";
import { cn } from "@/lib/utils";

export function FairPriceTool({
  categoryId,
  condition,
  price,
  className,
}: {
  categoryId: string;
  condition: string;
  price: number;
  className?: string;
}) {
  if (!categoryId || !condition) {
    return null;
  }

  return (
    <FairPriceToolFetch
      key={`${categoryId}:${condition}`}
      categoryId={categoryId}
      condition={condition}
      price={price}
      className={className}
    />
  );
}

function FairPriceToolFetch({
  categoryId,
  condition,
  price,
  className,
}: {
  categoryId: string;
  condition: string;
  price: number;
  className?: string;
}) {
  const [fairPriceData, setFairPriceData] = useState<FairPriceData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getFairPriceData(categoryId, condition).then((data) => {
      if (!cancelled) {
        setFairPriceData(data);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [categoryId, condition]);

  if (!ready || !fairPriceData) {
    return null;
  }

  const range = fairPriceData.high - fairPriceData.low;
  const medianLeft =
    range > 0
      ? ((fairPriceData.median - fairPriceData.low) / range) * 80 + 10
      : 50;
  const priceInRange =
    price > 0 && price >= fairPriceData.low && price <= fairPriceData.high;
  const priceLeft =
    range > 0 && priceInRange ? ((price - fairPriceData.low) / range) * 80 + 10 : null;

  return (
    <div className={cn("mt-4 overflow-hidden rounded-2xl border border-[#EEECE8]", className)}>
      <div className="flex items-center justify-between border-b border-[#EEECE8] bg-[#F7F6F3] px-4 py-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-[#1D9E75]" aria-hidden />
          <span className="text-xs font-bold text-[#111111]">Τιμές πώλησης στη mint</span>
        </div>
        <span className="text-[10px] text-[#ABABAB]">
          {fairPriceData.sampleSize} πωλήσεις · τελευταίοι 6 μήνες
        </span>
      </div>

      <div className="px-4 py-4">
        <div className="mb-2 flex items-end justify-between">
          <span className="text-xs text-[#ABABAB]">€{fairPriceData.low.toFixed(0)}</span>
          <span className="text-xs font-bold text-[#111111]">
            Διάμεσος €{fairPriceData.median.toFixed(0)}
          </span>
          <span className="text-xs text-[#ABABAB]">€{fairPriceData.high.toFixed(0)}</span>
        </div>

        <div className="relative h-2 rounded-full bg-[#EEECE8]">
          <div
            className="absolute h-full rounded-full bg-[#1D9E75]/30"
            style={{ left: "10%", right: "10%" }}
          />
          <div
            className="absolute -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#1D9E75] shadow-sm"
            style={{ left: `${medianLeft}%`, transform: "translateX(-50%)" }}
          />
          {priceLeft != null ? (
            <div
              className="absolute -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-[#111111] shadow-sm"
              style={{ left: `${priceLeft}%`, transform: "translateX(-50%)" }}
            />
          ) : null}
        </div>

        {price > 0 ? (
          <p className="mt-3 text-center text-xs text-[#6B6B6B]">
            {price < fairPriceData.low * 0.8
              ? "💡 Η τιμή σου είναι χαμηλή — θα πουλήσει γρήγορα."
              : price > fairPriceData.high * 1.2
                ? "💡 Η τιμή σου είναι υψηλή για αυτή την κατηγορία."
                : "✓ Η τιμή σου είναι στο εύρος της αγοράς."}
          </p>
        ) : null}
      </div>
    </div>
  );
}
