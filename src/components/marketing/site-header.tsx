import Link from "next/link";
import { Heart, Search } from "lucide-react";

import { SiteHeaderAccountMenu } from "@/components/marketing/site-header-account-menu";
import { LogoutButton } from "@/components/marketing/logout-button";
import { Button } from "@/components/ui/button";
import { SITE_CONTAINER } from "@/config/site-layout";
import { getProfile, getSessionUser } from "@/lib/auth/guards";
import { cn } from "@/lib/utils";

const browseCategoryLinks = [
  { href: "/browse?category=electric-guitars", label: "Electric Guitars" },
  { href: "/browse?category=synths-keyboards", label: "Synths & Keyboards" },
  { href: "/browse?category=effects-pedals", label: "Effects & Pedals" },
  { href: "/browse?category=pro-audio", label: "Pro Audio" },
] as const;

export async function SiteHeader({ className }: { className?: string }) {
  const user = await getSessionUser();
  const profile = user ? await getProfile() : null;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-white",
        className,
      )}
    >
      <div className={cn(SITE_CONTAINER, "flex min-h-14 w-full items-center justify-between gap-3 py-3")}>
        <div className="flex min-w-0 flex-1 items-center gap-6 lg:gap-8">
          <Link href="/" className="shrink-0 text-lg font-bold tracking-tight text-ink">
            mint<span className="text-mint">.</span>
          </Link>
          <nav className="ml-2 hidden min-w-0 items-center gap-6 text-sm font-medium text-[#6B6B6B] lg:flex lg:ml-8">
            {browseCategoryLinks.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-[#111111]">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="icon-sm" className="text-ink-2 hover:text-ink" render={<Link href="/browse" aria-label="Search" />}>
            <Search className="size-5" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-ink-2 hover:text-ink" render={<Link href="/browse" aria-label="Saved" />}>
            <Heart className="size-5" />
          </Button>
          <Button size="sm" className="rounded-full bg-mint px-4 font-semibold text-white hover:bg-mint/90" render={<Link href="/sell" />}>
            Sell
          </Button>
          {user && profile ? (
            <SiteHeaderAccountMenu fullName={profile.full_name} email={profile.email ?? user.email ?? null} role={profile.role} />
          ) : user ? (
            <LogoutButton />
          ) : (
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" className="text-ink-2 hover:text-ink" render={<Link href="/auth/login" />}>
                Log in
              </Button>
              <Button size="sm" className="rounded-full bg-ink px-4 font-semibold text-white hover:bg-ink/90" render={<Link href="/auth/register" />}>
                Join
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
