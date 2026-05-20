"use client";

import Link from "next/link";
import { ChevronDown, Eye } from "lucide-react";

import { AccountRoleBadge } from "@/components/account/account-role-badge";
import { LogoutButton } from "@/components/marketing/logout-button";
import type { Messages } from "@/i18n/messages";
import { hasRole, type UserRole } from "@/lib/roles-shared";
import { cn } from "@/lib/utils";

function initialsFrom(fullName: string | null, email: string | null) {
  const base = (fullName ?? email ?? "?").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return base.slice(0, 2).toUpperCase() || "?";
}

const menuItemCls = (dark: boolean) =>
  cn(
    "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
    dark
      ? "text-[#cccccc] hover:bg-[#1a1a1a] hover:text-white"
      : "text-[#111111] hover:bg-[#F7F6F3]",
  );

const roleBadgeLabels = (labels: Messages["header"]) => ({
  roleAdmin: labels.roleAdmin,
  roleSuperAdmin: labels.roleSuperAdmin,
});

export function SiteHeaderAccountMenu({
  fullName,
  email,
  role,
  labels,
  tone = "light",
}: {
  fullName: string | null;
  email: string | null;
  role: UserRole;
  labels: Messages["header"];
  tone?: "light" | "dark";
}) {
  const initials = initialsFrom(fullName, email);
  const dark = tone === "dark";
  const badgeLabels = roleBadgeLabels(labels);

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
        <AccountRoleBadge role={role} labels={badgeLabels} className="mr-1 hidden sm:inline-flex" />
        <ChevronDown className={cn("size-4 group-open:rotate-180", dark ? "text-[#888888]" : "text-ink-2")} aria-hidden />
      </summary>
      <div
        className={cn(
          "absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-48 border py-1 shadow-lg",
          dark ? "border-border-dark bg-[#111111]" : "rounded-xl border-border bg-surface",
        )}
        role="menu"
      >
        <div className={cn("border-b px-3 py-2 text-xs", dark ? "border-border-dark text-[#888888]" : "border-border text-ink-2")}>
          <div className="flex items-center gap-2">
            <span className={cn("min-w-0 truncate font-medium", dark ? "text-white" : "text-ink")}>
              {fullName ?? "Account"}
            </span>
            <AccountRoleBadge role={role} labels={badgeLabels} />
          </div>
          {email ? (
            <span className={cn("mt-0.5 block truncate", dark ? "text-text-secondary" : "text-ink-3")}>{email}</span>
          ) : null}
        </div>
        <div className="flex flex-col gap-0.5 py-1">
          <Link
            href="/buyer/follows"
            className={cn(
              "flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
              dark
                ? "text-[#cccccc] hover:bg-[#1a1a1a] hover:text-white"
                : "text-[#111111] hover:bg-[#F7F6F3]",
            )}
          >
            <Eye className="h-4 w-4 shrink-0 text-[#6B6B6B]" aria-hidden />
            <span className={cn("font-medium", dark ? "text-inherit" : "text-[#111111]")}>Ακολουθώ</span>
          </Link>
          <Link href="/buyer/purchases" className={menuItemCls(dark)}>
            <span className="font-medium">{labels.accountPurchases}</span>
          </Link>
          <Link href="/buyer" className={menuItemCls(dark)}>
            <span className="font-medium">{labels.accountSettings}</span>
          </Link>
          {hasRole(role, "seller") ? (
            <Link href="/seller/listings" className={menuItemCls(dark)}>
              <span className="font-medium">{labels.accountMyListings}</span>
            </Link>
          ) : null}
          {hasRole(role, "admin") ? (
            <Link href="/admin" className={menuItemCls(dark)}>
              <span className="font-medium">{labels.accountAdmin}</span>
            </Link>
          ) : null}
          {role === "super_admin" ? (
            <Link href="/admin/users" className={menuItemCls(dark)}>
              <span className="font-medium">{labels.accountUsers}</span>
            </Link>
          ) : null}
          <div className={cn("border-t px-2 py-2", dark ? "border-border-dark" : "border-border")}>
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
