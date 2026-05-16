import Link from "next/link";
import { Bell } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { SavedSearchCard } from "@/components/saved-searches/saved-search-card";
import { Button } from "@/components/ui/button";
import { fetchSavedSearchCurrentMatchCount, fetchSavedSearchesForUser } from "@/lib/saved-searches/queries";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";

export default async function BuyerAlertsPage() {
  const locale = await getLocale();
  const a = MESSAGES[locale].buyerAlerts;
  const saved = await fetchSavedSearchesForUser();
  const matchCounts =
    saved.length > 0
      ? await Promise.all(saved.map((s) => fetchSavedSearchCurrentMatchCount(s)))
      : [];

  const cardCopy = {
    viewResults: a.viewResults,
    notificationsOn: a.notificationsOn,
    notificationsOff: a.notificationsOff,
    toggleAlertsOn: a.toggleAlertsOn,
    toggleAlertsOff: a.toggleAlertsOff,
    delete: a.delete,
    matchOne: a.matchOne,
    matchMany: a.matchMany,
    savedOnPrefix: a.savedOnPrefix,
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-black uppercase tracking-[-0.04em] text-[#111111]">{a.title}</h1>
      </header>

      {saved.length === 0 ? (
        <EmptyState icon={Bell} title={a.emptyTitle} description={a.emptyBody}>
          <Button className="bg-mint px-6 font-semibold text-white hover:bg-mint/90" render={<Link href="/browse" />}>
            {a.browseCta}
          </Button>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {saved.map((item, i) => (
            <SavedSearchCard key={item.id} saved={item} copy={cardCopy} matchCount={matchCounts[i] ?? null} />
          ))}
        </div>
      )}
    </div>
  );
}
