import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ListingNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="text-lg font-semibold tracking-tight">Listing not found</h1>
      <p className="text-sm text-muted-foreground">
        This listing does not exist or is not visible with your current account.
      </p>
      <Button render={<Link href="/browse" />}>Back to browse</Button>
    </div>
  );
}
