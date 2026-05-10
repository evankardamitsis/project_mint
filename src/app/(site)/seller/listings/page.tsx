import Image from "next/image";
import Link from "next/link";

import { SellerListingRowActions } from "@/components/listings/seller-listing-row-actions";
import { ConditionBadge } from "@/components/condition-badge";
import { EmptyState } from "@/components/empty-state";
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
import {
  fetchSellerListings,
  fetchSellerProfileForUser,
} from "@/lib/listings/queries";
import { Layers } from "lucide-react";

export default async function SellerListingsPage() {
  const seller = await fetchSellerProfileForUser();
  const listings = seller ? await fetchSellerListings(seller.id) : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Your listings"
        description="Manage drafts, active inventory, and archived items."
        actions={
          <Button size="sm" render={<Link href="/seller/listings/new" />}>
            New listing
          </Button>
        }
      />
      {!seller || listings.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={seller ? "No listings yet" : "Create a seller profile first"}
          description={
            seller
              ? "Create your first listing to see it here with status and pricing."
              : "You need a seller profile before listings can be created."
          }
        >
          {seller ? (
            <Button render={<Link href="/seller/listings/new" />}>Create listing</Button>
          ) : (
            <Button render={<Link href="/seller/profile" />}>Set up profile</Button>
          )}
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Photo</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Protected</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                      {row.primary_image_url ? (
                        <Image
                          src={row.primary_image_url}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate font-medium">
                    {row.title}
                  </TableCell>
                  <TableCell>
                    <Price amountCents={row.price_cents} currency={row.currency} />
                  </TableCell>
                  <TableCell>
                    <ConditionBadge condition={row.condition} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge domain="listing" value={row.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {row.protected_delivery_enabled ? "Yes" : "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                    {new Date(row.created_at).toLocaleDateString("el-GR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <SellerListingRowActions listingId={row.id} slug={row.slug} status={row.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
