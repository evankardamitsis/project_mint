import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ExternalLink } from "lucide-react";

import { UserRoleActions } from "@/components/admin/user-role-actions";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/lib/roles";
import { formatEuroPrefix } from "@/lib/utils";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import {
  fetchAdminSellerProfile,
  fetchAdminUserPurchases,
  fetchAdminUserSales,
  fetchAdminUserListings,
  fetchAdminUserBuyerOffers,
  fetchAdminUserSellerOffers,
  type AdminUserOrderRow,
  type AdminUserListingRow,
  type AdminUserOfferRow,
} from "@/lib/admin/user-queries";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/roles";

// ─── static maps ─────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  seller: "Seller",
  user: "User",
};

const ROLE_DESCRIPTIONS: Record<UserRole, Record<"en" | "el", string>> = {
  super_admin: {
    en: "Full access to all features.",
    el: "Πλήρης πρόσβαση σε όλες τις λειτουργίες.",
  },
  admin: {
    en: "Can manage listings, orders, and users.",
    el: "Μπορεί να διαχειρίζεται αγγελίες, παραγγελίες και χρήστες.",
  },
  seller: {
    en: "Can create listings and receive orders.",
    el: "Μπορεί να δημιουργεί αγγελίες και να λαμβάνει παραγγελίες.",
  },
  user: {
    en: "Standard buyer account.",
    el: "Τυπικός χρήστης αγοραστής.",
  },
};

const ORDER_STATUS_LABELS: Record<string, Record<"en" | "el", string>> = {
  pending_payment: { en: "Pending payment", el: "Αναμένει πληρωμή" },
  paid: { en: "Paid", el: "Πληρώθηκε" },
  cleared_for_shipping: { en: "Ready to ship", el: "Έτοιμη αποστολή" },
  shipped: { en: "Shipped", el: "Εστάλη" },
  delivered: { en: "Delivered", el: "Παραδόθηκε" },
  completed: { en: "Completed", el: "Ολοκληρώθηκε" },
  disputed: { en: "Disputed", el: "Σε αμφισβήτηση" },
  cancelled: { en: "Cancelled", el: "Ακυρώθηκε" },
  refunded: { en: "Refunded", el: "Επιστράφηκε" },
};

const LISTING_STATUS_LABELS: Record<string, Record<"en" | "el", string>> = {
  draft: { en: "Draft", el: "Πρόχειρο" },
  pending_review: { en: "Pending review", el: "Προς έγκριση" },
  active: { en: "Active", el: "Ενεργή" },
  reserved: { en: "Reserved", el: "Δεσμευμένη" },
  sold: { en: "Sold", el: "Πουλήθηκε" },
  rejected: { en: "Rejected", el: "Απορρίφθηκε" },
  archived: { en: "Archived", el: "Αρχειοθετημένη" },
};

const OFFER_STATUS_LABELS: Record<string, Record<"en" | "el", string>> = {
  pending: { en: "Pending", el: "Εκκρεμής" },
  accepted: { en: "Accepted", el: "Αποδεκτή" },
  rejected: { en: "Rejected", el: "Απορρίφθηκε" },
  countered: { en: "Countered", el: "Αντιπρόταση" },
  expired: { en: "Expired", el: "Έληξε" },
  cancelled: { en: "Cancelled", el: "Ακυρώθηκε" },
};

// ─── sub-components ──────────────────────────────────────────────────────────

function SectionShell({
  title,
  count,
  children,
  empty,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  empty: string;
}) {
  return (
    <div className="rounded-2xl border border-[#EEECE8] bg-white">
      <div className="flex items-center justify-between border-b border-[#EEECE8] px-5 py-4">
        <h2 className="text-sm font-bold text-[#111111]">{title}</h2>
        <span className="rounded-full bg-[#F7F6F3] px-2.5 py-0.5 text-xs font-semibold text-[#6B6B6B]">
          {count}
        </span>
      </div>
      {count === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-[#ABABAB]">{empty}</p>
      ) : (
        <div className="divide-y divide-[#EEECE8]">{children}</div>
      )}
    </div>
  );
}

