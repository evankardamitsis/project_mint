import Link from "next/link";
import { IconCamera, IconCash, IconShieldCheck } from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SITE_CONTAINER } from "@/config/site-layout";
import { getProfile } from "@/lib/auth/guards";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { cn } from "@/lib/utils";

export default async function SellPage() {
  const profile = await getProfile();
  const locale = await getLocale();
  const s = MESSAGES[locale].sell;

  return (
    <div className={cn(SITE_CONTAINER, "space-y-10 bg-background py-10")}>
      <PageHeader
        title={s.title}
        description={s.subtitle}
        actions={
          profile?.role === "seller" ? (
            <Button className="rounded-none px-8" render={<Link href="/seller/listings/new" />}>
              {s.newListing}
            </Button>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-none px-8" render={<Link href="/auth/register" />}>
                {s.getStarted}
              </Button>
              <Button variant="outline" className="rounded-none border-2 border-ink px-8" render={<Link href="/browse" />}>
                {s.browseGear}
              </Button>
            </div>
          )
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-none border border-border bg-card p-6 shadow-sm">
          <IconShieldCheck className="size-9 text-mint" stroke={1.5} aria-hidden />
          <h2 className="mt-4 text-base font-semibold text-ink">{s.tile1h}</h2>
          <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">{s.tile1t}</p>
        </div>
        <div className="rounded-none border border-border bg-card p-6 shadow-sm">
          <IconCamera className="size-9 text-mint" stroke={1.5} aria-hidden />
          <h2 className="mt-4 text-base font-semibold text-ink">{s.tile2h}</h2>
          <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">{s.tile2t}</p>
        </div>
        <div className="rounded-none border border-border bg-card p-6 shadow-sm">
          <IconCash className="size-9 text-mint" stroke={1.5} aria-hidden />
          <h2 className="mt-4 text-base font-semibold text-ink">{s.tile3h}</h2>
          <p className="mt-2 text-sm leading-relaxed text-(--color-text-secondary)">{s.tile3t}</p>
        </div>
      </div>

      {profile?.role !== "seller" ? (
        <p className="max-w-2xl text-sm leading-relaxed text-(--color-text-secondary)">{s.footerBuyer}</p>
      ) : (
        <p className="max-w-2xl text-sm leading-relaxed text-(--color-text-secondary)">
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
