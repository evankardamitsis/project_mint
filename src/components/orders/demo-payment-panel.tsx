"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { demoMarkOrderPaidAction } from "@/lib/orders/actions";
import { Button } from "@/components/ui/button";

export type DemoPaymentLabels = {
  kicker: string;
  title: string;
  body: string;
  payBtn: string;
  processingBtn: string;
  errorFallback: string;
};

export function DemoPaymentPanel({
  orderId,
  labels,
}: {
  orderId: string;
  labels: DemoPaymentLabels;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="rounded-2xl bg-[var(--color-background-surface)] p-5 shadow-sm ring-1 ring-[#e0ddd8]/80">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
        {labels.kicker}
      </p>
      <p className="mt-2 text-base font-semibold text-[#111111]">{labels.title}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {labels.body}
      </p>
      <div className="mt-5 space-y-3">
        {error ? <p className="text-sm text-[var(--color-danger-text)]">{error}</p> : null}
        <Button
          type="button"
          variant="outline"
          className="w-full border-mint/40 bg-mint-tint text-mint-dark hover:bg-mint-tint/80"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setError(null);
              const r = await demoMarkOrderPaidAction(orderId);
              if (!r.ok) {
                setError(r.error ?? labels.errorFallback);
                return;
              }
              router.refresh();
            })
          }
        >
          {pending ? labels.processingBtn : labels.payBtn}
        </Button>
      </div>
    </div>
  );
}
