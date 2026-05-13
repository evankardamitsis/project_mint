"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Heart } from "lucide-react";

import { toggleSaveListingAction } from "@/lib/favorites/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ListingDetailSaveButton({
  listingId,
  initialSaved,
  isGuest,
  isOwner,
  loginNextPath,
  className,
}: {
  listingId: string;
  initialSaved: boolean;
  isGuest: boolean;
  isOwner: boolean;
  loginNextPath: string;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (isOwner) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      disabled={pending}
      className={cn(
        "border-0 bg-white/90 shadow-md backdrop-blur-sm hover:bg-white",
        initialSaved ? "text-[#1a7a4a]" : "text-ink-2",
        pending && "opacity-70",
        className,
      )}
      aria-label={initialSaved ? "Saved — click to remove" : "Save listing"}
      onClick={() => {
        if (isGuest) {
          router.push(`/auth/login?next=${encodeURIComponent(loginNextPath)}`);
          return;
        }
        startTransition(async () => {
          const res = await toggleSaveListingAction(listingId);
          if (!res.ok) {
            return;
          }
          router.refresh();
        });
      }}
    >
      <Heart className={cn("size-5", initialSaved && "fill-current")} strokeWidth={1.75} aria-hidden />
    </Button>
  );
}
