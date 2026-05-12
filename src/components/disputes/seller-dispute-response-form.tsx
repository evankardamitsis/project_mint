"use client";

import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";

import { submitSellerDisputeResponseAction, type SellerDisputeFormState } from "@/lib/disputes/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending…" : "Submit response"}
    </Button>
  );
}

export function SellerDisputeResponseForm({
  orderId,
  disputeId,
}: {
  orderId: string;
  disputeId: string;
}) {
  const router = useRouter();
  const initial: SellerDisputeFormState = { ok: false };
  const [state, action] = useFormState(async (prev: SellerDisputeFormState | undefined, formData: FormData) => {
    const r = await submitSellerDisputeResponseAction(prev, formData);
    if (r.ok) {
      router.refresh();
    }
    return r;
  }, initial);

  return (
    <form action={action} className="space-y-4 rounded-lg border border-border/80 bg-muted/10 p-4">
      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="dispute_id" value={disputeId} />
      <p className="text-sm font-medium">Your response</p>
      <p className="text-xs text-muted-foreground">Minimum 20 characters. This will move the case to under admin review.</p>
      {state.ok === false && state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <div className="space-y-2">
        <Label htmlFor="seller_response">Message to buyer / admin</Label>
        <textarea
          id="seller_response"
          name="seller_response"
          required
          minLength={20}
          rows={5}
          className="w-full max-w-2xl rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          placeholder="Explain your side…"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
