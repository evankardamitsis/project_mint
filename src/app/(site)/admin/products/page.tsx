import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { count, error } = await supabase.from("products").select("*", { count: "exact", head: true });

  if (error) {
    console.error("[admin/products] count", error.message);
  }

  const n = count ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Product catalog"
        description="Curated templates power the seller listing wizard. Full admin CRUD is planned; counts reflect seeded templates today."
      />
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Templates in database: <span className="font-semibold text-foreground">{n}</span>
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Sellers pick matches on <strong className="text-foreground">New listing</strong>; buyers never edit this
          data. Manage rows via SQL migrations or Supabase Studio until an editor ships here.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" render={<Link href="/admin" />}>
            Back to admin
          </Button>
          <Button variant="outline" render={<Link href="/seller/listings/new" />}>
            Open listing wizard
          </Button>
        </div>
      </div>
    </div>
  );
}
