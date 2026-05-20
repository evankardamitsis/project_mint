"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

import { toggleWatch } from "@/app/actions/watchers";
import { cn } from "@/lib/utils";

export function WatchButton({
  listingId,
  initialWatching,
  isGuest = false,
  loginNextPath,
  size = "sm",
  className,
}: {
  listingId: string;
  initialWatching: boolean;
  isGuest?: boolean;
  loginNextPath?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [watching, setWatching] = useState(initialWatching);
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isGuest) {
      const next = loginNextPath ?? pathname ?? "/browse";
      router.push(`/auth/login?next=${encodeURIComponent(next)}`);
      return;
    }
    const prev = watching;
    const newState = !watching;
    setWatching(newState);
    startTransition(async () => {
      const result = await toggleWatch(listingId);
      if (result.error) {
        setWatching(prev);
        return;
      }
      if (result.watching !== undefined) {
        setWatching(result.watching);
      }
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={watching ? "Αφαίρεση από αποθηκευμένα" : "Αποθήκευση αγγελίας"}
      aria-pressed={watching}
      className={cn(
        "flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        isPending && "opacity-70",
        className,
      )}
    >
      <Heart
        className={cn(
          "transition-all",
          size === "sm" ? "h-4 w-4" : "h-5 w-5",
          watching ? "fill-[#CC4444] stroke-[#CC4444]" : "fill-transparent stroke-[#6B6B6B]",
        )}
        aria-hidden
      />
    </button>
  );
}
