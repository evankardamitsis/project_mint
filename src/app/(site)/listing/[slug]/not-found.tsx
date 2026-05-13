import Link from "next/link";
import { IconMoodSad } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

export default function ListingNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <IconMoodSad className="size-10 text-[var(--color-text-tertiary)]" stroke={1.5} aria-hidden />
      <h1 className="text-lg font-semibold tracking-tight">Listing not found</h1>
      <p className="text-sm text-muted-foreground">
        This listing may have been sold or is no longer available.
      </p>
      <Button render={<Link href="/browse" />}>Back to browse</Button>
      <Link href="/browse" className="text-sm font-semibold text-mint underline-offset-4 hover:underline">
        Browse similar gear →
      </Link>
    </div>
  );
}
