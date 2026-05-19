"use client";

import { useTransition } from "react";

import { activateSellerAccount } from "@/app/actions/roles";
import { Button } from "@/components/ui/button";

export function SellActivateButton({ label }: { label: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      className="bg-mint px-8 font-semibold text-white hover:bg-mint/90"
      disabled={pending}
      onClick={() => {
        startTransition(() => {
          void activateSellerAccount();
        });
      }}
    >
      {label}
    </Button>
  );
}
