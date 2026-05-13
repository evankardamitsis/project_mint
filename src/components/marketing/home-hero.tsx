import Link from "next/link";

import { SITE_GUTTER_X } from "@/config/site-layout";
import type { AppLocale, Messages } from "@/i18n/messages";
import type { HomeMarketStats } from "@/lib/listings/queries";
import { cn, formatEuroPrefix } from "@/lib/utils";

export function HomeHero({
  locale,
  home,
  stats,
  recentPreview,
}: {
  locale: AppLocale;
  home: Messages["home"];
  stats: HomeMarketStats;
  recentPreview: readonly { slug: string; title: string; price_cents: number; currency: string }[];
}) {
  const nf = new Intl.NumberFormat(locale === "el" ? "el-GR" : "en-US");
  const listingsN = nf.format(stats.activeListings);
  const shopsN = nf.format(stats.activeSellerShops);

  function rowPrice(cents: number, currency: string) {
    if (currency === "EUR") {
      return formatEuroPrefix(cents);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  }

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden border-b-2 border-[#111111] bg-[var(--color-background-page)] pb-8 pt-10 lg:pb-10 lg:pt-12",
        SITE_GUTTER_X,
      )}
    >
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
        <div className="absolute bottom-0 left-[25%] top-0 w-px bg-[#e0ddd8]" />
        <div className="absolute bottom-0 left-1/2 top-0 w-px bg-[#e0ddd8]" />
        <div className="absolute bottom-0 left-[75%] top-0 w-px bg-[#e0ddd8]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1600px]">
        <p className="mb-[14px] flex items-center gap-[10px] text-[9px] font-bold uppercase tracking-[0.15em] text-[#1a7a4a]">
          <span>{home.heroKicker}</span>
          <span className="h-px w-12 shrink-0 bg-[#1a7a4a] opacity-50" aria-hidden />
        </p>

        <h1
          className="font-black uppercase leading-[0.88] tracking-[-0.03em] text-[#111111] [font-family:var(--font-display),Helvetica_Neue,sans-serif]"
          style={{ fontSize: "clamp(72px, 11vw, 120px)" }}
        >
          <span className="block">{home.heroHeadline1}</span>
          <span className="block">{home.heroHeadline2}</span>
          <span className="block text-[#1a7a4a]">{home.heroHeadline3}</span>
        </h1>

        <div className="mt-8 grid gap-0 border-t border-[#111111] lg:grid-cols-2 lg:items-stretch">
          <div className="border-[#111111] pt-4 lg:border-r lg:pr-6">
            <p className="mb-5 max-w-[340px] text-[12px] leading-[1.7] text-text-secondary">{home.heroSubtitle}</p>
            <div className="flex flex-wrap">
              <Link
                href="/browse"
                className="inline-flex items-center justify-center border-none bg-[#111111] px-5 py-[11px] text-[10px] font-bold uppercase tracking-[0.09em] text-[#ffffff] no-underline"
              >
                {home.browseGear}
              </Link>
              <Link
                href="/sell"
                className="-ml-px inline-flex items-center justify-center border-[1.5px] border-[#111111] bg-transparent px-5 py-[11px] text-[10px] font-bold uppercase tracking-[0.09em] text-[#111111] no-underline"
              >
                {home.startSelling}
              </Link>
            </div>
          </div>

          <div className="flex min-h-0 flex-col justify-between border-t border-[#111111] pt-4 lg:h-full lg:border-t-0 lg:pl-6">
            {recentPreview.length > 0 ? (
              <div>
                <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-[#999999]">{home.heroRecentlyListed}</p>
                <ul className="min-w-0">
                  {recentPreview.map((row) => (
                    <li
                      key={row.slug}
                      className="flex min-w-0 items-center justify-between gap-2 border-b-[0.5px] border-[#e0ddd8] py-1.5 last:border-b-0"
                    >
                      <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#111111]">{row.title}</span>
                      <span className="shrink-0 text-[12px] font-bold text-[#1a7a4a] tabular-nums">
                        {rowPrice(row.price_cents, row.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div aria-hidden className="min-h-0 shrink-0" />
            )}

            <div className="mt-6 shrink-0 lg:mt-0">
              <div className="flex flex-wrap">
                <div className="mr-5 border-r-[0.5px] border-[#dddddd] pr-5">
                  <p className="text-[28px] font-black tracking-[-0.04em] text-[#111111] tabular-nums">{listingsN}</p>
                  <p className="mt-[3px] text-[9px] font-bold uppercase tracking-[0.09em] text-[#999999]">
                    {home.statActiveListings}
                  </p>
                </div>
                <div className="mr-5 border-r-[0.5px] border-[#dddddd] pr-5">
                  <p className="text-[28px] font-black tracking-[-0.04em] text-[#111111] tabular-nums">{shopsN}</p>
                  <p className="mt-[3px] text-[9px] font-bold uppercase tracking-[0.09em] text-[#999999]">
                    {home.statActiveShops}
                  </p>
                </div>
                <div>
                  <p className="text-[28px] font-black tracking-[-0.04em] text-[#111111] tabular-nums">
                    100<span className="text-[14px] text-[#1a7a4a]">%</span>
                  </p>
                  <p className="mt-[3px] text-[9px] font-bold uppercase tracking-[0.09em] text-[#999999]">
                    {home.statBuyerProtection}
                  </p>
                </div>
              </div>
              <p className="mt-4 border-l-2 border-[#e0ddd8] pl-2 text-[9px] italic leading-normal tracking-[0.04em] text-[#cccccc]">
                {home.boostZoneNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
