"use client";

import { Check } from "lucide-react";

import { MAX_LISTING_IMAGES } from "@/lib/listings/constants";
import { cn } from "@/lib/utils";

export const PHOTO_SLOTS = [
  {
    id: "front",
    label: "Μπροστά",
    hint: "Ολόκληρο το μπρος",
    required: true,
    icon: "front",
  },
  {
    id: "back",
    label: "Πίσω",
    hint: "Πίσω μέρος",
    required: true,
    icon: "back",
  },
  {
    id: "headstock",
    label: "Κεφαλή",
    hint: "Λογότυπο & serial",
    required: true,
    icon: "headstock",
  },
  {
    id: "serial",
    label: "Serial",
    hint: "Σειριακός αριθμός",
    required: true,
    icon: "serial",
  },
  {
    id: "blemishes",
    label: "Φθορές",
    hint: "Χτυπήματα, φθορές",
    required: false,
    icon: "blemish",
  },
  {
    id: "accessories",
    label: "Αξεσουάρ",
    hint: "Θήκη, καλώδια κτλ",
    required: false,
    icon: "accessories",
  },
] as const;

export type PhotoSlotId = (typeof PHOTO_SLOTS)[number]["id"];

function PhotoSlotIcon({ type, className }: { type: string; className?: string }) {
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (type) {
    case "front":
      return (
        <svg {...props} aria-hidden>
          <rect x="7" y="4" width="10" height="16" rx="5" />
          <circle cx="12" cy="12" r="2.5" />
          <line x1="12" y1="4" x2="12" y2="9.5" />
          <line x1="12" y1="14.5" x2="12" y2="20" />
        </svg>
      );
    case "back":
      return (
        <svg {...props} aria-hidden>
          <rect x="7" y="4" width="10" height="16" rx="5" />
          <rect x="9" y="8" width="6" height="8" rx="1" strokeDasharray="2 1" />
          <line x1="10" y1="4" x2="10" y2="7" />
          <line x1="14" y1="4" x2="14" y2="7" />
        </svg>
      );
    case "headstock":
      return (
        <svg {...props} aria-hidden>
          <rect x="10" y="12" width="4" height="8" rx="1" />
          <rect x="8" y="4" width="8" height="9" rx="2" />
          <circle cx="8" cy="6.5" r="1" />
          <circle cx="8" cy="10" r="1" />
          <circle cx="16" cy="6.5" r="1" />
          <circle cx="16" cy="10" r="1" />
        </svg>
      );
    case "serial":
      return (
        <svg {...props} aria-hidden>
          <rect x="4" y="7" width="16" height="10" rx="2" />
          <line x1="7" y1="11" x2="17" y2="11" />
          <line x1="7" y1="14" x2="13" y2="14" />
          <circle cx="12" cy="4" r="1" />
          <line x1="12" y1="5" x2="12" y2="7" />
        </svg>
      );
    case "blemish":
      return (
        <svg {...props} aria-hidden>
          <circle cx="10" cy="10" r="6" />
          <line x1="14.5" y1="14.5" x2="20" y2="20" />
          <path d="M8 9 Q9.5 8 10 10 Q10.5 12 12 11" />
        </svg>
      );
    case "accessories":
      return (
        <svg {...props} aria-hidden>
          <rect x="3" y="8" width="18" height="12" rx="2" />
          <path d="M9 8 V6 Q9 4 12 4 Q15 4 15 6 V8" />
          <line x1="3" y1="14" x2="21" y2="14" strokeDasharray="3 2" />
        </svg>
      );
    default:
      return (
        <svg {...props} aria-hidden>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="16.5" cy="7.5" r="1" fill="currentColor" />
        </svg>
      );
  }
}

export function PhotoRequirementChecklist({
  className,
  uploadedCount = 0,
  filledSlotIds,
  activeSlot,
  onSlotClick,
}: {
  className?: string;
  uploadedCount?: number;
  filledSlotIds: ReadonlySet<PhotoSlotId>;
  activeSlot: PhotoSlotId | null;
  onSlotClick: (slotId: PhotoSlotId) => void;
}) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#111111]">Φωτογράφισε αυτά τα σημεία</p>
        <p className="text-xs text-[#ABABAB]">
          {uploadedCount} / {MAX_LISTING_IMAGES} φωτογραφίες
        </p>
      </div>

      <div className="scrollbar-none -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {PHOTO_SLOTS.map((slot) => {
          const uploaded = filledSlotIds.has(slot.id);
          const isActive = activeSlot === slot.id;

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSlotClick(slot.id)}
              aria-pressed={isActive}
              aria-label={`${slot.label}${slot.required && !uploaded ? ", απαιτείται" : ""}`}
              className={cn(
                "flex w-[80px] min-w-[80px] shrink-0 flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all",
                uploaded
                  ? "border-[#1D9E75] bg-[#E8F7F1]"
                  : isActive
                    ? "border-[#111111] bg-white"
                    : "border-[#EEECE8] bg-white hover:border-[#DDDBD6]",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  uploaded ? "bg-[#1D9E75]" : "bg-[#F7F6F3]",
                )}
              >
                {uploaded ? (
                  <Check className="h-5 w-5 text-white" aria-hidden />
                ) : (
                  <PhotoSlotIcon type={slot.icon} className="h-6 w-6 text-[#ABABAB]" />
                )}
              </div>
              <div className="text-center">
                <p
                  className={cn(
                    "text-[11px] leading-tight font-semibold",
                    uploaded ? "text-[#0A5C43]" : "text-[#111111]",
                  )}
                >
                  {slot.label}
                  {slot.required && !uploaded ? <span className="ml-0.5 text-[#CC4444]">*</span> : null}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {activeSlot ? (
        <p className="mt-2 text-center text-xs text-[#6B6B6B]">
          {PHOTO_SLOTS.find((s) => s.id === activeSlot)?.hint}
        </p>
      ) : null}
    </div>
  );
}
