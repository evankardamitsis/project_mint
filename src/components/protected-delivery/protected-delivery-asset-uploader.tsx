"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { uploadProtectedDeliveryAssetAction } from "@/lib/protected-delivery/actions";
import { Button } from "@/components/ui/button";
import type { ProtectedDeliveryAssetType } from "@/types/domain";

export function ProtectedDeliveryAssetUploader({
  orderId,
  checkId,
  assetType,
  label,
  disabled,
}: {
  orderId: string;
  checkId: string;
  assetType: ProtectedDeliveryAssetType;
  label: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        disabled={disabled || pending}
        onChange={() => {
          const input = inputRef.current;
          const file = input?.files?.[0];
          if (!file) {
            return;
          }
          start(async () => {
            setError(null);
            const fd = new FormData();
            fd.set("order_id", orderId);
            fd.set("check_id", checkId);
            fd.set("asset_type", assetType);
            fd.set("file", file);
            const r = await uploadProtectedDeliveryAssetAction(fd);
            if (input) {
              input.value = "";
            }
            if (!r.ok) {
              setError(r.error ?? "Upload failed.");
              return;
            }
            router.refresh();
          });
        }}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <Button type="button" variant="outline" size="sm" disabled={disabled || pending} onClick={() => inputRef.current?.click()}>
        {pending ? "Uploading…" : label}
      </Button>
    </div>
  );
}
