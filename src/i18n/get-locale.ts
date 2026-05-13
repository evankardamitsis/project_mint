import { cookies } from "next/headers";

import type { AppLocale } from "@/i18n/messages";

const COOKIE = "mint_locale";

export async function getLocale(): Promise<AppLocale> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (raw === "el") {
    return "el";
  }
  return "en";
}
