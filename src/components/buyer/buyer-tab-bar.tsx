"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export type BuyerTabLabels = {
  overview: string;
  purchases: string;
  offers: string;
  follows: string;
  alerts: string;
};

function isTabActive(pathname: string, href: string): boolean {
  if (href === "/buyer") {
    return pathname === "/buyer";
  }
  if (pathname === href) {
    return true;
  }
  return pathname.startsWith(`${href}/`);
}

export function BuyerTabBar({ labels }: { labels: BuyerTabLabels }) {
  const pathname = usePathname();

  const tabs = [
    { label: labels.overview, href: "/buyer" },
    { label: labels.purchases, href: "/buyer/purchases" },
    { label: labels.offers, href: "/buyer/offers" },
    { label: labels.follows, href: "/buyer/follows" },
    { label: labels.alerts, href: "/buyer/alerts" },
  ];

  return (
    <div className="sticky top-12 z-40 border-b border-[#EEECE8] bg-white lg:top-14">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <nav className="flex items-center gap-0 overflow-x-auto [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            const active = isTabActive(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "border-b-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "border-[#111111] text-[#111111]"
                    : "border-transparent text-[#6B6B6B] hover:text-[#111111]",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
