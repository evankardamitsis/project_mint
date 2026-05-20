"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye } from "lucide-react";

import { toggleFollow } from "@/app/actions/follows";
import { cn } from "@/lib/utils";

export function FollowButton({
  listingId,
  initialFollowing,
  isGuest = false,
  loginNextPath,
  size = "sm",
  className,
}: {
  listingId: string;
  initialFollowing: boolean;
  isGuest?: boolean;
  loginNextPath?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [following, setFollowing] = useState(initialFollowing);
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isGuest) {
      const next = loginNextPath ?? pathname ?? "/browse";
      router.push(`/auth/login?next=${encodeURIComponent(next)}`);
      return;
    }
    const prev = following;
    setFollowing(!prev);
    startTransition(async () => {
      const result = await toggleFollow(listingId);
      if (result.error) {
        setFollowing(prev);
        return;
      }
      if (result.following !== undefined) {
        setFollowing(result.following);
      }
      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      title={
        following ? "Ακολουθείς αυτή την αγγελία" : "Ακολούθησε — ειδοποίηση για μείωση τιμής"
      }
      aria-label={following ? "Διακοπή ακολούθησης" : "Ακολούθησε αγγελία"}
      aria-pressed={following}
      className={cn(
        "flex items-center justify-center rounded-full transition-all",
        following
          ? "border border-[#1D9E75]/30 bg-[#E8F7F1] hover:bg-[#D4F0E6]"
          : "bg-white/90 backdrop-blur-sm hover:bg-white",
        size === "sm" ? "h-8 w-8" : "h-10 w-10",
        isPending && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <Eye
        className={cn(
          "transition-all",
          size === "sm" ? "h-4 w-4" : "h-5 w-5",
          following ? "fill-[#E8F7F1] stroke-[#1D9E75]" : "fill-transparent stroke-[#6B6B6B]",
        )}
        aria-hidden
      />
    </button>
  );
}
