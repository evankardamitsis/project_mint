import { BuyerAccountHub } from "@/components/marketplace/buyer-account-hub";
import { fetchBuyerFollowsCount } from "@/lib/follows/queries";
import { fetchBuyerHubCounts } from "@/lib/orders/queries";
import { fetchSavedSearchCountForUser } from "@/lib/saved-searches/queries";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";

export default async function BuyerHomePage() {
  const locale = await getLocale();
  const h = MESSAGES[locale].buyerHome;
  const [counts, followsCount, alertsCount] = await Promise.all([
    fetchBuyerHubCounts(),
    fetchBuyerFollowsCount(),
    fetchSavedSearchCountForUser(),
  ]);

  return (
    <BuyerAccountHub
      copy={h}
      purchaseCount={counts.purchases}
      offerCount={counts.offers}
      followsCount={followsCount}
      alertsCount={alertsCount}
    />
  );
}
