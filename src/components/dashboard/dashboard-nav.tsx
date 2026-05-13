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
    <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-xl px-3 py-2 text-sm transition-colors",
              active
                ? "border border-mint/30 bg-mint/10 font-medium text-mint-muted"
                : "border border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/40 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
