import Link from "next/link";

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
    <Card className="overflow-hidden border-0 border-l-4 border-l-[var(--color-danger-text)]/30 bg-[var(--color-background-surface)] shadow-sm ring-1 ring-[#e0ddd8]/70">
      <CardHeader className="border-b border-[#e0ddd8]/60 bg-[var(--color-background-page)]/50">
        <div className="flex flex-wrap items-baseline gap-2">
          <CardTitle className="text-base font-semibold text-[#111111]">Case</CardTitle>
          <span className="rounded-full bg-[var(--color-background-page)] px-2 py-0.5 text-xs font-medium capitalize text-[var(--color-text-secondary)]">
            {String(dispute.status).replace(/_/g, " ")}
          </span>
        </div>
        <CardDescription>
          Opened {new Date(dispute.created_at).toLocaleString("el-GR", { dateStyle: "medium", timeStyle: "short" })}
          {openedByLabel ? (
            <>
              {" "}
              · <span className="text-ink">{openedByLabel}</span>
            </>
          ) : null}
          {dispute.reason ? (
            <>
              {" "}
              · <span className="text-[var(--color-text-muted)]">{dispute.reason}</span>
            </>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          <span className="text-[var(--color-text-muted)]">Listing:</span>{" "}
          <span className="font-medium text-ink">{listingTitle}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" render={<Link href={listingHref} />}>
            View listing
          </Button>
          <Button variant="outline" size="sm" render={<Link href={orderHref} />}>
            View order
          </Button>
        </div>
        <div className="rounded-xl border border-border/60 bg-warm-bg/60 p-3">
          <p className="text-xs font-medium text-text-caption">What they reported</p>
          <p className="mt-1 whitespace-pre-wrap leading-relaxed text-ink">{dispute.description ?? "—"}</p>
        </div>
      </CardContent>
    </Card>
  );
}
