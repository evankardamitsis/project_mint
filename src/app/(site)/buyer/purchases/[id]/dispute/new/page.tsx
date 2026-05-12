import Link from "next/link";
import { redirect, notFound } from "next/navigation";

import { DisputeForm } from "@/components/disputes/dispute-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" render={<Link href={`/buyer/purchases/${id}`} />}>
          Back to order
        </Button>
      </div>
      <PageHeader
        title="Report an issue"
        description="Describe the problem and attach photos or documents. This opens a dispute and pauses the order for review."
      />
      <DisputeForm orderId={id} />
    </div>
  );
}
