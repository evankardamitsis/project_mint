/**
 * Dev-only: removes demo listings seeded by scripts/seed-demo-listings.ts
 * (slug prefix demo-pm-). Deletes dependent orders first (FK restrict).
 *
 * ⚠️  Do NOT run against production.
 *
 * Env (required):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SECRET_KEY  (or SUPABASE_SERVICE_ROLE_KEY)
 *
 * Env files (optional, merged if process.env is unset): .env then .env.local
 *
 * Run: npm run seed:demo:clear
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { createDemoSupabaseAdmin } from "./demo-supabase-admin-client";
import { removeListingImageObjects } from "./demo-seed-listing-images";

const DEMO_SLUG_PREFIX = "demo-pm-";
const DEMO_SLUG_LIKE = `${DEMO_SLUG_PREFIX}%`;

function loadEnvFromFiles(): void {
  for (const name of [".env", ".env.local"] as const) {
    const p = resolve(process.cwd(), name);
    if (!existsSync(p)) {
      continue;
    }
    const txt = readFileSync(p, "utf8");
    for (const line of txt.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      const eq = trimmed.indexOf("=");
      if (eq === -1) {
        continue;
      }
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

function getUrl(): string {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!u) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  return u;
}

function getServiceKey(): string {
  const k =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!k) {
    throw new Error("Missing SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)");
  }
  return k;
}

async function main(): Promise<void> {
  loadEnvFromFiles();

  console.log("\n⚠️  WARNING: Demo clear should not be run against production.\n");

  const admin = createDemoSupabaseAdmin(getUrl(), getServiceKey());

  const { data: listings, error: lErr } = await admin
    .from("listings")
    .select("id, slug")
    .like("slug", DEMO_SLUG_LIKE);

  if (lErr) {
    throw new Error(`listings select: ${lErr.message}`);
  }

  const rows = (listings ?? []) as { id: string; slug: string }[];
  if (rows.length === 0) {
    console.log("No demo listings found (slug like demo-pm-%). Nothing to delete.\n");
    return;
  }

  const ids = rows.map((r) => r.id);

  const { data: orderRows, error: oSelErr } = await admin.from("orders").select("id").in("listing_id", ids);
  if (oSelErr) {
    throw new Error(`orders select: ${oSelErr.message}`);
  }
  const orderIds = ((orderRows ?? []) as { id: string }[]).map((o) => o.id);

  let ordersDeleted = 0;
  if (orderIds.length > 0) {
    const { error: oDelErr, count } = await admin.from("orders").delete({ count: "exact" }).in("id", orderIds);
    if (oDelErr) {
      throw new Error(`orders delete: ${oDelErr.message}`);
    }
    ordersDeleted = count ?? orderIds.length;
  }

  const { removed: storageRemoved, warnings: storageWarnings } = await removeListingImageObjects(admin, ids);
  for (const w of storageWarnings) {
    console.warn(`  storage: ${w}`);
  }

  const { error: delErr, count: listingCount } = await admin.from("listings").delete({ count: "exact" }).in("id", ids);
  if (delErr) {
    throw new Error(`listings delete: ${delErr.message}`);
  }

  console.log("--- Demo clear summary ---");
  console.log(`Demo listings matched: ${rows.length}`);
  console.log(`Orders deleted (for those listings): ${ordersDeleted}`);
  console.log(`Storage objects removed (listing-images/{id}/…): ${storageRemoved}`);
  console.log(`Listings deleted: ${listingCount ?? rows.length} (listing_images DB rows cascade)`);
  console.log("Done.\n");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