function OrderRow({
  row,
  locale,
}: {
  row: AdminUserOrderRow;
  locale: "en" | "el";
}) {
  const dateLocale = locale === "el" ? "el-GR" : "en-GB";
  const statusLabel = ORDER_STATUS_LABELS[row.status]?.[locale] ?? row.status;
  return (
    <Link
      href={`/admin/orders/${row.id}`}
      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#F7F6F3]"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#111111]">{row.listing_title}</p>
        <p className="mt-0.5 text-xs text-[#ABABAB]">
          {row.counterparty_label} ·{" "}
          {new Date(row.created_at).toLocaleDateString(dateLocale, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      <StatusBadge domain="order" value={row.status} label={statusLabel} />
      <p className="shrink-0 text-sm font-black text-[#111111]">
        {formatEuroPrefix(row.amount_cents)}
      </p>
      <ChevronRight className="size-4 shrink-0 text-[#ABABAB]" />
    </Link>
  );
}

function ListingRow({
  row,
  locale,
}: {
  row: AdminUserListingRow;
  locale: "en" | "el";
}) {
  const dateLocale = locale === "el" ? "el-GR" : "en-GB";
  const statusLabel = LISTING_STATUS_LABELS[row.status]?.[locale] ?? row.status;
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#111111]">{row.title}</p>
        <p className="mt-0.5 text-xs text-[#ABABAB]">
          {row.category_name ?? "—"} ·{" "}
          {new Date(row.created_at).toLocaleDateString(dateLocale, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      <StatusBadge domain="listing" value={row.status} label={statusLabel} />
      <p className="shrink-0 text-sm font-black text-[#111111]">
        {formatEuroPrefix(row.price_cents)}
      </p>
      <Link
        href={`/listing/${row.slug}`}
        target="_blank"
        className="shrink-0 text-[#ABABAB] transition-colors hover:text-[#111111]"
        aria-label="Open listing"
      >
        <ExternalLink className="size-4" />
      </Link>
    </div>
  );
}

function OfferRow({
  row,
  locale,
}: {
  row: AdminUserOfferRow;
  locale: "en" | "el";
}) {
  const dateLocale = locale === "el" ? "el-GR" : "en-GB";
  const statusLabel = OFFER_STATUS_LABELS[row.status]?.[locale] ?? row.status;
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#111111]">{row.listing_title}</p>
        <p className="mt-0.5 text-xs text-[#ABABAB]">
          {row.counterparty_label !== "—" ? `${row.counterparty_label} · ` : ""}
          {new Date(row.created_at).toLocaleDateString(dateLocale, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      <StatusBadge domain="offer" value={row.status} label={statusLabel} />
      <p className="shrink-0 text-sm font-black text-[#111111]">
        {formatEuroPrefix(row.amount_cents)}
      </p>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
        role === "user" && "bg-[#e8e6e1] text-[#555555]",
        role === "seller" && "bg-mint-tint text-mint-dark",
        role === "admin" && "bg-[#111111] text-white",
        role === "super_admin" && "bg-mint text-white",
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}

function initialsFrom(name: string | null, email: string | null) {
  const base = (name ?? email ?? "?").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  return base.slice(0, 2).toUpperCase() || "?";
}

// ─── page ─────────────────────────────────────────────────────────────────────

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminUserDetailPage(props: PageProps) {
  const { id } = await props.params;

  const [supabase, locale] = await Promise.all([createClient(), getLocale()] as const);
  const s = MESSAGES[locale].adminUserDetail;
  const roleActionLabels = MESSAGES[locale].userRoleActions;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !profile) notFound();

  const role = profile.role as UserRole;
  const displayName = (profile.full_name as string | null)?.trim() || "—";
  const email = profile.email as string | null;
  const joinedAt = new Date(profile.created_at as string).toLocaleDateString(
    locale === "el" ? "el-GR" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" },
  );

  const joinedLabel = locale === "el" ? `Εγγραφή ${joinedAt}` : `Joined ${joinedAt}`;

  const isSeller = role === "seller" || role === "admin" || role === "super_admin";
  const canManageRoles = await isSuperAdmin();

  const [sellerProfile, purchases, buyerOffers] = await Promise.all([
    isSeller ? fetchAdminSellerProfile(id) : Promise.resolve(null),
    fetchAdminUserPurchases(id),
    fetchAdminUserBuyerOffers(id),
  ]);

  const [listings, sales, sellerOffers] = sellerProfile
    ? await Promise.all([
        fetchAdminUserListings(sellerProfile.id),
        fetchAdminUserSales(sellerProfile.id),
        fetchAdminUserSellerOffers(sellerProfile.id),
      ])
    : [[] as AdminUserListingRow[], [] as AdminUserOrderRow[], [] as AdminUserOfferRow[]];

  return (
    <div className="space-y-5">
      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="text-[var(--color-text-secondary)]"
        render={<Link href="/admin/users" />}
      >
        {s.backBtn}
      </Button>

      {/* Profile card */}
      <div className="rounded-2xl border border-[#EEECE8] bg-white p-6">
        <div className="flex items-start gap-5">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-mint-tint text-xl font-bold text-mint-dark">
            {initialsFrom(profile.full_name as string | null, email)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-[#111111]">{displayName}</h1>
            {email ? <p className="mt-0.5 text-sm text-[#6B6B6B]">{email}</p> : null}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <RoleBadge role={role} />
              <p className="text-xs text-[#ABABAB]">{joinedLabel}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-xl bg-[#F7F6F3] px-4 py-3">
          <p className="text-sm text-[#6B6B6B]">{ROLE_DESCRIPTIONS[role][locale]}</p>
        </div>
      </div>

      {/* Seller profile strip */}
      {sellerProfile ? (
        <div className="rounded-2xl border border-[#EEECE8] bg-white px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#ABABAB]">
                {s.sellerProfileKicker}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#111111]">
                {sellerProfile.display_name}
              </p>
              {sellerProfile.location ? (
                <p className="text-xs text-[#6B6B6B]">{sellerProfile.location}</p>
              ) : null}
            </div>
            <StatusBadge
              domain="seller_verification"
              value={sellerProfile.verification_status}
            />
          </div>
        </div>
      ) : null}

      {/* ── Seller sections ── */}
      {sellerProfile ? (
        <>
          <SectionShell title={s.sectionListings} count={listings.length} empty={s.emptyListings}>
            {listings.map((row) => (
              <ListingRow key={row.id} row={row} locale={locale} />
            ))}
          </SectionShell>

          <SectionShell title={s.sectionSales} count={sales.length} empty={s.emptySales}>
            {sales.map((row) => (
              <OrderRow key={row.id} row={row} locale={locale} />
            ))}
          </SectionShell>

          <SectionShell title={s.sectionIncomingOffers} count={sellerOffers.length} empty={s.emptyIncomingOffers}>
            {sellerOffers.map((row) => (
              <OfferRow key={row.id} row={row} locale={locale} />
            ))}
          </SectionShell>
        </>
      ) : null}

      {/* ── Buyer sections (always) ── */}
      <SectionShell title={s.sectionPurchases} count={purchases.length} empty={s.emptyPurchases}>
        {purchases.map((row) => (
          <OrderRow key={row.id} row={row} locale={locale} />
        ))}
      </SectionShell>

      <SectionShell title={s.sectionOutgoingOffers} count={buyerOffers.length} empty={s.emptyOutgoingOffers}>
        {buyerOffers.map((row) => (
          <OfferRow key={row.id} row={row} locale={locale} />
        ))}
      </SectionShell>

      {/* ── Role management ── */}
      {canManageRoles ? (
        <div className="rounded-2xl border border-[#EEECE8] bg-white p-6">
          <h2 className="text-sm font-bold text-[#111111]">{s.roleTitle}</h2>
          <p className="mt-1 text-xs text-[#6B6B6B]">{s.roleNote}</p>
          <div className="mt-5">
            <UserRoleActions
              userId={id}
              currentRole={role}
              userLabel={email ?? displayName}
              labels={roleActionLabels}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
