import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const toneClass: Record<"default" | "trust" | "dispute" | "selling", string> = {
  default: "border-border/70 bg-muted/25",
  trust: "border-mint/25 bg-mint/6",
  dispute: "border-dispute/25 bg-dispute/8",
  selling: "border-amber-warn/20 bg-amber-warn/8",
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
  tone = "default",
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  tone?: "default" | "trust" | "dispute" | "selling";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center",
        toneClass[tone],
        className,
      )}
    >
      {Icon ? (
        <Icon
          className={cn(
            "mb-4 size-10 stroke-[1.25] text-muted-foreground",
            tone === "trust" && "text-mint-muted",
            tone === "dispute" && "text-dispute",
            tone === "selling" && "text-amber-warn",
          )}
          aria-hidden
        />
      ) : null}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {children ? <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  );
}
