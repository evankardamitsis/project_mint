import Link from "next/link";

import { LogoutButton } from "@/components/marketing/logout-button";
import { Button } from "@/components/ui/button";
import { marketingNav } from "@/config/navigation";
import { getProfile, getSessionUser } from "@/lib/auth/guards";
import { cn } from "@/lib/utils";

export async function SiteHeader({ className }: { className?: string }) {
  const user = await getSessionUser();
  const profile = user ? await getProfile() : null;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            Project Mint
          </Link>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {marketingNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {profile?.role === "seller" ? (
                <Button variant="ghost" size="sm" render={<Link href="/seller" />}>
                  Seller
                </Button>
              ) : null}
              {profile?.role === "buyer" ? (
                <Button variant="ghost" size="sm" render={<Link href="/buyer" />}>
                  Buyer
                </Button>
              ) : null}
              {profile?.role === "admin" ? (
                <Button variant="ghost" size="sm" render={<Link href="/admin" />}>
                  Admin
                </Button>
              ) : null}
              <Button variant="outline" size="sm" render={<Link href="/browse" />}>
                Continue shopping
              </Button>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/auth/login" />}>
                Log in
              </Button>
              <Button size="sm" render={<Link href="/auth/register" />}>
                Register
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
