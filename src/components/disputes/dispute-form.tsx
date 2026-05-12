"use client";

import { useFormState, useFormStatus } from "react-dom";

import { createDisputeAction, type DisputeFormState } from "@/lib/disputes/actions";
import { DISPUTE_DESCRIPTION_MIN_LEN } from "@/lib/disputes/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DisputeReason } from "@/types/domain";

const REASONS: { value: DisputeReason; label: string }[] = [
  { value: "damaged", label: "Damaged" },
  { value: "not_as_described", label: "Not as described" },
  { value: "not_received", label: "Not received" },
  { value: "counterfeit", label: "Counterfeit" },
  { value: "other", label: "Other" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? "Submitting…" : "Submit dispute"}
    </Button>
  );
}

export function DisputeForm({ orderId }: { orderId: string }) {
  const initial: DisputeFormState = { ok: false };
  const [state, action] = useFormState(createDisputeAction, initial);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="order_id" value={orderId} />
      {state.ok === false && state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <select
          id="reason"
          name="reason"
          required
          className="flex h-10 w-full max-w-md rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          defaultValue="damaged"
        >
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">What happened?</Label>
        <textarea
          id="description"
          name="description"
          required
          minLength={DISPUTE_DESCRIPTION_MIN_LEN}
          rows={6}
          className="w-full max-w-2xl rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          placeholder={`At least ${DISPUTE_DESCRIPTION_MIN_LEN} characters…`}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="evidence">Evidence (photos or PDF)</Label>
        <p className="text-xs text-muted-foreground">
          Required for damaged, not as described, or counterfeit. Optional for not received. Up to 8 files, 5 MB each.
        </p>
        <Input id="evidence" name="evidence" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" />
      </div>
      <p className="text-xs text-muted-foreground">
        Refunds are placeholder only — no money moves until Stripe is integrated.
      </p>
      <SubmitButton />
    </form>
  );
}
