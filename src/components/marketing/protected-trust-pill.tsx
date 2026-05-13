import { Shield } from "lucide-react";

import { cn } from "@/lib/utils";

export function ProtectedTrustPill({
  className,
  compact,
}: {
  className?: string;
  /** Shorter label for tight headers */
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-mint/35 bg-mint/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-mint-muted",
        className,
      )}
    >
      <Shield className="size-3 text-mint opacity-90" aria-hidden />
      {compact ? "Protected" : "Protected delivery"}
    </span>
  );
}
