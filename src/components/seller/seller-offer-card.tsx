"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { OfferCounterForm } from "@/components/offers/offer-counter-form";
import { acceptOfferSellerAction, rejectOfferSellerAction } from "@/lib/offers/actions";
import { isOfferActionable } from "@/lib/offers/expiry";
import { cn } from "@/lib/utils";
import type { OfferStatus } from "@/types/domain";
import type { SellerOfferRow } from "@/types/offers";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("el-GR", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "—";
  }
}

function formatEuro(cents: number) {
  return `€${(cents / 100).toLocaleString("el-GR", {
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  })}`;
}

function statusLabel(s: OfferStatus): string {
  const labels: Record<string, string> = {
    pending: "Εκκρεμής",
    accepted: "Αποδεκτή",
    rejected: "Απορρίφθηκε",
    expired: "Έληξε",
    countered: "Αντιπρόταση",
    cancelled: "Ακυρώθηκε",
  };
  return labels[s] ?? s;
}

function buyerName(row: SellerOfferRow) {
  return row.buyer_full_name?.trim() || row.buyer_email?.trim() || "Αγοραστής";
}

export function SellerOfferCard({ row }: { row: SellerOfferRow }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showCounter, setShowCounter] = useState(false);
  const actionable = isOfferActionable(row.status, row.expires_at);
  const canRespond = actionable && row.status === "pending";
  const canAccept = canRespond && !row.parent_offer_id;
  const listing = row.listings;
  const slug = listing?.slug ?? null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#EEECE8] bg-white transition-all hover:border-[#DDDBD6]">
      <div className="flex items-center gap-4 border-b border-[#EEECE8] p-5">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F7F6F3]">
          {listing?.primary_image_url ? (
            <Image
              src={listing.primary_image_url}
              alt={listing.title}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#111111]">{listing?.title ?? "Αγγελία"}</p>
          <p className="mt-0.5 text-xs text-[#ABABAB]">από {buyerName(row)}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-bold",
            row.status === "accepted" && "bg-[#E8F7F1] text-[#0A5C43]",
            row.status === "expired" && "bg-[#F7F6F3] text-[#ABABAB]",
            row.status === "pending" && "bg-[#FEF3E2] text-[#C47A15]",
            row.status === "rejected" && "bg-[#FEEDED] text-[#CC4444]",
            row.status === "countered" && "bg-[#E6F1FB] text-[#0C447C]",
            row.status === "cancelled" && "bg-[#F7F6F3] text-[#ABABAB]",
          )}
        >
          {statusLabel(row.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-[#EEECE8]">
        <div className="p-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#ABABAB]">
            Προσφορά αγοραστή
          </p>
          <p className="text-2xl font-black text-[#111111]">{formatEuro(row.amount_cents)}</p>
        </div>
        <div className="p-5">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#ABABAB]">Η τιμή σου</p>
          <p className="text-2xl font-black text-[#111111]">
            {listing ? formatEuro(listing.price_cents) : "—"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#EEECE8] bg-[#F7F6F3] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#ABABAB]">{formatDate(row.created_at)}</p>
        <div className="flex flex-wrap items-center gap-2">
          {canRespond ? (
            <>
              {canAccept ? (
                <button
                  type="button"
                  disabled={pending}
                  className="rounded-xl bg-[#1D9E75] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#188A65] disabled:opacity-60"
                  onClick={() =>
                    start(async () => {
                      const r = await acceptOfferSellerAction(row.id);
                      if (r.ok) {
                        router.refresh();
                      }
                    })
                  }
                >
                  Αποδοχή
                </button>
              ) : null}
              <button
                type="button"
                disabled={pending}
                className="rounded-xl border border-[#EEECE8] bg-white px-4 py-2 text-xs font-bold text-[#111111] transition-colors hover:border-[#111111] disabled:opacity-60"
                onClick={() => setShowCounter((v) => !v)}
              >
                {showCounter ? "Κλείσιμο" : "Αντιπρόταση"}
              </button>
              <button
                type="button"
                disabled={pending}
                className="rounded-xl bg-[#FEEDED] px-4 py-2 text-xs font-bold text-[#CC4444] transition-colors hover:bg-[#FDDADA] disabled:opacity-60"
                onClick={() =>
                  start(async () => {
                    const r = await rejectOfferSellerAction(row.id);
                    if (r.ok) {
                      router.refresh();
                    }
                  })
                }
              >
                Απόρριψη
              </button>
            </>
          ) : slug ? (
            <Link
              href={`/listing/${slug}`}
              className="text-sm font-semibold text-[#1D9E75] transition-colors hover:text-[#0A5C43]"
            >
              Δες αγγελία →
            </Link>
          ) : null}
        </div>
      </div>

      {showCounter && canRespond ? (
        <div className="border-t border-[#EEECE8] bg-white px-5 py-4">
          <OfferCounterForm offerId={row.id} />
        </div>
      ) : null}
    </div>
  );
}
