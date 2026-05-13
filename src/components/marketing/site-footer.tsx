import Link from "next/link";

import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { SITE_CONTAINER } from "@/config/site-layout";
import type { AppLocale, Messages } from "@/i18n/messages";

export function SiteFooter({
  locale,
  messages: m,
}: {
  locale: AppLocale;
  messages: Messages;
}) {
  return (
    <footer className="mt-auto border-t border-border/60 bg-warm-bg py-10">
      <div className={SITE_CONTAINER}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <p className="text-sm font-semibold text-ink">
              mint<span className="text-mint">.</span>
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">{m.footer.tagline}</p>
          </div>
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16 lg:gap-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">{m.footer.company}</p>
              <ul className="mt-3 space-y-2 text-[13px] text-[var(--color-text-secondary)]">
                <li>
                  <Link href="#" className="transition-colors hover:text-ink">
                    {m.footer.about}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-ink">
                    {m.footer.help}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-ink">
                    {m.footer.contact}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">{m.footer.legal}</p>
              <ul className="mt-3 space-y-2 text-[13px] text-[var(--color-text-secondary)]">
                <li>
                  <Link href="#" className="transition-colors hover:text-ink">
                    {m.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-ink">
                    {m.footer.terms}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <LocaleSwitcher locale={locale} languageLabel={m.footer.language} />
      </div>
    </footer>
  );
}
