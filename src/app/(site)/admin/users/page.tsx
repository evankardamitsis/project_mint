import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/roles";

const PAGE_SIZE = 20;

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  seller: "Seller",
  user: "User",
};

function initialsFrom(name: string | null, email: string | null) {
  const base = (name ?? email ?? "?").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return base.slice(0, 2).toUpperCase() || "?";
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
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

type PageProps = { searchParams: Promise<{ page?: string; q?: string }> };

export default async function AdminUsersPage(props: PageProps) {
  const sp = await props.searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const q = (sp.q ?? "").trim();
  const offset = (page - 1) * PAGE_SIZE;

  const [supabase, locale] = await Promise.all([createClient(), getLocale()] as const);
  const s = MESSAGES[locale].adminUsers;

  let countQuery = supabase.from("profiles").select("*", { count: "exact", head: true });
  let dataQuery = supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("role", { ascending: false })
    .order("created_at", { ascending: true })
    .range(offset, offset + PAGE_SIZE - 1);

  if (q) {
    const pattern = `%${q}%`;
    countQuery = countQuery.or(`full_name.ilike.${pattern},email.ilike.${pattern}`);
    dataQuery = dataQuery.or(`full_name.ilike.${pattern},email.ilike.${pattern}`);
  }

  const [{ count }, { data, error }] = await Promise.all([countQuery, dataQuery]);

  if (error) {
    console.error("[admin/users] profiles", error.message);
  }

  const users = (data ?? []) as {
    id: string;
    email: string | null;
    full_name: string | null;
    role: UserRole;
    created_at: string;
  }[];

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const str = params.toString();
    return str ? `/admin/users?${str}` : "/admin/users";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#111111]">{s.title}</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          {s.subtitle} {total > 0 ? s.total.replace("{n}", String(total)) : ""}
        </p>
      </div>

      {/* Search — plain GET form, no JS needed */}
      <form method="GET" action="/admin/users" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={s.searchPlaceholder}
          className="w-full max-w-sm rounded-xl border border-[#EEECE8] bg-white px-4 py-2.5 text-sm text-[#111111] placeholder:text-[#ABABAB] focus:border-[#111111] focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-xl border border-[#EEECE8] bg-white px-4 py-2.5 text-sm font-medium text-[#111111] transition-colors hover:border-[#111111]"
        >
          {s.searchBtn}
        </button>
        {q ? (
          <Link
            href="/admin/users"
            className="rounded-xl border border-[#EEECE8] bg-white px-4 py-2.5 text-sm font-medium text-[#6B6B6B] transition-colors hover:border-[#111111]"
          >
            {s.clearBtn}
          </Link>
        ) : null}
      </form>

      {/* User list */}
      {users.length === 0 ? (
        <p className="py-12 text-center text-sm text-[#6B6B6B]">{s.emptyMsg}</p>
      ) : (
        <div className="divide-y divide-[#EEECE8] overflow-hidden rounded-2xl border border-[#EEECE8] bg-white">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/admin/users/${user.id}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#F7F6F3]"
            >
              {/* Avatar */}
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint-tint text-xs font-bold text-mint-dark">
                {initialsFrom(user.full_name, user.email)}
              </span>

              {/* Name + email */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#111111]">
                  {user.full_name?.trim() || "—"}
                </p>
                <p className="truncate text-xs text-[#ABABAB]">{user.email ?? "—"}</p>
              </div>

              {/* Role badge */}
              <RoleBadge role={user.role} />

              {/* Chevron */}
              <ChevronRight className="size-4 shrink-0 text-[#ABABAB]" />
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#6B6B6B]">
            {s.pageOf.replace("{page}", String(page)).replace("{total}", String(totalPages))}
          </p>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link
                href={pageHref(page - 1)}
                className="rounded-xl border border-[#EEECE8] bg-white px-4 py-2 text-sm font-medium text-[#111111] transition-colors hover:border-[#111111]"
              >
                {s.prevPage}
              </Link>
            ) : null}
            {page < totalPages ? (
              <Link
                href={pageHref(page + 1)}
                className="rounded-xl border border-[#EEECE8] bg-white px-4 py-2 text-sm font-medium text-[#111111] transition-colors hover:border-[#111111]"
              >
                {s.nextPage}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
