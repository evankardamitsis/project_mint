import { cn, formatEuroPrefix } from "@/lib/utils";

export function Price({
  amountCents,
  currency = "EUR",
  className,
}: {
  amountCents: number;
  currency?: string;
  className?: string;
}) {
  const formatted =
    currency === "EUR"
      ? formatEuroPrefix(amountCents)
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          minimumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
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
