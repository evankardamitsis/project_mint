"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Eye, Menu, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { AccountRoleBadge } from "@/components/account/account-role-badge";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { LogoutButton } from "@/components/marketing/logout-button";
import { SiteHeaderAccountMenu } from "@/components/marketing/site-header-account-menu";
import { SITE_CONTAINER } from "@/config/site-layout";
import type { AppLocale, Messages } from "@/i18n/messages";
import { hasRole, type UserRole } from "@/lib/roles-shared";
import { cn } from "@/lib/utils";

function browseCategoryActive(pathname: string, searchParams: URLSearchParams, href: string) {
  if (!href.startsWith("/browse?")) return pathname === href;
  const u = new URL(href, "https://mint.local");
  const want = u.searchParams.get("category");
  if (!want) return pathname === "/browse" && !searchParams.get("category");
  return pathname === "/browse" && searchParams.get("category") === want;
}

type NavItem = { href: string; label: string };

export function SiteHeaderInner({
  centerSlot,
  locale,
  navItems,
  sellLabel,
  sellHref,
  accountLabels,
  searchAria,
  logIn,
  join,
  account,
}: {
  centerSlot: ReactNode;
  locale: AppLocale;
  navItems: readonly NavItem[];
  sellLabel: string;
  sellHref: string;
  accountLabels: Messages["header"];
  searchAria: string;
  savedAria: string;
  savedHref: string;
  logIn: string;
  join: string;
  account:
  | { fullName: string | null; email: string | null; role: UserRole }
  | "session_no_profile"
  | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerAtPath, setDrawerAtPath] = useState<string | null>(null);
  const drawerVisible = drawerOpen && drawerAtPath === pathname;

  const handleSearchClick = useCallback(() => {
    const el = document.querySelector<HTMLInputElement>("[data-smart-search]");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    } else {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (!drawerVisible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerVisible]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setDrawerAtPath(null);
  };

  const toggleDrawer = () => {
    if (drawerVisible) {
      closeDrawer();
      return;
    }
    setDrawerOpen(true);
    setDrawerAtPath(pathname);
  };

  const role = account && account !== "session_no_profile" ? account.role : null;

  const sellCls =
    "flex h-12 shrink-0 items-center border-l border-[#1e1e1e] bg-[#1a7a4a] px-[18px] text-[10px] font-bold uppercase tracking-[0.09em] text-white transition-colors hover:bg-[#15633c] lg:h-14";

  const drawerLinkCls =
    "text-[12px] font-medium text-[#cccccc] transition-colors hover:text-white";

  return (
    <>
      <div className={cn(SITE_CONTAINER, "flex min-h-12 min-w-0 items-stretch lg:min-h-14")}>
        <div className="flex flex-1 items-stretch">
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center border-r border-border-dark text-[#888888] transition-colors hover:bg-[#1a1a1a] hover:text-white lg:h-14 lg:w-14"
            aria-label={drawerVisible ? "Close menu" : "Open menu"}
            aria-expanded={drawerVisible}
            onClick={toggleDrawer}
          >
            {drawerVisible ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center border-r border-border-dark text-[#888888] transition-colors hover:bg-[#1a1a1a] hover:text-white lg:h-14 lg:w-14"
            aria-label={searchAria}
            onClick={handleSearchClick}
          >
            <Search className="size-4" />
          </button>
          {account && account !== "session_no_profile" ? (
            <Link
              href="/buyer/follows"
              className="hidden items-center gap-1.5 self-center px-4 text-sm font-medium text-white/80 transition-colors hover:text-white lg:flex"
            >
              <Eye className="h-4 w-4" aria-hidden />
              Ακολουθώ
            </Link>
          ) : null}
        </div>

        {centerSlot}

        <div className="flex flex-1 items-stretch justify-end">
          <Link href={sellHref} className={sellCls}>
            {sellLabel}
          </Link>

          <div className="hidden items-stretch border-l border-border-dark lg:flex">
            <div className="flex items-center px-3">
              <LocaleSwitcher locale={locale} variant="dark" />
            </div>
            <div className="flex items-center border-l border-border-dark px-2">
              {account && account !== "session_no_profile" ? (
                <SiteHeaderAccountMenu
                  tone="dark"
                  fullName={account.fullName}
                  email={account.email}
                  role={account.role}
                  labels={accountLabels}
                />
              ) : account === "session_no_profile" ? (
                <LogoutButton className="h-8 rounded-none border border-[#333333] bg-transparent px-3 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-[#1a1a1a]" />
              ) : (
                <div className="flex items-center gap-1">
                  <Link
                    href="/auth/login"
                    className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.09em] text-[#888888] transition-colors hover:text-white"
                  >
                    {logIn}
                  </Link>
                  <Link
                    href="/auth/register"
                    className="rounded-none border border-[#444444] bg-transparent px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.09em] text-white hover:bg-[#1a1a1a]"
                  >
                    {join}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {drawerVisible && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={closeDrawer}
          />

          <div className="absolute left-0 top-0 flex h-full w-[min(100%,22rem)] flex-col bg-[#111111] shadow-2xl">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-border-dark px-4 lg:h-14">
              <span className="text-[1.25rem] font-black tracking-[-0.03em] text-white lg:text-[1.5rem]">
                mint<span className="text-[#1a7a4a]">.</span>
              </span>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center text-[#888888] transition-colors hover:text-white"
                onClick={closeDrawer}
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="border-b border-border-dark px-4 py-3 lg:hidden">
              <LocaleSwitcher locale={locale} variant="dark" />
            </div>

            <nav className="flex flex-col overflow-y-auto border-b border-border-dark py-2" aria-label="Categories">
              {navItems.map((item) => {
                const active = browseCategoryActive(pathname, searchParams, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeDrawer}
                    className={cn(
                      "px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.09em] transition-colors",
                      active
                        ? "bg-mint-tint text-mint"
                        : "text-[#888888] hover:bg-[#1a1a1a] hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex flex-1 flex-col gap-3 p-5">
              {account && account !== "session_no_profile" ? (
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-xs font-semibold text-white">
                      {account.fullName ?? "Account"}
                    </p>
                    {role ? (
                      <AccountRoleBadge
                        role={role}
                        labels={{
                          roleAdmin: accountLabels.roleAdmin,
                          roleSuperAdmin: accountLabels.roleSuperAdmin,
                        }}
                      />
                    ) : null}
                  </div>
                  {account.email ? (
                    <p className="truncate text-[11px] text-[#888888]">{account.email}</p>
                  ) : null}
                  <div className="mt-2 flex flex-col gap-1.5 border-t border-border-dark pt-3">
                    <Link href="/buyer/purchases" onClick={closeDrawer} className={drawerLinkCls}>
                      {accountLabels.accountPurchases}
                    </Link>
                    <Link href="/buyer/follows" onClick={closeDrawer} className={drawerLinkCls}>
                      Ακολουθώ
                    </Link>
                    <Link href="/buyer" onClick={closeDrawer} className={drawerLinkCls}>
                      {accountLabels.accountSettings}
                    </Link>
                    {role && hasRole(role, "seller") ? (
                      <Link href="/seller/listings" onClick={closeDrawer} className={drawerLinkCls}>
                        {accountLabels.accountMyListings}
                      </Link>
                    ) : null}
                    {role && hasRole(role, "admin") ? (
                      <Link href="/admin" onClick={closeDrawer} className={drawerLinkCls}>
                        {accountLabels.accountAdmin}
                      </Link>
                    ) : null}
                    {role === "super_admin" ? (
                      <Link href="/admin/users" onClick={closeDrawer} className={drawerLinkCls}>
                        {accountLabels.accountUsers}
                      </Link>
                    ) : null}
                  </div>
                  <LogoutButton className="mt-3 w-full rounded-none border border-[#333333] bg-transparent text-white hover:bg-[#1a1a1a]" />
                </div>
              ) : account === "session_no_profile" ? (
                <LogoutButton className="w-full rounded-none border border-[#333333] bg-transparent text-white hover:bg-[#1a1a1a]" />
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/auth/login"
                    onClick={closeDrawer}
                    className="border border-[#444444] py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.09em] text-white transition-colors hover:bg-[#1a1a1a]"
                  >
                    {logIn}
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={closeDrawer}
                    className="bg-[#1a7a4a] py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.09em] text-white transition-colors hover:bg-mint-deep"
                  >
                    {join}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
