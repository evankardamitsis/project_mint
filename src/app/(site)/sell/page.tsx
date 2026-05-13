import Link from "next/link";
import { IconCamera, IconCash, IconShieldCheck } from "@tabler/icons-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { SITE_CONTAINER } from "@/config/site-layout";
import { getProfile } from "@/lib/auth/guards";
import { cn } from "@/lib/utils";

export default async function SellPage() {
  const profile = await getProfile();

  return (
    <div className={cn(SITE_CONTAINER, "space-y-10 bg-background py-10")}>
      <PageHeader
        title="Sell on mint."
        description="List second-hand gear with optional protected delivery: packaging checklist, photos, tracking, and a buyer dispute window after delivery."
        actions={
          profile?.role === "seller" ? (
            <Button className="rounded-full px-8" render={<Link href="/seller/listings/new" />}>
              New listing
            </Button>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-full px-8" render={<Link href="/auth/register" />}>
                Get started
              </Button>
              <Button variant="outline" className="rounded-full border-2 border-ink px-8" render={<Link href="/browse" />}>
                Browse gear
              </Button>
            </div>
          )
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <IconShieldCheck className="size-9 text-mint" stroke={1.5} aria-hidden />
          <h2 className="mt-4 text-base font-semibold text-ink">Protected for every sale</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Payment is held until the buyer confirms delivery. You get paid, guaranteed.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <IconCamera className="size-9 text-mint" stroke={1.5} aria-hidden />
          <h2 className="mt-4 text-base font-semibold text-ink">Proof photos built in</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Upload packaging photos before you ship. Disputes are resolved fairly with evidence.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <IconCash className="size-9 text-mint" stroke={1.5} aria-hidden />
          <h2 className="mt-4 text-base font-semibold text-ink">No upfront fees</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Listing is free. A small commission applies only when your item sells.
          </p>
        </div>
      </div>

      {profile?.role !== "seller" ? (
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Create a seller profile, add payout details when you are ready, and publish listings for review — there is no fee
          to list.
        </p>
      ) : (
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
          You are set up as a seller.{" "}
          <Link href="/seller" className="font-semibold text-mint underline-offset-4 hover:underline">
            Open your seller hub
          </Link>{" "}
          to manage listings, orders, and offers.
        </p>
      )}
    </div>
  );
}
