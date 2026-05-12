"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteProtectedDeliveryAssetAction } from "@/lib/protected-delivery/actions";
import { Button } from "@/components/ui/button";

export function AdminDeletePdAssetButton({ assetId }: { assetId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-1">
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const r = await deleteProtectedDeliveryAssetAction(assetId);
            if (!r.ok) {
              setError(r.error ?? "Delete failed.");
              return;
            }
            router.refresh();
          })
        }
      >
        {pending ? "Removing…" : "Remove"}
      </Button>
    </div>
  );
}
