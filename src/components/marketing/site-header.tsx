import Link from "next/link";
import { Suspense } from "react";

import { SiteHeaderInner } from "@/components/marketing/site-header-inner";
import { getProfile, getSessionUser } from "@/lib/auth/guards";
import type { AppLocale, Messages } from "@/i18n/messages";
import { hasRole } from "@/lib/roles";
import type { UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

function sellHrefFor(role: UserRole | null, loggedIn: boolean): string {
  if (!loggedIn) {
    return "/auth/login?next=/sell";
  }
  if (!role || role === "user") {
    return "/sell";
  }
  if (hasRole(role, "seller")) {
    return "/seller/listings";
  }
  return "/sell";
}

export async function SiteHeader({
  className,
  locale,
  messages: m,
}: {
  className?: string;
  locale: AppLocale;
  messages: Messages;
}) {
  const user = await getSessionUser();
  const profile = user ? await getProfile() : null;

  const browseCategoryLinks = [
    { href: "/browse?category=electric-guitars", label: m.nav.electricGuitars },
    { href: "/browse?category=synths-keyboards", label: m.nav.synthsKeyboards },
    { href: "/browse?category=effects-pedals", label: m.nav.effectsPedals },
    { href: "/browse?category=pro-audio", label: m.nav.proAudio },
  ] as const;

  const account =
    user && profile
      ? { fullName: profile.full_name, email: profile.email ?? user.email ?? null, role: profile.role as UserRole }
      : user
        ? ("session_no_profile" as const)
        : null;

  const sellHref = sellHrefFor(
    account && account !== "session_no_profile" ? account.role : null,
    Boolean(user),
  );

  const savedHref =
    account && account !== "session_no_profile"
      ? "/buyer/follows"
      : `/auth/login?next=${encodeURIComponent("/buyer/follows")}`;

  const logo = (
    <Link
      href="/"
      className="flex shrink-0 items-center px-4 text-[1.25rem] font-black tracking-[-0.04em] text-white sm:px-6 sm:text-[1.4rem] lg:text-[1.85rem] lg:leading-none"
    >
      mint<span className="text-[#1a7a4a]">.</span>
    </Link>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex min-h-12 w-full items-stretch border-b-[3px] border-[#1a7a4a] bg-[#111111] lg:min-h-14",
        className,
      )}
    >
      <Suspense fallback={<div className="min-h-12 w-full bg-[#111111]" aria-hidden />}>
        <SiteHeaderInner
          centerSlot={logo}
          locale={locale}
          navItems={browseCategoryLinks}
          sellLabel={m.header.sell}
          sellHref={sellHref}
          accountLabels={m.header}
          searchAria={m.header.searchAria}
          savedAria={m.header.savedAria}
          savedHref={savedHref}
          logIn={m.header.logIn}
          join={m.header.join}
          account={account}
        />
      </Suspense>
    </header>
  );
}
