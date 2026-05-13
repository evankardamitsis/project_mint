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
  tone = "light",
}: {
  fullName: string | null;
  email: string | null;
  role: UserRole;
  tone?: "light" | "dark";
}) {
  const initials = initialsFrom(fullName, email);
  const dark = tone === "dark";

  return (
    <details className="group relative">
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-1 py-1 pl-1 pr-2 transition-colors marker:content-none [&::-webkit-details-marker]:hidden",
          dark
            ? "border border-[#333333] bg-[#111111] text-white hover:border-[#444444]"
            : "rounded-full border border-border bg-surface text-ink hover:border-ink/20",
        )}
        aria-label="Account menu"
      >
        <span
          className={cn(
            "flex size-8 items-center justify-center text-xs font-bold",
            dark ? "rounded-full bg-[#1a1a1a] text-[#cccccc]" : "rounded-full bg-mint-tint text-mint-dark",
          )}
        >
          {initials}
        </span>
        <ChevronDown className={cn("size-4 group-open:rotate-180", dark ? "text-[#888888]" : "text-ink-2")} aria-hidden />
      </summary>
      <div
        className={cn(
          "absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-48 border py-1 shadow-lg",
          dark ? "border-[#1e1e1e] bg-[#111111]" : "rounded-xl border-border bg-surface",
        )}
        role="menu"
      >
        <p className={cn("border-b px-3 py-2 text-xs", dark ? "border-[#1e1e1e] text-[#888888]" : "border-border text-ink-2")}>
          <span className={cn("block truncate font-medium", dark ? "text-white" : "text-ink")}>{fullName ?? "Account"}</span>
          {email ? (
            <span className={cn("mt-0.5 block truncate", dark ? "text-[#666666]" : "text-ink-3")}>{email}</span>
          ) : null}
        </p>
        <div className="flex flex-col py-1">
          {role === "seller" || role === "admin" ? (
            <Link
              href="/seller"
              className={cn(
                "px-3 py-2 text-sm font-medium",
                dark ? "text-[#cccccc] hover:bg-[#1a1a1a] hover:text-white" : "text-ink-2 hover:bg-muted/60 hover:text-ink",
              )}
            >
              Seller hub
            </Link>
          ) : null}
          {role === "buyer" || role === "seller" || role === "admin" ? (
            <Link
              href="/buyer"
              className={cn(
                "px-3 py-2 text-sm font-medium",
                dark ? "text-[#cccccc] hover:bg-[#1a1a1a] hover:text-white" : "text-ink-2 hover:bg-muted/60 hover:text-ink",
              )}
            >
              Purchases
            </Link>
          ) : null}
          {role === "admin" ? (
            <Link
              href="/admin"
              className={cn(
                "px-3 py-2 text-sm font-medium",
                dark ? "text-[#cccccc] hover:bg-[#1a1a1a] hover:text-white" : "text-ink-2 hover:bg-muted/60 hover:text-ink",
              )}
            >
              Admin
            </Link>
          ) : null}
          <div className={cn("border-t px-2 py-2", dark ? "border-[#1e1e1e]" : "border-border")}>
            <LogoutButton
              className={cn(
                "w-full justify-center rounded-none",
                dark && "border border-[#333333] bg-transparent text-white hover:bg-[#1a1a1a]",
              )}
            />
          </div>
        </div>
      </div>
    </details>
  );
}
