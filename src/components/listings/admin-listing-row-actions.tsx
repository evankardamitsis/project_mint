"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  adminApproveListingAction,
  adminArchiveListingAction,
  adminRejectListingAction,
} from "@/lib/listings/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type AdminListingActionLabels = {
  viewBtn: string;
  approveBtn: string;
  archiveBtn: string;
  rejectBtn: string;
  cancelBtn: string;
  rejectReasonLabel: string;
  rejectReasonPlaceholder: string;
  rejectConfirmBtn: string;
  actionFailed: string;
};

const DEFAULT_LABELS: AdminListingActionLabels = {
  viewBtn: "View",
  approveBtn: "Approve",
  archiveBtn: "Archive",
  rejectBtn: "Reject",
  cancelBtn: "Cancel",
  rejectReasonLabel: "Reason (optional)",
  rejectReasonPlaceholder: "Rejection reason",
  rejectConfirmBtn: "Confirm rejection",
  actionFailed: "Action failed.",
};

const detailActionBtn =
  "h-auto rounded-xl px-4 py-2.5 text-sm font-semibold shadow-none";

export function AdminListingRowActions({
  listingId,
  slug,
  context = "table",
  labels,
}: {
  listingId: string;
  slug: string;
  context?: "table" | "detail";
  labels?: AdminListingActionLabels;
}) {
  const l = labels ?? DEFAULT_LABELS;
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDetail = context === "detail";

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setPending(true);
    setError(null);
    const r = await fn();
    setPending(false);
    if (!r.ok) {
      setError(r.error ?? l.actionFailed);
      return;
    }
    setShowReject(false);
    setReason("");
    router.refresh();
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        isDetail ? "items-stretch" : "items-end",
      )}
    >
      {error ? (
        <p
          className={cn(
            "text-xs text-[#DC2626]",
            isDetail ? "text-left" : "max-w-[220px] text-right",
          )}
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div
        className={cn(
          "flex flex-wrap gap-2",
          isDetail ? "w-full" : "justify-end",
        )}
      >
        {!isDetail ? (
          <Button variant="ghost" size="sm" render={<Link href={`/listing/${slug}`} />}>
            {l.viewBtn}
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          disabled={pending}
          className={cn(
            detailActionBtn,
            isDetail &&
              "flex-1 border-0 bg-[#1D9E75] text-white hover:bg-[#188A65] sm:flex-none",
          )}
          variant={isDetail ? "default" : "secondary"}
          onClick={() => void run(() => adminApproveListingAction(listingId))}
        >
          {l.approveBtn}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          className={cn(
            detailActionBtn,
            isDetail &&
              "flex-1 border-[#EEECE8] bg-white text-[#111111] hover:border-[#111111] sm:flex-none",
          )}
          onClick={() => void run(() => adminArchiveListingAction(listingId))}
        >
          {l.archiveBtn}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isDetail ? "outline" : "destructive"}
          disabled={pending}
          className={cn(
            detailActionBtn,
            isDetail &&
              "flex-1 border-[#FECACA] bg-white text-[#DC2626] hover:border-[#DC2626] hover:bg-[#FFF5F5] sm:flex-none",
          )}
          onClick={() => setShowReject((s) => !s)}
        >
          {showReject ? l.cancelBtn : l.rejectBtn}
        </Button>
      </div>

      {showReject ? (
        <div
          className={cn(
            "flex flex-col gap-2 rounded-xl border p-4",
            isDetail
              ? "border-[#EEECE8] bg-white"
              : "max-w-xs border-border bg-muted/40",
          )}
        >
          <Label htmlFor={`reject-${listingId}`} className="text-xs font-medium text-text-secondary">
            {l.rejectReasonLabel}
          </Label>
          <Input
            id={`reject-${listingId}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={l.rejectReasonPlaceholder}
            maxLength={2000}
            className="rounded-lg border-[#EEECE8] text-sm"
          />
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={pending}
            className={cn(isDetail && "rounded-xl py-2.5 font-semibold")}
            onClick={() => void run(() => adminRejectListingAction(listingId, reason))}
          >
            {l.rejectConfirmBtn}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
