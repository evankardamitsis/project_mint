"use client";

import { useRouter } from "next/navigation";

import type { AppLocale } from "@/i18n/messages";
import { writeMintLocaleCookie } from "@/lib/i18n/locale-cookie-client";
import { cn } from "@/lib/utils";

const OPTIONS: { locale: AppLocale; countryCode: string; ariaLabel: string }[] = [
  { locale: "en", countryCode: "US", ariaLabel: "English (US)" },
  { locale: "el", countryCode: "GR", ariaLabel: "Greek (Greece)" },
];

export function LocaleSwitcher({
  locale,
  variant = "light",
}: {
  locale: AppLocale;
  variant?: "light" | "dark";
}) {
  const router = useRouter();

  function pick(next: AppLocale) {
    if (next === locale) {
      return;
    }
    writeMintLocaleCookie(next);
    router.refresh();
  }

  const isDark = variant === "dark";

  return (
    <div
      className={cn(
        "inline-flex p-0.5",
        isDark ? "border border-[#1e1e1e] bg-[#111111]" : "rounded-md border-[0.5px] border-[#ddd] bg-white",
      )}
      role="group"
      aria-label="Site language"
    >
      {OPTIONS.map(({ locale: l, countryCode, ariaLabel }) => (
        <button
          key={l}
          type="button"
          onClick={() => pick(l)}
          aria-label={ariaLabel}
          aria-pressed={locale === l}
          className={cn(
            "min-w-8 px-2 py-1 text-[11px] font-semibold tracking-wide transition-colors",
            isDark
              ? locale === l
                ? "bg-[#1a1a1a] text-white"
                : "text-[#888888] hover:bg-[#1a1a1a] hover:text-white"
              : locale === l
                ? "rounded-[4px] bg-[#111] text-white"
                : "rounded-[4px] text-[#444] hover:bg-[#f5f5f5]",
          )}
        >
          {countryCode}
        </button>
      ))}
    </div>
  );
}
