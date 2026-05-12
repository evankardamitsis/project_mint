import Link from "next/link";

import { DisputeReasonBadge } from "@/components/disputes/dispute-reason-badge";
import { DisputeStatusBadge } from "@/components/disputes/dispute-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DisputeRow } from "@/types/disputes";

export function DisputeSummaryCard({
  dispute,
  listingTitle,
  listingHref,
  orderHref,
  openedByLabel,
}: {
  dispute: DisputeRow;
  listingTitle: string;
  listingHref: string;
  orderHref: string;
  openedByLabel?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Dispute</CardTitle>
          <DisputeStatusBadge status={dispute.status} />
          <DisputeReasonBadge reason={dispute.reason} />
        </div>
        <CardDescription>
          Opened {new Date(dispute.created_at).toLocaleString("el-GR", { dateStyle: "medium", timeStyle: "short" })}
          {openedByLabel ? (
            <>
              {" "}
              · <span className="text-foreground">{openedByLabel}</span>
            </>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          <span className="text-muted-foreground">Listing:</span>{" "}
          <span className="font-medium text-foreground">{listingTitle}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" render={<Link href={listingHref} />}>
            View listing
          </Button>
          <Button variant="outline" size="sm" render={<Link href={orderHref} />}>
            View order
          </Button>
        </div>
        <div className="rounded-lg border border-border/80 bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">Buyer description</p>
          <p className="mt-1 whitespace-pre-wrap leading-relaxed">{dispute.description ?? "—"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
