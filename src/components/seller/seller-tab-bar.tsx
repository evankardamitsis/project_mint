"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { label: "Αγγελίες", href: "/seller/listings" },
  { label: "Νέα αγγελία", href: "/seller/listings/new" },
  { label: "Παραγγελίες", href: "/seller/orders" },
  { label: "Προσφορές", href: "/seller/offers" },
  { label: "Προφίλ", href: "/seller/profile" },
] as const;

function isTabActive(pathname: string, href: string): boolean {
  if (href === "/seller/listings/new") {
    return pathname === "/seller/listings/new";
  }
  if (href === "/seller/listings") {
    return (
      pathname === "/seller/listings" ||
      (pathname.startsWith("/seller/listings/") && !pathname.startsWith("/seller/listings/new"))
    );
  }
  if (pathname === href) {
    return true;
  }
  return pathname.startsWith(`${href}/`);
}

export function SellerTabBar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-12 z-40 border-b border-[#EEECE8] bg-white lg:top-14">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <nav className="flex items-center gap-0 overflow-x-auto [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
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
