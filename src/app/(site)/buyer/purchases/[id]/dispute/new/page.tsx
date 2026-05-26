import Link from "next/link";
import { redirect, notFound } from "next/navigation";

import { DisputeForm } from "@/components/disputes/dispute-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { DISPUTE_DESCRIPTION_MIN_LEN } from "@/lib/disputes/constants";
import { hasActiveDispute, orderAllowsNewDispute } from "@/lib/disputes/eligibility";
import { fetchOrderDetailForBuyer } from "@/lib/orders/queries";
import { createClient } from "@/lib/supabase/server";

type PageProps = { params: Promise<{ id: string }> };

export default async function BuyerNewDisputePage(props: PageProps) {
  const { id } = await props.params;
  const order = await fetchOrderDetailForBuyer(id);
  if (!order) {
    notFound();
  }

  const supabase = await createClient();
  const { data: statusRows } = await supabase.from("disputes").select("id, status").eq("order_id", id);
  if (hasActiveDispute(statusRows ?? [])) {
    redirect(`/buyer/purchases/${id}/dispute`);
  }
  if (!orderAllowsNewDispute(order)) {
    redirect(`/buyer/purchases/${id}`);
  }

  const locale = await getLocale();
  const s = MESSAGES[locale].disputes;

  const formLabels = {
    reasonLabel: s.reasonLabel,
    reasonDamaged: s.reasonDamaged,
    reasonNotAsDescribed: s.reasonNotAsDescribed,
    reasonNotReceived: s.reasonNotReceived,
    reasonCounterfeit: s.reasonCounterfeit,
    reasonOther: s.reasonOther,
    descriptionLabel: s.descriptionLabel,
    descriptionPlaceholder: s.descriptionPlaceholder.replace("{n}", String(DISPUTE_DESCRIPTION_MIN_LEN)),
    submitBtn: s.submitBtn,
    submittingBtn: s.submittingBtn,
    refundNote: s.refundNote,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" render={<Link href={`/buyer/purchases/${id}`} />}>
          {s.backToOrder}
        </Button>
      </div>
      <PageHeader title={s.reportTitle} description={s.reportDescription} />
      <DisputeForm orderId={id} labels={formLabels} />
    </div>
  );
}
