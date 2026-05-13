import { BuyerAccountHub } from "@/components/marketplace/buyer-account-hub";
import { fetchBuyerWatchlistCount } from "@/lib/favorites/queries";
import { fetchBuyerHubCounts } from "@/lib/orders/queries";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";

export default async function BuyerHomePage() {
  const locale = await getLocale();
  const h = MESSAGES[locale].buyerHome;
  const [counts, watchlistCount] = await Promise.all([fetchBuyerHubCounts(), fetchBuyerWatchlistCount()]);

  return (
    <BuyerAccountHub copy={h} purchaseCount={counts.purchases} offerCount={counts.offers} watchlistCount={watchlistCount} />
  );
}
