import Link from "next/link";

import { SITE_CONTAINER } from "@/config/site-layout";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-warm-bg py-10">
      <div className={SITE_CONTAINER}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <p className="text-sm font-semibold text-ink">
              mint<span className="text-mint">.</span>
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              Music gear & collectibles — buy and sell with confidence.
            </p>
          </div>
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16 lg:gap-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">Company</p>
              <ul className="mt-3 space-y-2 text-[13px] text-[var(--color-text-secondary)]">
                <li>
                  <Link href="#" className="transition-colors hover:text-ink">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-ink">
                    Help & FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-ink">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">Legal</p>
              <ul className="mt-3 space-y-2 text-[13px] text-[var(--color-text-secondary)]">
                <li>
                  <Link href="#" className="transition-colors hover:text-ink">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="transition-colors hover:text-ink">
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
