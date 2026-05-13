"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { counterOfferSellerAction, type OfferActionState } from "@/lib/offers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: OfferActionState = { ok: false };

export function OfferCounterForm({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(counterOfferSellerAction, initial);

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <input type="hidden" name="offer_id" value={offerId} />
      <div className="min-w-0 flex-1 space-y-1">
        <Label className="text-xs">Counter (EUR)</Label>
        <Input name="amount_euros" type="text" inputMode="decimal" placeholder="Amount" required disabled={pending} />
      </div>
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "…" : "Counter"}
      </Button>
      {state.error ? <p className="w-full text-xs text-destructive sm:order-last">{state.error}</p> : null}
      {state.ok && state.message ? (
        <p className="w-full text-xs text-mint-muted sm:order-last">{state.message}</p>
      ) : null}
    </form>
  );
}
