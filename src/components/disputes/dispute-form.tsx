"use client";

import { useFormState, useFormStatus } from "react-dom";

import { DisputeEvidenceUploader } from "@/components/disputes/dispute-evidence-uploader";
import { createDisputeAction, type DisputeFormState } from "@/lib/disputes/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { DisputeReason } from "@/types/domain";

export type DisputeFormLabels = {
  reasonLabel: string;
  reasonDamaged: string;
  reasonNotAsDescribed: string;
  reasonNotReceived: string;
  reasonCounterfeit: string;
  reasonOther: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  submitBtn: string;
  submittingBtn: string;
  refundNote: string;
};

function SubmitButton({ submitBtn, submittingBtn }: { submitBtn: string; submittingBtn: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
      {pending ? submittingBtn : submitBtn}
    </Button>
  );
}

export function DisputeForm({ orderId, labels }: { orderId: string; labels: DisputeFormLabels }) {
  const initial: DisputeFormState = { ok: false };
  const [state, action] = useFormState(createDisputeAction, initial);

  const reasons: { value: DisputeReason; label: string }[] = [
    { value: "damaged", label: labels.reasonDamaged },
    { value: "not_as_described", label: labels.reasonNotAsDescribed },
    { value: "not_received", label: labels.reasonNotReceived },
    { value: "counterfeit", label: labels.reasonCounterfeit },
    { value: "other", label: labels.reasonOther },
  ];

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="order_id" value={orderId} />
      {state.ok === false && state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="reason">{labels.reasonLabel}</Label>
        <select
          id="reason"
          name="reason"
          required
          className="flex h-10 w-full max-w-md rounded-lg border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          defaultValue="damaged"
        >
          {reasons.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">{labels.descriptionLabel}</Label>
        <textarea
          id="description"
          name="description"
          required
          rows={6}
          className="w-full max-w-2xl rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
          placeholder={labels.descriptionPlaceholder}
        />
      </div>
      <DisputeEvidenceUploader />
      <p className="text-xs text-muted-foreground">{labels.refundNote}</p>
      <SubmitButton submitBtn={labels.submitBtn} submittingBtn={labels.submittingBtn} />
    </form>
  );
}
