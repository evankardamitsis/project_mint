import { BuyerAccountHub } from "@/components/marketplace/buyer-account-hub";
import { fetchBuyerHubCounts } from "@/lib/orders/queries";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";

export default async function BuyerHomePage() {
  const locale = await getLocale();
  const h = MESSAGES[locale].buyerHome;
  const counts = await fetchBuyerHubCounts();

  return <BuyerAccountHub copy={h} purchaseCount={counts.purchases} offerCount={counts.offers} />;
}
