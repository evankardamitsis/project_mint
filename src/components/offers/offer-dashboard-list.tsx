import Image from "next/image";

import { OfferAmount } from "@/components/offers/offer-amount";
import { OfferRowActionsBuyer } from "@/components/offers/offer-row-actions-buyer";
import { OfferRowActionsSeller } from "@/components/offers/offer-row-actions-seller";
import { OfferStatusBadge } from "@/components/offers/offer-status-badge";
import { Price } from "@/components/price";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BuyerOfferRow, SellerOfferRow } from "@/types/offers";

function formatWhen(iso: string | null) {
  if (!iso) {
    return "—";
  }
  try {
    return new Date(iso).toLocaleString("el-GR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}

function buyerLabel(row: SellerOfferRow) {
  return row.buyer_full_name?.trim() || row.buyer_email?.trim() || "Buyer";
}

export function BuyerOfferDashboardList({ rows }: { rows: BuyerOfferRow[] }) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <div className="hidden rounded-xl border border-border/80 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14" />
            <TableHead>Listing</TableHead>
            <TableHead>Your offer</TableHead>
            <TableHead>List price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                  {row.listings?.primary_image_url ? (
                    <Image
                      src={row.listings.primary_image_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="max-w-[200px] font-medium">
                {row.listings?.title ?? "Listing unavailable"}
              </TableCell>
              <TableCell>
                <OfferAmount amountCents={row.amount_cents} currency={row.listings?.currency} />
              </TableCell>
              <TableCell>
                {row.listings ? (
                  <Price amountCents={row.listings.price_cents} currency={row.listings.currency} className="text-sm" />
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <OfferStatusBadge status={row.status} expiresAt={row.expires_at} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                {formatWhen(row.expires_at)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                {formatWhen(row.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <OfferRowActionsBuyer
                  offerId={row.id}
                  listingSlug={row.listings?.slug ?? null}
                  status={row.status}
                  expiresAt={row.expires_at}
                  parentOfferId={row.parent_offer_id}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function BuyerOfferCards({ rows }: { rows: BuyerOfferRow[] }) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <div className="space-y-4 md:hidden">
      {rows.map((row) => (
        <div key={row.id} className="space-y-3 rounded-xl border border-border/80 bg-card p-4">
          <div className="flex gap-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
              {row.listings?.primary_image_url ? (
                <Image
                  src={row.listings.primary_image_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium leading-snug">{row.listings?.title ?? "Listing unavailable"}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Offer</span>
                <OfferAmount amountCents={row.amount_cents} currency={row.listings?.currency} />
                <span className="text-muted-foreground">· List</span>
                {row.listings ? (
                  <Price amountCents={row.listings.price_cents} currency={row.listings.currency} className="text-sm" />
                ) : (
                  "—"
                )}
              </div>
              <OfferStatusBadge status={row.status} expiresAt={row.expires_at} />
              <p className="text-xs text-muted-foreground">
                Expires {formatWhen(row.expires_at)} · Sent {formatWhen(row.created_at)}
              </p>
            </div>
          </div>
          <OfferRowActionsBuyer
            offerId={row.id}
            listingSlug={row.listings?.slug ?? null}
            status={row.status}
            expiresAt={row.expires_at}
            parentOfferId={row.parent_offer_id}
          />
        </div>
      ))}
    </div>
  );
}

export function SellerOfferDashboardList({ rows }: { rows: SellerOfferRow[] }) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <div className="hidden rounded-xl border border-border/80 md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14" />
            <TableHead>Listing</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Offer</TableHead>
            <TableHead>List price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                  {row.listings?.primary_image_url ? (
                    <Image
                      src={row.listings.primary_image_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="max-w-[180px] font-medium">
                {row.listings?.title ?? "Listing unavailable"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{buyerLabel(row)}</TableCell>
              <TableCell>
                <OfferAmount amountCents={row.amount_cents} currency={row.listings?.currency} />
              </TableCell>
              <TableCell>
                {row.listings ? (
                  <Price amountCents={row.listings.price_cents} currency={row.listings.currency} className="text-sm" />
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>
                <OfferStatusBadge status={row.status} expiresAt={row.expires_at} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                {formatWhen(row.expires_at)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                {formatWhen(row.created_at)}
              </TableCell>
              <TableCell className="text-right align-top">
                <OfferRowActionsSeller
                  offerId={row.id}
                  listingSlug={row.listings?.slug ?? null}
                  status={row.status}
                  expiresAt={row.expires_at}
                  parentOfferId={row.parent_offer_id}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function SellerOfferCards({ rows }: { rows: SellerOfferRow[] }) {
  if (rows.length === 0) {
    return null;
  }
  return (
    <div className="space-y-4 md:hidden">
      {rows.map((row) => (
        <div key={row.id} className="space-y-3 rounded-xl border border-border/80 bg-card p-4">
          <div className="flex gap-3">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
              {row.listings?.primary_image_url ? (
                <Image
                  src={row.listings.primary_image_url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium leading-snug">{row.listings?.title ?? "Listing unavailable"}</p>
              <p className="text-sm text-muted-foreground">{buyerLabel(row)}</p>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Offer</span>
                <OfferAmount amountCents={row.amount_cents} currency={row.listings?.currency} />
                <span className="text-muted-foreground">· List</span>
                {row.listings ? (
                  <Price amountCents={row.listings.price_cents} currency={row.listings.currency} className="text-sm" />
                ) : (
                  "—"
                )}
              </div>
              <OfferStatusBadge status={row.status} expiresAt={row.expires_at} />
              <p className="text-xs text-muted-foreground">
                Expires {formatWhen(row.expires_at)} · {formatWhen(row.created_at)}
              </p>
            </div>
          </div>
          <OfferRowActionsSeller
            offerId={row.id}
            listingSlug={row.listings?.slug ?? null}
            status={row.status}
            expiresAt={row.expires_at}
            parentOfferId={row.parent_offer_id}
          />
        </div>
      ))}
    </div>
  );
}
