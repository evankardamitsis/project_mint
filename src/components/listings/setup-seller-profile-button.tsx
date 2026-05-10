"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createSellerProfileAction } from "@/lib/listings/actions";

export function SetupSellerProfileButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          const res = await createSellerProfileAction();
          if (!res.ok) {
            setError(res.error ?? "Could not create profile.");
            setPending(false);
            return;
          }
          router.refresh();
          setPending(false);
        }}
      >
        {pending ? "Creating…" : "Create seller profile"}
      </Button>
    </div>
  );
}
