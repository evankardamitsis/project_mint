"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";

import { createSavedSearchAction, type SavedSearchActionState } from "@/lib/saved-searches/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Copy = {
  saveCta: string;
  savedLabel: string;
  viewAlerts: string;
  subtleNoFilters: string;
  nameLabel: string;
  notificationsLabel: string;
  submit: string;
  cancel: string;
  guestHint: string;
  promptText: string;
  promptAction: string;
};

export function BrowseSaveSearchPanel({
  copy,
  filtersActive,
  isGuest,
  loginNextHref,
  defaultName,
  formDefaults,
  matchedSaved,
}: {
  copy: Copy;
  filtersActive: boolean;
  isGuest: boolean;
  loginNextHref: string;
  defaultName: string;
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
  matchedSaved: { id: string; name: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const initial: SavedSearchActionState = { ok: false };
  const [state, formAction, pending] = useActionState(createSavedSearchAction, initial);
  const [, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (!state.ok) {
      return;
    }
    const id = window.setTimeout(() => {
      setOpen(false);
      router.refresh();
    }, 0);
    return () => window.clearTimeout(id);
  }, [state.ok, router]);

  if (matchedSaved) {
    return (
      <div className="mb-5 rounded-xl border border-[#e0ddd8] bg-white px-5 py-3.5 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#1a7a4a]">{copy.savedLabel}</p>
        <p className="mt-1 text-sm font-semibold text-[#111111]">{matchedSaved.name}</p>
        <Link
          href="/buyer/alerts"
          className="mt-2 inline-block text-[11px] font-bold uppercase tracking-wide text-[#111111] underline decoration-[#111111] underline-offset-2"
        >
          {copy.viewAlerts}
        </Link>
      </div>
    );
  }

  if (!filtersActive) {
    return null;
  }

  if (isGuest) {
    return (
      <div className="mb-5 flex items-center gap-3 rounded-xl bg-[#E8F7F1] px-5 py-3.5">
        <Bell className="h-4 w-4 shrink-0 text-[#1D9E75]" aria-hidden />
        <p className="flex-1 text-sm text-[#0A5C43]">{copy.promptText}</p>
        <Link
          href={loginNextHref}
          className="whitespace-nowrap text-sm font-bold text-[#0A5C43] transition-colors hover:text-[#111111]"
        >
          {copy.promptAction}
        </Link>
      </div>
    );
  }

  if (open) {
    return (
      <div className="mb-5 rounded-xl border border-[#e0ddd8] bg-white p-4 shadow-sm">
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="q" value={formDefaults.q} />
          <input type="hidden" name="category" value={formDefaults.category} />
          <input type="hidden" name="brand" value={formDefaults.brand} />
          <input type="hidden" name="condition" value={formDefaults.condition} />
          <input type="hidden" name="min_price" value={formDefaults.min_price} />
          <input type="hidden" name="max_price" value={formDefaults.max_price} />
          <input type="hidden" name="sort" value={formDefaults.sort} />
          <input type="hidden" name="deal" value={formDefaults.deal} />
          <input type="hidden" name="priceDrop" value={formDefaults.priceDrop} />
          <div className="space-y-1.5">
            <Label htmlFor="saved-search-name" className="text-xs font-medium text-[#666666]">
              {copy.nameLabel}
            </Label>
            <Input
              id="saved-search-name"
              name="name"
              required
              maxLength={120}
              defaultValue={defaultName}
              className="rounded-lg border-[#EEECE8] text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="saved-search-notify"
              name="notifications_enabled"
              type="checkbox"
              defaultChecked
              value="on"
              className="size-4 rounded border border-[#111111] accent-[#1a7a4a]"
            />
            <Label htmlFor="saved-search-notify" className="text-sm font-medium text-[#444444]">
              {copy.notificationsLabel}
            </Label>
          </div>
          {state.ok === false && state.error ? (
            <p className="text-sm text-red-700" role="alert">
              {state.error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="submit"
              disabled={pending}
              className="rounded-full bg-[#111111] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111111]/90"
            >
              {pending ? "…" : copy.submit}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-[#EEECE8] px-4 py-2 text-sm font-medium"
              onClick={() => startTransition(() => setOpen(false))}
            >
              {copy.cancel}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="mb-5 flex items-center gap-3 rounded-xl bg-[#E8F7F1] px-5 py-3.5">
      <Bell className="h-4 w-4 shrink-0 text-[#1D9E75]" aria-hidden />
      <p className="flex-1 text-sm text-[#0A5C43]">{copy.promptText}</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="whitespace-nowrap text-sm font-bold text-[#0A5C43] transition-colors hover:text-[#111111]"
      >
        {copy.promptAction}
      </button>
    </div>
  );
}
