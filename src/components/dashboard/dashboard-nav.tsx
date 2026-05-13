"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const hubExact = new Set(["/seller", "/buyer", "/admin"]);

function isActive(pathname: string, href: string) {
  if (pathname === href) {
    return true;
  }
  if (hubExact.has(href)) {
    return false;
  }
  return pathname.startsWith(`${href}/`);
}

export function DashboardNav({
  items,
}: {
  items: readonly { href: string; label: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-0.5">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "border-l-2 py-2.5 pl-3 pr-3 text-sm transition-colors lg:pl-3",
              active
                ? "border-l-[#1a7a4a] bg-[#1a7a4a]/10 font-medium text-ink"
                : "border-l-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
