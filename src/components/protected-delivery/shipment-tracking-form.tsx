"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveShipmentTrackingAction } from "@/lib/protected-delivery/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ShipmentTrackingForm({
  orderId,
  initialCourierName,
  initialTrackingNumber,
  initialTrackingUrl,
  disabled,
}: {
  orderId: string;
  initialCourierName: string;
  initialTrackingNumber: string;
  initialTrackingUrl: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [courierName, setCourierName] = useState(initialCourierName);
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber);
  const [trackingUrl, setTrackingUrl] = useState(initialTrackingUrl);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-4 rounded-lg border border-border/80 bg-muted/10 p-4">
      <p className="text-sm font-medium">Courier & tracking</p>
      <p className="text-xs text-muted-foreground">No carrier API yet — enter details manually. A tracking number is required before you submit the checklist.</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`pd-courier-${orderId}`}>Courier name</Label>
          <Input
            id={`pd-courier-${orderId}`}
            value={courierName}
            onChange={(e) => setCourierName(e.target.value)}
            disabled={disabled || pending}
            placeholder="e.g. DHL, ACS"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`pd-tracking-${orderId}`}>Tracking number</Label>
          <Input
            id={`pd-tracking-${orderId}`}
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            disabled={disabled || pending}
            placeholder="Required"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`pd-url-${orderId}`}>Tracking URL (optional)</Label>
          <Input
            id={`pd-url-${orderId}`}
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            disabled={disabled || pending}
            placeholder="https://…"
          />
        </div>
      </div>
      <Button
        type="button"
        disabled={disabled || pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const r = await saveShipmentTrackingAction(orderId, {
              courierName,
              trackingNumber,
              trackingUrl,
            });
            if (!r.ok) {
              setError(r.error ?? "Could not save.");
              return;
            }
            router.refresh();
          })
        }
      >
        {pending ? "Saving…" : "Save tracking"}
      </Button>
    </div>
  );
}
