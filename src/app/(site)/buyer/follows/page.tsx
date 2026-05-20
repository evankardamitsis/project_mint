import Link from "next/link";
import Image from "next/image";
import { Eye, TrendingDown } from "lucide-react";

import { getUserFollows } from "@/app/actions/follows";
import { formatEuroPrefix } from "@/lib/utils";

export default async function FollowsPage() {
  const listings = await getUserFollows();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Ακολουθώ</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">Θα σε ειδοποιούμε αν η τιμή μειωθεί.</p>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F7F6F3]">
            <Eye className="h-8 w-8 text-[#ABABAB]" aria-hidden />
          </div>
          <h3 className="mb-2 text-base font-semibold text-[#111111]">Δεν ακολουθείς αγγελίες ακόμη</h3>
          <p className="mb-6 max-w-xs text-sm leading-relaxed text-[#6B6B6B]">
            Πάτα το 👁 σε οποιαδήποτε αγγελία — θα σε ειδοποιούμε αν η τιμή πέσει.
          </p>
          <Link
            href="/browse"
            className="rounded-xl bg-[#111111] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#333333]"
          >
            Εξερεύνησε αγγελίες
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => {
            const hasDrop =
              typeof listing.latest_price_drop_percent === "number" &&
              listing.latest_price_drop_percent <= -5;
            const oldCents = listing.latest_price_drop_old_price_cents;
            const dropEuros =
              hasDrop && oldCents != null && oldCents > listing.price_cents
                ? (oldCents - listing.price_cents) / 100
                : 0;

            return (
              <Link
                key={listing.id}
                href={`/listing/${listing.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-[#EEECE8] bg-white p-4 transition-all hover:border-[#DDDBD6]"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#F7F6F3]">
                  {listing.primary_image_url ? (
                    <Image
                      src={listing.primary_image_url}
                      alt={listing.title}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#111111]">{listing.title}</p>
                  <p className="mt-0.5 text-xs text-[#ABABAB]">
                    {[listing.category_name, listing.location?.trim()].filter(Boolean).join(" · ")}
                  </p>
                  {hasDrop && dropEuros > 0 ? (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#FEF3E2] px-2 py-0.5 text-[10px] font-bold text-[#C47A15]">
                      <TrendingDown className="h-2.5 w-2.5" aria-hidden />
                      −€{dropEuros.toFixed(0)} μείωση
                    </span>
                  ) : null}
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-base font-black text-[#111111] tabular-nums">
                    {listing.currency === "EUR"
                      ? formatEuroPrefix(listing.price_cents)
                      : `€${(listing.price_cents / 100).toLocaleString("el-GR")}`}
                  </p>
                  {hasDrop && oldCents != null ? (
                    <p className="mt-0.5 text-xs text-[#ABABAB] line-through tabular-nums">
                      {listing.currency === "EUR"
                        ? formatEuroPrefix(oldCents)
                        : `€${(oldCents / 100).toLocaleString("el-GR")}`}
                    </p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
