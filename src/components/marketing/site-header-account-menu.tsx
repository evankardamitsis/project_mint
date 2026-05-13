"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { LogoutButton } from "@/components/marketing/logout-button";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/domain";

function initialsFrom(fullName: string | null, email: string | null) {
  const base = (fullName ?? email ?? "?").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return base.slice(0, 2).toUpperCase() || "?";
}

export function SiteHeaderAccountMenu({
  fullName,
  email,
  role,
}: {
  fullName: string | null;
  email: string | null;
  role: UserRole;
}) {
  const initials = initialsFrom(fullName, email);

  return (
    <details className="group relative">
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-1 rounded-full py-1 pl-1 pr-2 transition-colors marker:content-none [&::-webkit-details-marker]:hidden",
          "border border-border bg-surface text-ink hover:border-ink/20",
        )}
        aria-label="Account menu"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-mint-tint text-xs font-bold text-mint-dark">
          {initials}
        </span>
        <ChevronDown className="size-4 text-ink-2 group-open:rotate-180" aria-hidden />
      </summary>
      <div
        className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-48 rounded-xl border border-border bg-surface py-1 shadow-lg"
        role="menu"
      >
        <p className="border-b border-border px-3 py-2 text-xs text-ink-2">
          <span className="block truncate font-medium text-ink">{fullName ?? "Account"}</span>
          {email ? <span className="mt-0.5 block truncate text-ink-3">{email}</span> : null}
        </p>
        <div className="flex flex-col py-1">
          {role === "seller" || role === "admin" ? (
            <Link href="/seller" className="px-3 py-2 text-sm font-medium text-ink-2 hover:bg-muted/60 hover:text-ink">
              Seller hub
            </Link>
          ) : null}
          {role === "buyer" || role === "seller" || role === "admin" ? (
            <Link href="/buyer" className="px-3 py-2 text-sm font-medium text-ink-2 hover:bg-muted/60 hover:text-ink">
              Purchases
            </Link>
          ) : null}
          {role === "admin" ? (
            <Link href="/admin" className="px-3 py-2 text-sm font-medium text-ink-2 hover:bg-muted/60 hover:text-ink">
              Admin
            </Link>
          ) : null}
          <div className="border-t border-border px-2 py-2">
            <LogoutButton className="w-full justify-center" />
          </div>
        </div>
      </div>
    </details>
  );
}
