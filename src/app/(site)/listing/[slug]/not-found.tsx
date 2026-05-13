import Link from "next/link";
import { IconMoodSad } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { getLocale } from "@/i18n/get-locale";
import { MESSAGES } from "@/i18n/messages";

export default async function ListingNotFound() {
  const locale = await getLocale();
  const n = MESSAGES[locale].listingNotFound;

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <IconMoodSad className="size-10 text-(--color-text-tertiary)" stroke={1.5} aria-hidden />
      <h1 className="text-lg font-semibold tracking-tight">{n.title}</h1>
      <p className="text-sm text-muted-foreground">{n.body}</p>
      <Button render={<Link href="/browse" />}>{n.back}</Button>
      <Link href="/browse" className="text-sm font-semibold text-mint underline-offset-4 hover:underline">
        {n.similar}
      </Link>
    </div>
  );
}
