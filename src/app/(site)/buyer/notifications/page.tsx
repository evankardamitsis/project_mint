import { Bell, CheckCircle, Package, Tag, TrendingDown, XCircle } from "lucide-react";

import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";

// ─── notification config ──────────────────────────────────────────────────────

type NotifType =
  | "price_drop"
  | "new_match"
  | "offer_received"
  | "offer_accepted"
  | "offer_rejected"
  | "order_update";

const NOTIF_CONFIG: Record<
  NotifType,
  { icon: React.ElementType; color: string; bg: string }
> = {
  price_drop: { icon: TrendingDown, color: "text-mint-dark", bg: "bg-mint-tint" },
  new_match: { icon: Tag, color: "text-[#6B6B6B]", bg: "bg-[#F7F6F3]" },
  offer_received: { icon: Package, color: "text-[#6B6B6B]", bg: "bg-[#F7F6F3]" },
  offer_accepted: { icon: CheckCircle, color: "text-[#1D9E75]", bg: "bg-[#E8F7F1]" },
  offer_rejected: { icon: XCircle, color: "text-[#DC2626]", bg: "bg-[#FFF5F5]" },
  order_update: { icon: Package, color: "text-[#6B6B6B]", bg: "bg-[#F7F6F3]" },
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string, s: ReturnType<typeof getRelativeTimeStrings>) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return s.justNow;
  if (minutes < 60) return s.minutesAgo.replace("{n}", String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return s.hoursAgo.replace("{n}", String(hours));
  const days = Math.floor(hours / 24);
  if (days === 1) return s.yesterday;
  if (days < 7) return s.daysAgo.replace("{n}", String(days));
  return new Date(iso).toLocaleDateString("el-GR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type RelativeTimeStrings = {
  justNow: string;
  minutesAgo: string;
  hoursAgo: string;
  yesterday: string;
  daysAgo: string;
};

function getRelativeTimeStrings(s: RelativeTimeStrings) {
  return s;
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function BuyerNotificationsPage() {
  const user = await requireUser("/buyer/notifications");

  const [supabase, locale] = await Promise.all([
    createClient(),
    getLocale(),
  ] as const);

  const s = MESSAGES[locale].buyerNotifications;
  const timeStrings = getRelativeTimeStrings(s);

  // Fetch notifications
  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, body, read, created_at, listing_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = (data ?? []) as {
    id: string;
    type: NotifType;
    title: string;
    body: string;
    read: boolean;
    created_at: string;
    listing_id: string | null;
  }[];

  // Mark all unread as read (fire-and-forget — we already have the data)
  const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
  if (unreadIds.length > 0) {
    void supabase.from("notifications").update({ read: true }).in("id", unreadIds);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-[#111111]">{s.title}</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          {notifications.length > 0
            ? s.count.replace("{n}", String(notifications.length))
            : s.emptyBody}
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#EEECE8] bg-white py-16">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[#F7F6F3]">
            <Bell className="size-7 text-[#ABABAB]" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#111111]">{s.emptyTitle}</p>
            <p className="mt-1 text-sm text-[#6B6B6B]">{s.emptyBody}</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-[#EEECE8] overflow-hidden rounded-2xl border border-[#EEECE8] bg-white">
          {notifications.map((notif) => {
            const config = NOTIF_CONFIG[notif.type] ?? NOTIF_CONFIG.order_update;
            const Icon = config.icon;
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 px-5 py-4 ${!notif.read ? "bg-[#FAFAF8]" : ""}`}
              >
                <div
                  className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ${config.bg}`}
                >
                  <Icon className={`size-4 ${config.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#111111]">{notif.title}</p>
                  <p className="mt-0.5 text-sm text-[#6B6B6B]">{notif.body}</p>
                  <p className="mt-1.5 text-xs text-[#ABABAB]">
                    {formatRelativeTime(notif.created_at, timeStrings)}
                  </p>
                </div>
                {!notif.read && (
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-mint" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
