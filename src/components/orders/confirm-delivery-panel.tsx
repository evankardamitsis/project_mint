"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ShieldCheck } from "lucide-react";

import { confirmDeliveryAction } from "@/lib/orders/actions";
import { Button } from "@/components/ui/button";

export type ConfirmDeliveryLabels = {
  kicker: string;
  title: string;
  body: string;
  confirmBtn: string;
  processingBtn: string;
  errorFallback: string;
};

export function ConfirmDeliveryPanel({
  orderId,
  labels,
}: {
  orderId: string;
  labels: ConfirmDeliveryLabels;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="rounded-2xl bg-[var(--color-background-surface)] p-5 shadow-sm ring-1 ring-[#e0ddd8]/80">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E8F7F1]">
          <ShieldCheck className="size-4 text-[#1D9E75]" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            {labels.kicker}
          </p>
          <p className="mt-1 text-base font-semibold text-[#111111]">{labels.title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {labels.body}
          </p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {error ? (
          <p className="text-sm text-[var(--color-danger-text)]">{error}</p>
        ) : null}
        <Button
          type="button"
          className="w-full bg-[#111111] text-white hover:bg-[#111111]/90"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setError(null);
              const r = await confirmDeliveryAction(orderId);
              if (!r.ok) {
                setError(r.error ?? labels.errorFallback);
                return;
              }
              router.refresh();
            })
          }
        >
          {pending ? labels.processingBtn : labels.confirmBtn}
        </Button>
      </div>
    </div>
  );
}
