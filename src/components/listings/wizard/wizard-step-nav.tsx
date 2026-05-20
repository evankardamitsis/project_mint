"use client";

import { cn } from "@/lib/utils";

export function WizardStepNav({
  onBack,
  onNext,
  showNext = true,
  nextLabel = "Συνέχεια →",
  className,
}: {
  onBack: () => void;
  onNext?: () => void;
  showNext?: boolean;
  nextLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed right-0 bottom-0 left-0 z-40 flex items-center justify-between gap-3 border-t border-[#EEECE8] bg-white/95 p-4 backdrop-blur-sm lg:static lg:z-auto lg:mt-8 lg:border-0 lg:bg-transparent lg:p-0",
        className,
      )}
    >
      <button
        type="button"
        onClick={onBack}
        className="flex-1 rounded-2xl border border-[#EEECE8] bg-white px-6 py-3.5 text-sm font-semibold text-[#444444] transition-all hover:border-[#111111] lg:flex-none"
      >
        ← Πίσω
      </button>
      {showNext && onNext ? (
        <button
          type="button"
          onClick={onNext}
          className="flex-1 rounded-2xl bg-[#111111] px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#333333] lg:flex-none"
        >
          {nextLabel}
        </button>
      ) : null}
    </div>
  );
}
