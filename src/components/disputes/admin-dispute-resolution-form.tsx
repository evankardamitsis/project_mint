"use client";

import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";

import { adminDisputeResolutionAction, type AdminDisputeFormState } from "@/lib/disputes/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant="default">
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function AdminDisputeResolutionForm({ orderId, disputeId }: { orderId: string; disputeId: string }) {
  const router = useRouter();
  const initial: AdminDisputeFormState = { ok: false };
  const [state, action] = useFormState(async (prev: AdminDisputeFormState | undefined, formData: FormData) => {
    const r = await adminDisputeResolutionAction(prev, formData);
    if (r.ok) {
      router.refresh();
    }
    return r;
  }, initial);

  return (
    <div className="space-y-6 rounded-xl border border-border/80 bg-card p-4">
      <p className="text-sm font-medium">Admin resolution</p>
      <p className="text-xs text-muted-foreground">
        Payment and refund actions are placeholders only — no Stripe payouts or card refunds yet.
      </p>
      {state.ok === false && state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}

      <form action={action} className="space-y-4 border-b border-border pb-6">
        <input type="hidden" name="order_id" value={orderId} />
        <input type="hidden" name="dispute_id" value={disputeId} />
        <input type="hidden" name="resolution_action" value="mark_under_review" />
        <div className="space-y-2">
          <Label htmlFor="admin_notes_review">Admin notes (optional)</Label>
          <textarea
            id="admin_notes_review"
            name="admin_notes"
            rows={2}
            className="w-full max-w-xl rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            placeholder="Internal notes…"
          />
        </div>
        <SubmitButton label="Mark under review" />
      </form>

      <form action={action} className="space-y-4 border-b border-border pb-6">
        <input type="hidden" name="order_id" value={orderId} />
        <input type="hidden" name="dispute_id" value={disputeId} />
        <input type="hidden" name="resolution_action" value="resolve_buyer" />
        <div className="space-y-2">
          <Label htmlFor="res_buyer_notes">Resolution notes (buyer favor)</Label>
          <textarea
            id="res_buyer_notes"
            name="resolution_notes"
            required
            minLength={10}
            rows={3}
            className="w-full max-w-xl rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            placeholder="Visible summary for parties…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin_notes_buyer">Admin notes (optional)</Label>
          <textarea id="admin_notes_buyer" name="admin_notes" rows={2} className="w-full max-w-xl rounded-lg border border-input bg-transparent px-3 py-2 text-sm" />
        </div>
        <SubmitButton label="Resolve in buyer’s favor" />
      </form>

      <form action={action} className="space-y-4 border-b border-border pb-6">
        <input type="hidden" name="order_id" value={orderId} />
        <input type="hidden" name="dispute_id" value={disputeId} />
        <input type="hidden" name="resolution_action" value="resolve_seller" />
        <div className="space-y-2">
          <Label htmlFor="res_seller_notes">Resolution notes (seller favor)</Label>
          <textarea
            id="res_seller_notes"
            name="resolution_notes"
            required
            minLength={10}
            rows={3}
            className="w-full max-w-xl rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin_notes_seller">Admin notes (optional)</Label>
          <textarea id="admin_notes_seller" name="admin_notes" rows={2} className="w-full max-w-xl rounded-lg border border-input bg-transparent px-3 py-2 text-sm" />
        </div>
        <SubmitButton label="Resolve in seller’s favor (release payment placeholder)" />
      </form>

      <form action={action} className="space-y-4 border-b border-border pb-6">
        <input type="hidden" name="order_id" value={orderId} />
        <input type="hidden" name="dispute_id" value={disputeId} />
        <input type="hidden" name="resolution_action" value="mark_refunded" />
        <div className="space-y-2">
          <Label htmlFor="res_refund_notes">Notes (optional)</Label>
          <textarea id="res_refund_notes" name="resolution_notes" rows={2} className="w-full max-w-xl rounded-lg border border-input bg-transparent px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin_notes_refund">Admin notes (optional)</Label>
          <textarea id="admin_notes_refund" name="admin_notes" rows={2} className="w-full max-w-xl rounded-lg border border-input bg-transparent px-3 py-2 text-sm" />
        </div>
        <SubmitButton label="Mark refunded (placeholder)" />
      </form>

      <form action={action} className="space-y-4">
        <input type="hidden" name="order_id" value={orderId} />
        <input type="hidden" name="dispute_id" value={disputeId} />
        <input type="hidden" name="resolution_action" value="close" />
        <div className="space-y-2">
          <Label htmlFor="res_close_notes">Closing notes (optional)</Label>
          <textarea id="res_close_notes" name="resolution_notes" rows={2} className="w-full max-w-xl rounded-lg border border-input bg-transparent px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admin_notes_close">Admin notes (optional)</Label>
          <textarea id="admin_notes_close" name="admin_notes" rows={2} className="w-full max-w-xl rounded-lg border border-input bg-transparent px-3 py-2 text-sm" />
        </div>
        <Button type="submit" variant="outline">
          Close dispute
        </Button>
      </form>
    </div>
  );
}
