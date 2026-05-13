"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, X } from "lucide-react";

import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { LogoutButton } from "@/components/marketing/logout-button";
import { SiteHeaderAccountMenu } from "@/components/marketing/site-header-account-menu";
import type { AppLocale } from "@/i18n/messages";
import type { UserRole } from "@/types/domain";
import { cn } from "@/lib/utils";

function browseCategoryActive(pathname: string, searchParams: URLSearchParams, href: string) {
  if (!href.startsWith("/browse?")) {
    return pathname === href;
  }
  const u = new URL(href, "https://mint.local");
  const want = u.searchParams.get("category");
  if (!want) {
    return pathname === "/browse" && !searchParams.get("category");
  }
  return pathname === "/browse" && searchParams.get("category") === want;
}

type NavItem = { href: string; label: string };

export function SiteHeaderInner({
  locale,
  navItems,
  sellLabel,
  searchAria,
  savedAria,
  logIn,
  join,
  account,
}: {
  locale: AppLocale;
  navItems: readonly NavItem[];
  sellLabel: string;
  searchAria: string;
  savedAria: string;
  logIn: string;
  join: string;
  account:
    | { fullName: string | null; email: string | null; role: UserRole }
    | "session_no_profile"
    | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    if (!drawer) {
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawer]);

  const closeDrawer = () => setDrawer(false);

  const iconBtn =
    "flex h-11 w-11 shrink-0 items-center justify-center border-l border-[#1e1e1e] text-[#888888] transition-colors hover:bg-[#1a1a1a] hover:text-white";
  const sellCls =
    "flex h-11 shrink-0 items-center border-l border-[#1e1e1e] bg-[#1a7a4a] px-[18px] text-[10px] font-bold uppercase tracking-[0.09em] text-white transition-colors hover:bg-[#15633c]";

  const role = account && account !== "session_no_profile" ? account.role : null;

  return (
    <>
      <div className="flex min-w-0 flex-1">
        <nav
          className="hidden h-11 min-w-0 flex-1 items-stretch overflow-x-auto lg:flex"
          aria-label="Categories"
        >
        {navItems.map((item) => {
          const active = browseCategoryActive(pathname, searchParams, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 shrink-0 items-center border-r border-[#1e1e1e] px-[14px] text-[10px] font-bold uppercase tracking-[0.09em] text-[#666666] transition-colors",
                active ? "text-white" : "hover:bg-[#1a1a1a] hover:text-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex h-11 shrink-0 items-stretch lg:ml-0">
        <Link href="/browse" aria-label={searchAria} className={cn(iconBtn, "hidden lg:flex")}>
          <Search className="size-[18px]" strokeWidth={1.75} />
        </Link>
        <Link href="/browse" aria-label={savedAria} className={cn(iconBtn, "hidden lg:flex")}>
          <Heart className="size-[18px]" strokeWidth={1.75} />
        </Link>
        <Link href="/sell" className={sellCls}>
          {sellLabel}
        </Link>
        <div className="hidden items-stretch border-l border-[#1e1e1e] lg:flex">
          <div className="flex items-center px-3">
            <LocaleSwitcher locale={locale} variant="dark" />
          </div>
          <div className="flex items-center border-l border-[#1e1e1e] px-2">
            {account && account !== "session_no_profile" ? (
              <SiteHeaderAccountMenu
                tone="dark"
                fullName={account.fullName}
                email={account.email}
                role={account.role}
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

        <button
          type="button"
          className={cn(iconBtn, "lg:hidden")}
          aria-label="Open menu"
          aria-expanded={drawer}
          onClick={() => setDrawer(true)}
        >
          <Menu className="size-5" />
        </button>
      </div>
    </div>

      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={closeDrawer}
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(100%,22rem)] flex-col bg-[#111111] shadow-xl">
            <div className="flex h-11 shrink-0 items-center justify-between border-b border-[#1e1e1e] px-4">
              <span className="text-[15px] font-black tracking-[-0.02em] text-white">
                mint<span className="text-[#1a7a4a]">.</span>
              </span>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center text-[#888888] hover:text-white"
                onClick={closeDrawer}
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="border-b border-[#1e1e1e] px-4 py-3">
              <LocaleSwitcher locale={locale} variant="dark" />
            </div>
            <nav className="flex flex-col overflow-y-auto border-b border-[#1e1e1e] py-2">
              {navItems.map((item) => {
                const active = browseCategoryActive(pathname, searchParams, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeDrawer}
                    className={cn(
                      "px-4 py-3 text-[10px] font-bold uppercase tracking-[0.09em] text-[#888888]",
                      active ? "bg-[#1a7a4a]/20 text-[#1a7a4a]" : "hover:bg-[#1a1a1a] hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex border-b border-[#1e1e1e]">
              <Link
                href="/browse"
                onClick={closeDrawer}
                className="flex h-11 flex-1 items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.09em] text-[#888888] hover:bg-[#1a1a1a] hover:text-white"
              >
                <Search className="size-[18px]" strokeWidth={1.75} />
                {searchAria}
              </Link>
              <Link
                href="/browse"
                onClick={closeDrawer}
                className="flex h-11 flex-1 items-center justify-center gap-2 border-l border-[#1e1e1e] text-[10px] font-bold uppercase tracking-[0.09em] text-[#888888] hover:bg-[#1a1a1a] hover:text-white"
              >
                <Heart className="size-[18px]" strokeWidth={1.75} />
                {savedAria}
              </Link>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
              {account && account !== "session_no_profile" ? (
                <div className="flex flex-col gap-2 text-sm">
                  <p className="truncate text-xs font-medium text-white">{account.fullName ?? "Account"}</p>
                  {account.email ? <p className="truncate text-[11px] text-[#888888]">{account.email}</p> : null}
                  {role === "seller" || role === "admin" ? (
                    <Link href="/seller" onClick={closeDrawer} className="text-[#cccccc] hover:text-white">
                      Seller hub
                    </Link>
                  ) : null}
                  {role === "buyer" || role === "seller" || role === "admin" ? (
                    <Link href="/buyer" onClick={closeDrawer} className="text-[#cccccc] hover:text-white">
                      Purchases
                    </Link>
                  ) : null}
                  {role === "admin" ? (
                    <Link href="/admin" onClick={closeDrawer} className="text-[#cccccc] hover:text-white">
                      Admin
                    </Link>
                  ) : null}
                  <LogoutButton className="mt-2 w-full rounded-none border border-[#333333] bg-transparent text-white hover:bg-[#1a1a1a]" />
                </div>
              ) : account === "session_no_profile" ? (
                <LogoutButton className="w-full rounded-none border border-[#333333] bg-transparent text-white hover:bg-[#1a1a1a]" />
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/auth/login"
                    onClick={closeDrawer}
                    className="border border-[#444444] py-2 text-center text-[10px] font-bold uppercase tracking-[0.09em] text-white hover:bg-[#1a1a1a]"
                  >
                    {logIn}
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={closeDrawer}
                    className="bg-[#1a7a4a] py-2 text-center text-[10px] font-bold uppercase tracking-[0.09em] text-white hover:bg-[#15633c]"
                  >
                    {join}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
