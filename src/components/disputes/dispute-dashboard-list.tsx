import Image from "next/image";
import Link from "next/link";

import { DisputeReasonBadge } from "@/components/disputes/dispute-reason-badge";
import { DisputeStatusBadge } from "@/components/disputes/dispute-status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DisputeListRow } from "@/types/disputes";

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("el-GR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}

export function DisputeDashboardList({ rows, statusFilter }: { rows: DisputeListRow[]; statusFilter: string }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No disputes{statusFilter && statusFilter !== "all" ? ` in “${statusFilter}”` : ""}.
      </p>
    );
  }

  return (
    <>
      <div className="hidden rounded-xl border border-border/80 md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14" />
              <TableHead>Listing</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                    {row.listing_image_url ? (
                      <Image src={row.listing_image_url} alt="" fill className="object-cover" sizes="40px" />
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="max-w-[180px] font-medium">{row.listing_title ?? "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.buyer_label}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.seller_label}</TableCell>
                <TableCell>
                  <DisputeReasonBadge reason={row.reason} />
                </TableCell>
                <TableCell>
                  <DisputeStatusBadge status={row.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatWhen(row.created_at)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" render={<Link href={`/admin/orders/${row.order_id}/dispute`} />}>
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-4 md:hidden">
        {rows.map((row) => (
          <div key={row.id} className="space-y-3 rounded-xl border border-border/80 bg-card p-4">
            <div className="flex gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                {row.listing_image_url ? (
                  <Image src={row.listing_image_url} alt="" fill className="object-cover" sizes="56px" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium leading-snug">{row.listing_title ?? "—"}</p>
                <p className="text-xs text-muted-foreground">
                  {row.buyer_label} · {row.seller_label}
                </p>
                <div className="flex flex-wrap gap-2">
                  <DisputeReasonBadge reason={row.reason} />
                  <DisputeStatusBadge status={row.status} />
                </div>
                <p className="text-xs text-muted-foreground">{formatWhen(row.created_at)}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" render={<Link href={`/admin/orders/${row.order_id}/dispute`} />}>
              Review
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
