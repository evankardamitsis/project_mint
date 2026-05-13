import Image from "next/image";
import Link from "next/link";

import { AdminListingRowActions } from "@/components/listings/admin-listing-row-actions";
import { ConditionBadge } from "@/components/condition-badge";
import { PageHeader } from "@/components/page-header";
import { Price } from "@/components/price";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAdminListings } from "@/lib/listings/queries";
import type { ListingStatus } from "@/types/domain";

const tabs: { label: string; value: ListingStatus | "all" }[] = [
  { label: "Pending review", value: "pending_review" },
  { label: "Active", value: "active" },
  { label: "Rejected", value: "rejected" },
  { label: "Archived", value: "archived" },
  { label: "Sold", value: "sold" },
  { label: "All", value: "all" },
];

function parseStatus(raw: string | undefined): ListingStatus | "all" {
  const allowed = new Set<string>([
    "draft",
    "pending_review",
    "active",
    "reserved",
    "sold",
    "rejected",
    "archived",
    "all",
  ]);
  if (raw && allowed.has(raw)) {
    return raw as ListingStatus | "all";
  }
  return "pending_review";
}

type PageProps = { searchParams: Promise<{ status?: string }> };

export default async function AdminListingsPage(props: PageProps) {
  const sp = await props.searchParams;
  const filter = parseStatus(sp.status);
  const listings = await fetchAdminListings(filter);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Listings moderation"
        description="Review pending listings, approve or reject, and archive problematic inventory."
      />

      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map((t) => {
          const active = filter === t.value;
          const href =
            t.value === "pending_review" ? "/admin/listings" : `/admin/listings?status=${t.value}`;
          return (
            <Button
              key={t.value}
              size="sm"
              variant={active ? "default" : "outline"}
              render={<Link href={href} />}
            >
              {t.label}
            </Button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/80">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Photo</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="whitespace-nowrap text-xs">Drop</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">
                  No listings in this view.
                </TableCell>
              </TableRow>
            ) : (
              listings.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                      {row.primary_image_url ? (
                        <Image
                          src={row.primary_image_url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate font-medium">{row.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.seller_display_name}</TableCell>
                  <TableCell className="text-sm">{row.category_name ?? "—"}</TableCell>
                  <TableCell>
                    <Price amountCents={row.price_cents} currency={row.currency} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                    {row.status === "active" &&
                    typeof row.latest_price_drop_percent === "number" &&
                    row.latest_price_drop_percent <= -5
                      ? `−${Math.round(Math.abs(row.latest_price_drop_percent))}%`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <ConditionBadge condition={row.condition} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge domain="listing" value={row.status} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleDateString("el-GR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <AdminListingRowActions listingId={row.id} slug={row.slug} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
