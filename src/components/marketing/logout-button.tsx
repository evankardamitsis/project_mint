"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        router.refresh();
        router.push("/");
        setPending(false);
      }}
    >
      Log out
    </Button>
  );
}
