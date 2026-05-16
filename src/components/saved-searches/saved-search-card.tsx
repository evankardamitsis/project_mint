"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";

import {
  deleteSavedSearchAction,
  toggleSavedSearchNotificationsAction,
} from "@/lib/saved-searches/actions";
import { buildBrowseUrlFromSavedSearch, buildSavedSearchSummary } from "@/lib/saved-searches/saved-search-from-browse";
import { Button } from "@/components/ui/button";
import type { SavedSearchListItem } from "@/types/saved-searches";

export type SavedSearchCardCopy = {
  viewResults: string;
  notificationsOn: string;
  notificationsOff: string;
  toggleAlertsOn: string;
  toggleAlertsOff: string;
  delete: string;
  matchOne: string;
  matchMany: string;
  savedOnPrefix: string;
};

export function SavedSearchCard({
  saved,
  copy,
  matchCount,
}: {
  saved: SavedSearchListItem;
  copy: SavedSearchCardCopy;
  matchCount: number | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const href = buildBrowseUrlFromSavedSearch(saved);
  const summary = buildSavedSearchSummary(saved);
  const count = matchCount ?? saved.last_match_count;
  const matchLabel = count === 1 ? copy.matchOne : copy.matchMany.replace("{n}", String(count));

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-[var(--color-background-surface)] p-5 shadow-sm ring-1 ring-[#e0ddd8]/70">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight text-[#111111]">{saved.name}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">{summary}</p>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]">
          <span>{saved.notifications_enabled ? copy.notificationsOn : copy.notificationsOff}</span>
          <span aria-hidden>·</span>
          <span className="tabular-nums">{matchLabel}</span>
          <span aria-hidden>·</span>
          <span>
            {copy.savedOnPrefix}{" "}
            {new Date(saved.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-[#e8e5e0] pt-4">
        <Button
          size="sm"
          className="bg-[#111111] text-white hover:bg-[#111111]/90"
          render={<Link href={href} />}
        >
          {copy.viewResults}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-[#e0ddd8]"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await toggleSavedSearchNotificationsAction(saved.id, !saved.notifications_enabled);
              if (res.ok) {
                router.refresh();
              }
            })
          }
        >
          {saved.notifications_enabled ? copy.toggleAlertsOff : copy.toggleAlertsOn}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-red-200 text-red-700 hover:bg-red-50"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await deleteSavedSearchAction(saved.id);
              if (res.ok) {
                router.refresh();
              }
            })
          }
        >
          <Trash2 className="mr-1 inline size-4 align-text-bottom" aria-hidden />
          {copy.delete}
        </Button>
      </div>
    </div>
  );
}
