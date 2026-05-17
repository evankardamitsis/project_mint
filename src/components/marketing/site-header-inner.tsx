"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Menu, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { LogoutButton } from "@/components/marketing/logout-button";
import { SiteHeaderAccountMenu } from "@/components/marketing/site-header-account-menu";
import { SITE_CONTAINER } from "@/config/site-layout";
import type { AppLocale } from "@/i18n/messages";
import type { UserRole } from "@/types/domain";
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
  savedHref,
  logIn,
  join,
  account,
}: {
  centerSlot: ReactNode;
  locale: AppLocale;
  navItems: readonly NavItem[];
  sellLabel: string;
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
  const [drawer, setDrawer] = useState(false);

  const handleSearchClick = useCallback(() => {
    const el = document.querySelector<HTMLInputElement>("[data-home-search]");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    } else {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (!drawer) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [drawer]);

  // Close drawer on route change
  useEffect(() => { setDrawer(false); }, [pathname]);

  const closeDrawer = () => setDrawer(false);

  const role = account && account !== "session_no_profile" ? account.role : null;

  const sellCls =
    "flex h-12 shrink-0 items-center border-l border-[#1e1e1e] bg-[#1a7a4a] px-[18px] text-[10px] font-bold uppercase tracking-[0.09em] text-white transition-colors hover:bg-[#15633c] lg:h-14";

  return (
    <>
      {/* ── Header bar ── */}
      <div className={cn(SITE_CONTAINER, "flex min-h-12 min-w-0 items-stretch lg:min-h-14")}>

        {/* Left: burger + search icon */}
        <div className="flex flex-1 items-stretch">
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center border-r border-[#1e1e1e] text-[#888888] transition-colors hover:bg-[#1a1a1a] hover:text-white lg:h-14 lg:w-14"
            aria-label={drawer ? "Close menu" : "Open menu"}
            aria-expanded={drawer}
            onClick={() => setDrawer((v) => !v)}
          >
            {drawer ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center border-r border-[#1e1e1e] text-[#888888] transition-colors hover:bg-[#1a1a1a] hover:text-white lg:h-14 lg:w-14"
            aria-label="Search"
            onClick={handleSearchClick}
          >
            <Search className="size-4" />
          </button>
        </div>

        {/* Center: logo */}
        {centerSlot}

        {/* Right */}
        <div className="flex flex-1 items-stretch justify-end">
          <Link href="/sell" className={sellCls}>
            {sellLabel}
          </Link>

          {/* Desktop: locale + account */}
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
        </div>
      </div>

      {/* ── Drawer — slides from LEFT, all screen sizes ── */}
      {drawer && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-label="Close menu"
            onClick={closeDrawer}
          />

          {/* Panel */}
          <div className="absolute left-0 top-0 flex h-full w-[min(100%,22rem)] flex-col bg-[#111111] shadow-2xl">

            {/* Drawer header */}
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#1e1e1e] px-4 lg:h-14">
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

            {/* Locale (mobile only — desktop has it in the bar) */}
            <div className="border-b border-[#1e1e1e] px-4 py-3 lg:hidden">
              <LocaleSwitcher locale={locale} variant="dark" />
            </div>

            {/* Nav items */}
            <nav className="flex flex-col overflow-y-auto border-b border-[#1e1e1e] py-2" aria-label="Κατηγορίες">
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
                        ? "bg-[#1a7a4a]/20 text-[#1a7a4a]"
                        : "text-[#888888] hover:bg-[#1a1a1a] hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Account section */}
            <div className="flex flex-1 flex-col gap-3 p-5">
              {account && account !== "session_no_profile" ? (
                <div className="flex flex-col gap-2 text-sm">
                  <p className="truncate text-xs font-semibold text-white">
                    {account.fullName ?? "Account"}
                  </p>
                  {account.email && (
                    <p className="truncate text-[11px] text-[#888888]">{account.email}</p>
                  )}
                  <div className="mt-2 flex flex-col gap-1.5 border-t border-[#1e1e1e] pt-3">
                    {(role === "seller" || role === "admin") && (
                      <Link
                        href="/seller"
                        onClick={closeDrawer}
                        className="text-[12px] font-medium text-[#cccccc] transition-colors hover:text-white"
                      >
                        Seller hub
                      </Link>
                    )}
                    {(role === "buyer" || role === "seller" || role === "admin") && (
                      <Link
                        href="/buyer"
                        onClick={closeDrawer}
                        className="text-[12px] font-medium text-[#cccccc] transition-colors hover:text-white"
                      >
                        Purchases
                      </Link>
                    )}
                    {role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={closeDrawer}
                        className="text-[12px] font-medium text-[#cccccc] transition-colors hover:text-white"
                      >
                        Admin
                      </Link>
                    )}
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
                    className="bg-[#1a7a4a] py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.09em] text-white transition-colors hover:bg-[#15633c]"
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
