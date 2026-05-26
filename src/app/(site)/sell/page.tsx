import Link from "next/link";
import { IconCamera, IconCash, IconShieldCheck } from "@tabler/icons-react";

import { SellActivateButton } from "@/components/sell/sell-activate-button";
import { Button } from "@/components/ui/button";
import { SITE_CONTAINER } from "@/config/site-layout";
import { getProfile, getSessionUser } from "@/lib/auth/guards";
import { hasRole } from "@/lib/roles";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { cn } from "@/lib/utils";

export default async function SellPage() {
  const [profile, user] = await Promise.all([getProfile(), getSessionUser()]);
  const locale = await getLocale();
  const s = MESSAGES[locale].sell;
  const role = profile?.role ?? null;
  const isSeller = role ? hasRole(role, "seller") : false;

  return (
    <div className={cn(SITE_CONTAINER, "space-y-12 bg-[var(--color-background-page)] py-12")}>
      <header className="max-w-3xl space-y-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{s.sellersKicker}</p>
        <h1 className="text-[clamp(2rem,6vw,3rem)] font-black uppercase leading-[0.95] tracking-[-0.04em] text-[#111111]">
          {s.title}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">{s.subtitle}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          {isSeller ? (
            <Button className="bg-mint px-8 font-semibold text-white hover:bg-mint/90" render={<Link href="/seller/listings/new" />}>
              {s.newListing}
            </Button>
          ) : user && role === "user" ? (
            <SellActivateButton label={s.getStarted} />
          ) : (
            <>
              <Button className="bg-mint px-8 font-semibold text-white hover:bg-mint/90" render={<Link href="/auth/register" />}>
                {s.getStarted}
              </Button>
              <Button variant="outline" className="border-2 border-[#111111] px-8 font-semibold text-[#111111]" render={<Link href="/browse" />}>
                {s.browseGear}
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl bg-[var(--color-background-surface)] p-6 shadow-sm ring-1 ring-[#e0ddd8]/70">
          <IconShieldCheck className="size-9 text-mint" stroke={1.5} aria-hidden />
          <h2 className="mt-4 text-base font-semibold text-[#111111]">{s.tile1h}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{s.tile1t}</p>
        </div>
        <div className="rounded-2xl bg-[var(--color-background-surface)] p-6 shadow-sm ring-1 ring-[#e0ddd8]/70">
          <IconCamera className="size-9 text-mint" stroke={1.5} aria-hidden />
          <h2 className="mt-4 text-base font-semibold text-[#111111]">{s.tile2h}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{s.tile2t}</p>
        </div>
        <div className="rounded-2xl bg-[var(--color-background-surface)] p-6 shadow-sm ring-1 ring-[#e0ddd8]/70">
          <IconCash className="size-9 text-mint" stroke={1.5} aria-hidden />
          <h2 className="mt-4 text-base font-semibold text-[#111111]">{s.tile3h}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{s.tile3t}</p>
        </div>
      </div>

      {!isSeller ? (
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">{s.footerBuyer}</p>
      ) : (
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {s.footerSeller}{" "}
          <Link href="/seller" className="font-semibold text-mint underline-offset-4 hover:underline">
            {s.openHub}
          </Link>{" "}
          {s.footerSellerTail}
        </p>
      )}
    </div>
  );
}
