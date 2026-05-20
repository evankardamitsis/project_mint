import { redirect } from "next/navigation";

/** Legacy route — watchlist renamed to follows (Ακολουθώ). */
export default function BuyerWatchlistRedirectPage() {
  redirect("/buyer/follows");
}
