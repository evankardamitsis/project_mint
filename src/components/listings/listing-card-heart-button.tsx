"use client";

import { Heart } from "lucide-react";

export function ListingCardHeartButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      aria-label="Save listing"
      onClick={(e) => {
        e.preventDefault();
      }}
    >
      <Heart className="size-3.5" strokeWidth={1.75} aria-hidden />
    </button>
  );
}
