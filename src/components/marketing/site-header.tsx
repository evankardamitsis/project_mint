import Link from "next/link";
import { Suspense } from "react";

import { SiteHeaderInner } from "@/components/marketing/site-header-inner";
import { getProfile, getSessionUser } from "@/lib/auth/guards";
import type { AppLocale, Messages } from "@/i18n/messages";
import { cn } from "@/lib/utils";

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
      ? { fullName: profile.full_name, email: profile.email ?? user.email ?? null, role: profile.role }
      : user
        ? ("session_no_profile" as const)
        : null;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-11 w-full items-stretch border-b-[3px] border-[#1a7a4a] bg-[#111111]",
        className,
      )}
    >
      <div className="mx-auto flex h-11 w-full min-w-0 flex-1 items-stretch">
        <Link
          href="/"
          className="flex h-11 shrink-0 items-center border-r border-[#1e1e1e] px-5 text-[15px] font-black tracking-[-0.02em] text-white"
        >
          mint<span className="text-[#1a7a4a]">.</span>
        </Link>
        <Suspense fallback={<div className="min-w-0 flex-1 bg-[#111111]" aria-hidden />}>
          <SiteHeaderInner
            locale={locale}
            navItems={browseCategoryLinks}
            sellLabel={m.header.sell}
            searchAria={m.header.searchAria}
            savedAria={m.header.savedAria}
            logIn={m.header.logIn}
            join={m.header.join}
            account={account}
          />
        </Suspense>
      </div>
    </header>
  );
}
