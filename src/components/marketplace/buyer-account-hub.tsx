import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Bell, Eye, Handshake, Package, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HubCopy = {
  headline: string;
  lead: string;
  cardPurchasesTitle: string;
  cardPurchasesBody: string;
  cardOffersTitle: string;
  cardOffersBody: string;
  cardSavedTitle: string;
  cardSavedBody: string;
  cardSavedCta: string;
  cardHelpTitle: string;
  cardHelpBody: string;
  cardAlertsTitle: string;
  cardAlertsBody: string;
};

function HubTile({
  href,
  icon: Icon,
  title,
  body,
  footer,
  muted,
}: {
  href?: string;
  icon: typeof Package;
  title: string;
  body: string;
  footer?: ReactNode;
  muted?: boolean;
}) {
  const inner = (
    <>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-background-page)] text-mint">
        <Icon className="size-5" strokeWidth={1.5} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[#111111]">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{body}</p>
        {footer}
      </div>
      {href && !muted ? <ArrowRight className="size-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden /> : null}
    </>
  );

  if (muted || !href) {
    return (
      <div
        className={cn(
          "flex gap-4 rounded-2xl bg-[var(--color-background-surface)] p-5 shadow-sm ring-1 ring-[#e0ddd8]/70",
          muted && "opacity-80",
        )}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group flex gap-4 rounded-2xl bg-[var(--color-background-surface)] p-5 shadow-sm ring-1 ring-[#e0ddd8]/70 transition-shadow hover:shadow-md hover:ring-mint/25"
    >
      {inner}
    </Link>
  );
}

export function BuyerAccountHub({
  copy,
  purchaseCount,
  offerCount,
  followsCount,
  alertsCount,
}: {
  copy: HubCopy;
  purchaseCount: number;
  offerCount: number;
  followsCount: number;
  alertsCount: number;
}) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-black uppercase tracking-[-0.04em] text-[#111111]">
          {copy.headline}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-text-secondary)]">{copy.lead}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <HubTile
          href="/buyer/purchases"
          icon={Package}
          title={copy.cardPurchasesTitle}
          body={copy.cardPurchasesBody}
          footer={
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              {purchaseCount === 1 ? "1 order" : `${purchaseCount} orders`}
            </p>
          }
        />
        <HubTile
          href="/buyer/offers"
          icon={Handshake}
          title={copy.cardOffersTitle}
          body={copy.cardOffersBody}
          footer={
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              {offerCount === 1 ? "1 offer" : `${offerCount} offers`}
            </p>
          }
        />
        <HubTile
          href="/buyer/follows"
          icon={Eye}
          title={copy.cardSavedTitle}
          body={copy.cardSavedBody}
          footer={
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              {followsCount === 1 ? "1 ακολουθείς" : `${followsCount} ακολουθείς`}
            </p>
          }
        />
        <HubTile
          href="/buyer/alerts"
          icon={Bell}
          title={copy.cardAlertsTitle}
          body={copy.cardAlertsBody}
          footer={
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              {alertsCount === 1 ? "1 search" : `${alertsCount} searches`}
            </p>
          }
        />
        <HubTile
          icon={Shield}
          title={copy.cardHelpTitle}
          body={copy.cardHelpBody}
          footer={
            <Button size="sm" variant="outline" className="mt-4 border-[#e0ddd8] text-[#111111]" render={<Link href="/buyer/purchases" />}>
              Go to purchases
            </Button>
          }
        />
      </div>
    </div>
  );
}
