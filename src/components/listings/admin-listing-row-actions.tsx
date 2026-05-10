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

export function AdminListingRowActions({ listingId, slug }: { listingId: string; slug: string }) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setPending(true);
    setError(null);
    const r = await fn();
    setPending(false);
    if (!r.ok) {
      setError(r.error ?? "Action failed.");
      return;
    }
    setShowReject(false);
    setReason("");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error ? <p className="max-w-[220px] text-right text-xs text-destructive">{error}</p> : null}
      <div className="flex flex-wrap justify-end gap-1">
        <Button variant="ghost" size="sm" render={<Link href={`/listing/${slug}`} />}>
          View
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => void run(() => adminApproveListingAction(listingId))}
        >
          Approve
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => void run(() => adminArchiveListingAction(listingId))}
        >
          Archive
        </Button>
        <Button type="button" size="sm" variant="destructive" disabled={pending} onClick={() => setShowReject((s) => !s)}>
          Reject
        </Button>
      </div>
      {showReject ? (
        <div className="flex w-full max-w-xs flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3">
          <Label htmlFor={`reject-${listingId}`} className="text-xs">
            Rejection note (optional)
          </Label>
          <Input
            id={`reject-${listingId}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection"
            maxLength={2000}
          />
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={pending}
            onClick={() => void run(() => adminRejectListingAction(listingId, reason))}
          >
            Confirm reject
          </Button>
        </div>
      ) : null}
    </div>
  );
}
