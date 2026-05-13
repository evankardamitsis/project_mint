import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** EUR with € prefix (consumer marketplace copy). */
export function formatEuroPrefix(amountCents: number): string {
  const euros = amountCents / 100
  const fraction = Math.round(amountCents % 100)
  const decimals = fraction === 0 ? 0 : 2
  const n = euros.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `€${n}`
}
