import { Price } from "@/components/price";

export function OfferAmount({
  amountCents,
  currency = "EUR",
  className,
}: {
  amountCents: number;
  currency?: string;
  className?: string;
}) {
  return <Price amountCents={amountCents} currency={currency} className={className} />;
}
