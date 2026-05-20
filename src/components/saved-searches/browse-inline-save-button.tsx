"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, Check } from "lucide-react";

import { createSavedSearchAction } from "@/lib/saved-searches/actions";

export function BrowseInlineSaveButton({
  query,
  formDefaults,
  defaultName,
  disabled,
}: {
  query: string;
  formDefaults: {
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
  defaultName: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  if (!query.trim() || disabled) {
    return null;
  }

  const handleSave = async () => {
    setSaveState("saving");
    const fd = new FormData();
    fd.set("q", formDefaults.q);
    fd.set("category", formDefaults.category);
    fd.set("brand", formDefaults.brand);
    fd.set("condition", formDefaults.condition);
    fd.set("min_price", formDefaults.min_price);
    fd.set("max_price", formDefaults.max_price);
    fd.set("sort", formDefaults.sort);
    fd.set("deal", formDefaults.deal);
    fd.set("priceDrop", formDefaults.priceDrop);
    fd.set("name", defaultName);
    fd.set("notifications_enabled", "on");

    const result = await createSavedSearchAction({ ok: false }, fd);
    if (result.ok) {
      setSaveState("saved");
      router.refresh();
      window.setTimeout(() => setSaveState("idle"), 3000);
    } else {
      setSaveState("idle");
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleSave()}
      disabled={saveState === "saving"}
      className="flex items-center gap-2 text-sm font-semibold text-[#1D9E75] transition-colors hover:text-[#0A5C43] disabled:opacity-60"
    >
      {saveState === "saved" ? (
        <>
          <Check className="h-4 w-4" aria-hidden />
          Αποθηκεύτηκε
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" aria-hidden />
          {saveState === "saving" ? "Αποθήκευση…" : "Αποθήκευση αναζήτησης"}
        </>
      )}
    </button>
  );
}
