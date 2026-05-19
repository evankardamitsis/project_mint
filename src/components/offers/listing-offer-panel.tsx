"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { createOfferAction } from "@/lib/offers/actions";
import type { OfferActionState } from "@/lib/offers/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/domain";

const initial: OfferActionState = { ok: false };

const PRESETS = [
  { pct: 5,  label: "Δυνατή",  labelCls: "text-[#1D9E75]" },
  { pct: 10, label: "Καλή",    labelCls: "text-[#1D9E75]" },
  { pct: 15, label: "Μέτρια",  labelCls: "text-[#D97706]" },
  { pct: 20, label: "Χαμηλή",  labelCls: "text-[#DC2626]" },
] as const;

function presetEuros(priceCents: number, pct: number) {
  return Math.floor((priceCents * (100 - pct)) / 10000);
}

function getHint(amountStr: string, priceCents: number): { text: string; cls: string } | null {
  const euros = parseFloat(amountStr.replace(",", "."));
  if (!amountStr || isNaN(euros) || euros <= 0) return null;
  const full = priceCents / 100;
  const ratio = euros / full;
  if (euros >= full)   return { text: "Η τιμή ισούται με τη ζητούμενη — απλά αγόρασέ το!", cls: "text-[#D97706]" };
  if (ratio >= 0.90)   return { text: "Πολύ δυνατή προσφορά — πιθανότατα θα γίνει αποδεκτή.", cls: "text-[#1D9E75]" };
  if (ratio >= 0.75)   return { text: "Καλή προσφορά. Αξίζει να το δοκιμάσεις.", cls: "text-[#1D9E75]" };
  if (ratio >= 0.60)   return { text: "Μέτρια προσφορά — δοκίμασε λίγο υψηλότερα.", cls: "text-[#D97706]" };
  return               { text: "Πολύ χαμηλή — σχεδόν σίγουρα θα απορριφθεί.", cls: "text-[#DC2626]" };
}

export function ListingOfferPanel({
  listingId,
  slug,
  currency,
  priceCents,
  offersEnabled,
  listingActive,
  viewer,
  isListingSeller,
}: {
  listingId: string;
  slug: string;
  currency: string;
  priceCents: number;
  offersEnabled: boolean;
  listingActive: boolean;
  viewer: Profile | null;
  isListingSeller: boolean;
}) {
  const router = useRouter();
  const [showOffer, setShowOffer] = useState(false);
  const [amount, setAmount] = useState("");
  const [state, formAction, pending] = useActionState(createOfferAction, initial);

  useEffect(() => {
    if (!state.ok) return;
    router.refresh();
    const closeTimer = window.setTimeout(() => setShowOffer(false), 0);
    return () => window.clearTimeout(closeTimer);
  }, [state.ok, router]);

  function toggleOfferPanel() {
    setShowOffer((open) => {
      const next = !open;
      setAmount(next ? String(presetEuros(priceCents, 10)) : "");
      return next;
    });
  }

  if (!listingActive || !offersEnabled) {
    if (!offersEnabled) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Offers</CardTitle>
            <CardDescription>The seller has disabled offers on this listing.</CardDescription>
          </CardHeader>
        </Card>
      );
    }
    return null;
  }

  if (isListingSeller) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Offers</CardTitle>
          <CardDescription>Manage incoming offers from your seller dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" render={<Link href="/seller/offers" />}>
            Open seller offers
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!viewer) {
    return (
      <div className="border-t border-[#EEECE8] pt-5">
        <p className="mb-1 text-sm font-semibold text-[#111111]">Κάνε προσφορά</p>
        <p className="mb-3 text-xs text-[#888888]">Διαπραγματέψου απευθείας με τον πωλητή.</p>
        <div className="flex gap-2">
          <Button size="sm" render={<Link href={`/auth/login?next=${encodeURIComponent(`/listing/${slug}`)}`} />}>
            Σύνδεση
          </Button>
          <Button size="sm" variant="outline" render={<Link href={`/auth/register?next=${encodeURIComponent(`/listing/${slug}`)}`} />}>
            Εγγραφή
          </Button>
        </div>
      </div>
    );
  }

  const hint = getHint(amount, priceCents);

  return (
    <div className="mt-3">
      {/* Toggle button */}
      <button
        type="button"
        onClick={toggleOfferPanel}
        className={cn(
          "w-full rounded-2xl py-3.5 text-sm font-medium transition-all duration-200 cursor-pointer",
          showOffer
            ? "border border-[#EEECE8] bg-transparent text-[#6B6B6B] hover:bg-[#F7F6F3] hover:text-[#111111]"
            : "border-2 border-[#111111] bg-transparent text-[#111111] hover:bg-[#111111] hover:text-white",
        )}
      >
        {showOffer ? "Ακύρωση" : "Κάνε προσφορά"}
      </button>

      {/* Expandable form */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          showOffer ? "mt-3 max-h-[600px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="rounded-2xl border border-[#E4E2DC] bg-[#FAFAF8] p-5">
          <p className="mb-1 text-sm font-bold text-[#111111]">Πρότεινε τιμή</p>
          <p className="mb-4 text-xs text-[#888888]">
            Επέλεξε ένα ποσοστό ή πληκτρολόγησε το ποσό σου.
          </p>

          {/* Preset pills */}
          <div className="mb-4 grid grid-cols-4 gap-2">
            {PRESETS.map(({ pct, label, labelCls }) => {
              const euros = presetEuros(priceCents, pct);
              const isSelected = amount === String(euros);
              return (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setAmount(String(euros))}
                  className={cn(
                    "flex flex-col items-center rounded-xl border py-3 text-center transition-all",
                    isSelected
                      ? "border-[#111111] bg-[#111111] text-white"
                      : "border-[#E4E2DC] bg-white hover:border-[#111111]",
                  )}
                >
                  <span className={cn("text-[10px] font-semibold leading-none", isSelected ? "text-white/70" : labelCls)}>
                    {label}
                  </span>
                  <span className={cn("mt-1 text-[12px] font-bold leading-none", isSelected ? "text-white" : "text-[#111111]")}>
                    −{pct}%
                  </span>
                  <span className={cn("mt-1 text-[10px] leading-none", isSelected ? "text-white/60" : "text-[#999999]")}>
                    €{euros}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Amount input */}
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="listing_id" value={listingId} />
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#888888]">
                €
              </span>
              <input
                name="amount_euros"
                type="text"
                inputMode="decimal"
                placeholder="π.χ. 450"
                required
                disabled={pending}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-[#DDDBD6] bg-white py-3 pl-8 pr-3 text-sm text-[#111111] placeholder:text-[#ABABAB] focus:border-[#111111] focus:outline-none"
              />
            </div>

            {/* Live validation hint */}
            {hint ? (
              <p className={cn("text-xs font-medium", hint.cls)}>{hint.text}</p>
            ) : null}

            {state.error ? (
              <p className="text-sm text-[#DC2626]">{state.error}</p>
            ) : null}
            {state.ok && state.message ? (
              <p className="text-sm font-medium text-[#1D9E75]">{state.message}</p>
            ) : null}

            <button
              type="submit"
              disabled={pending || !amount}
              className="w-full rounded-xl bg-[#1D9E75] py-3 text-sm font-bold text-white transition-colors hover:bg-[#178060] disabled:opacity-40"
            >
              {pending ? "Αποστολή…" : "Στείλε προσφορά"}
            </button>

            <p className="text-center text-[11px] leading-relaxed text-[#AAAAAA]">
              Λήγει σε 48 ώρες · Ο πωλητής μπορεί να αποδεχτεί, να αρνηθεί ή να αντιπροτείνει
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
