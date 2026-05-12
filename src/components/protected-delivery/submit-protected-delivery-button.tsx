"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { submitProtectedDeliveryChecklistAction } from "@/lib/protected-delivery/actions";
import { Button } from "@/components/ui/button";

export function SubmitProtectedDeliveryButton({ orderId, disabled }: { orderId: string; disabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-2">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="button"
        className="w-full sm:w-auto"
        disabled={disabled || pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const r = await submitProtectedDeliveryChecklistAction(orderId);
            if (!r.ok) {
              setError(r.error ?? "Could not submit.");
              return;
            }
            router.refresh();
          })
        }
      >
        {pending ? "Submitting…" : "Submit checklist & mark shipped"}
      </Button>
    </div>
  );
}
