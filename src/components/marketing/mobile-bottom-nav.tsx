"use client";

import { Eye, Home, Search, Tag, User } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  exact: boolean;
  accent?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Αρχική", Icon: Home, exact: true },
  { href: "/browse", label: "Αναζήτηση", Icon: Search, exact: false },
  { href: "/sell", label: "Πούλησε", Icon: Tag, exact: false, accent: true },
  { href: "/buyer/follows", label: "Ακολουθώ", Icon: Eye, exact: false },
  { href: "/buyer", label: "Λογαριασμός", Icon: User, exact: true },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Spacer so content isn't hidden behind the nav */}
      <div className="h-[calc(56px+env(safe-area-inset-bottom,0px))] lg:hidden" aria-hidden />

      <nav
        aria-label="Κύρια πλοήγηση"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#EEECE8] bg-white lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="grid h-14 grid-cols-5">
          {NAV_ITEMS.map(({ href, label, Icon, exact, accent }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);

            if (accent) {
              return (
                <Link
                  key={href}
                  href={href}
                  aria-label={label}
                  className="flex flex-col items-center justify-center gap-0.5"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D9E75]">
                    <Icon className="h-4 w-4 text-white" strokeWidth={2} />
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wide text-[#1D9E75]">
                    {label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 transition-colors",
                  isActive ? "text-[#1D9E75]" : "text-[#999999] hover:text-[#444444]",
                )}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                <span className="text-[9px] font-semibold uppercase tracking-wide">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
