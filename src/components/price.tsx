import { cn } from "@/lib/utils";

export function Price({
  amountCents,
  currency = "EUR",
  className,
}: {
  amountCents: number;
  currency?: string;
  className?: string;
}) {
  const formatted = new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);

  return (
    <span
      className={cn("tabular-nums font-semibold tracking-tight", className)}
    >
      {formatted}
    </span>
  );
}
