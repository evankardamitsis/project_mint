import { unstable_cache } from "next/cache";

import { createPublishableServerClient } from "@/lib/supabase/server";

const FALLBACK_LINES = [
  "Analog delay listed · 3h ago",
  "Studio monitors sold · 5h ago",
  "Offer accepted on vintage synth · 1d ago",
  "Guitar amp listed · 2d ago",
  "Pedalboard bundle sold · 12h ago",
] as const;

function truncateTitle(title: string, max = 42): string {
  const t = title.trim();
  if (t.length <= max) {
    return t;
  }
  return `${t.slice(0, max - 1)}…`;
}

function timeAgo(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 45) {
    return "just now";
  }
  if (sec < 3600) {
    return `${Math.floor(sec / 60)}m ago`;
  }
  if (sec < 86400) {
    return `${Math.floor(sec / 3600)}h ago`;
  }
  return `${Math.floor(sec / 86400)}d ago`;
}

function formatActivity(row: {
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}): string {
  const title = truncateTitle(row.title);
  if (row.status === "reserved") {
    return `Offer accepted on ${title} · ${timeAgo(row.updated_at)}`;
  }
  if (row.status === "sold") {
    return `${title} sold · ${timeAgo(row.updated_at)}`;
  }
  const createdMs = new Date(row.created_at).getTime();
  const within24h = Date.now() - createdMs < 86_400_000;
  const when = within24h ? timeAgo(row.created_at) : timeAgo(row.updated_at);
  return `${title} listed · ${when}`;
}

async function loadRecentActivity(): Promise<string[]> {
  const supabase = createPublishableServerClient();
  const { data, error } = await supabase
    .from("listings")
    .select("title, status, created_at, updated_at")
    .in("status", ["active", "sold", "reserved"])
    .order("updated_at", { ascending: false })
    .limit(8);

  if (error || !data?.length) {
    return [...FALLBACK_LINES];
  }

  const lines = data.map((row) =>
    formatActivity({
      title: row.title as string,
      status: row.status as string,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    }),
  );

  let i = 0;
  while (lines.length < 3 && i < FALLBACK_LINES.length) {
    lines.push(FALLBACK_LINES[i]!);
    i += 1;
  }

  return lines;
}

export async function getRecentActivity(): Promise<string[]> {
  return unstable_cache(loadRecentActivity, ["mint-recent-activity"], {
    revalidate: 60,
  })();
}
