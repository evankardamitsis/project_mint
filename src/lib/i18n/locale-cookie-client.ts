/** Client-only: sets the locale preference cookie (read by middleware / `getLocale`). */
export function writeMintLocaleCookie(locale: string): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `mint_locale=${encodeURIComponent(locale)};Path=/;Max-Age=31536000;SameSite=Lax`;
}
