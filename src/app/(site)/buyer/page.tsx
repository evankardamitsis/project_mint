import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { ShoppingBag } from "lucide-react";

export default async function BuyerHomePage() {
  const locale = await getLocale();
  const h = MESSAGES[locale].buyerHome;

  return (
    <div className="space-y-8">
      <PageHeader title={h.title} description={h.lead} />
      <EmptyState icon={ShoppingBag} title={h.title} description={h.emptyDescription} />
    </div>
  );
}
