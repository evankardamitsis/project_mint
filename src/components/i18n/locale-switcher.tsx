"use client";

import { useRouter } from "next/navigation";

import type { AppLocale } from "@/i18n/messages";
import { cn } from "@/lib/utils";

const COOKIE = "mint_locale";

export function LocaleSwitcher({
  locale,
  languageLabel,
}: {
  locale: AppLocale;
  languageLabel: string;
}) {
  const router = useRouter();

  function pick(next: AppLocale) {
    if (next === locale) {
      return;
    }
    document.cookie = `${COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 border-t border-border/60 pt-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">{languageLabel}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => pick("en")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            locale === "en" ? "bg-ink text-white" : "border border-border bg-surface text-ink-2 hover:bg-muted/50",
          )}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => pick("el")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
            locale === "el" ? "bg-ink text-white" : "border border-border bg-surface text-ink-2 hover:bg-muted/50",
          )}
        >
          Ελληνικά
        </button>
      </div>
    </div>
  );
}
