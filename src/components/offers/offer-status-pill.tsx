import { cn } from "@/lib/utils";

function toneForStatus(status: string): "success" | "warning" | "muted" {
  const s = status.toLowerCase();
  if (s === "accepted") {
    return "success";
  }
  if (s === "pending" || s === "countered") {
    return "warning";
  }
  if (s === "expired" || s === "rejected" || s === "cancelled") {
    return "muted";
  }
  return "muted";
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export function OfferStatusPill({ status }: { status: string }) {
  const tone = toneForStatus(status);
  return (
    <span
      className={cn(
        "inline-flex max-w-full rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        tone === "success" &&
          "bg-[var(--color-background-success)] text-[var(--color-text-success)]",
        tone === "warning" &&
          "bg-[var(--color-background-warning)] text-[var(--color-text-warning)]",
        tone === "muted" &&
          "bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]",
      )}
    >
      {formatStatusLabel(status)}
    </span>
  );
}
