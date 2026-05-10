"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { createOfferAction, type OfferActionState } from "@/lib/offers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: OfferActionState = { ok: false };

export function OfferForm({
  listingId,
  currency = "EUR",
}: {
  listingId: string;
  currency?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createOfferAction, initial);

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form id={`offer-form-${listingId}`} action={formAction} className="space-y-3">
      <input type="hidden" name="listing_id" value={listingId} />
      <div className="space-y-2">
        <Label htmlFor={`offer-amount-${listingId}`}>Your offer ({currency})</Label>
        <Input
          id={`offer-amount-${listingId}`}
          name="amount_euros"
          type="text"
          inputMode="decimal"
          placeholder="e.g. 450"
          required
          disabled={pending}
        />
        <p className="text-xs text-muted-foreground">Must be below the listed price. Offer expires in 48 hours.</p>
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.ok && state.message ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{state.message}</p> : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Submit offer"}
      </Button>
    </form>
  );
}
