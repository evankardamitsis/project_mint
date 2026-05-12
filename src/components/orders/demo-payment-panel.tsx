"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { demoMarkOrderPaidAction } from "@/lib/orders/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DemoPaymentPanel({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Payment</CardTitle>
        <CardDescription>
          Demo payment only. Stripe will be added later. This simulates a successful checkout and escrow hold.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button
          type="button"
          className="w-full"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setError(null);
              const r = await demoMarkOrderPaidAction(orderId);
              if (!r.ok) {
                setError(r.error ?? "Could not update.");
                return;
              }
              router.refresh();
            })
          }
        >
          {pending ? "Working…" : "Mark as paid — demo"}
        </Button>
      </CardContent>
    </Card>
  );
}
