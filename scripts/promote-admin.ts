/**
 * Promote an existing auth user to platform admin (`profiles.role = 'admin'`).
 *
 * In Project Mint, `admin` is the highest role: admin layout, `is_admin()` RLS, moderation tools.
 * There is no separate `super_admin` enum value.
 *
 * Requires service role (same as demo seed) so the profiles role-change trigger allows the update.
 *
 * Usage:
 *   npm run promote:admin -- you@example.com
 *
 * Env (from process or `.env` / `.env.local`):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SECRET_KEY  (or SUPABASE_SERVICE_ROLE_KEY)
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createDemoSupabaseAdmin } from "./demo-supabase-admin-client";

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

function parseArg(): string {
  const raw = process.argv.slice(2).find((a) => !a.startsWith("-"));
  if (!raw?.trim()) {
    console.error("Usage: npm run promote:admin -- <email>");
    process.exit(1);
  }
  return raw.trim();
}

async function main(): Promise<void> {
  loadEnvFromFiles();
  const identifier = parseArg();

  const url = getUrl();
  const serviceKey = getServiceKey();
  const admin = createDemoSupabaseAdmin(url, serviceKey);

  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);

  const { data: row, error: selErr } = await admin
    .from("profiles")
    .select("id, email, full_name, role")
    .eq(isUuid ? "id" : "email", identifier)
    .maybeSingle();

  if (selErr) {
    console.error("[promote-admin] select failed:", selErr.message);
    process.exit(1);
  }
  if (!row) {
    console.error(`[promote-admin] No profile found for ${isUuid ? "id" : "email"}: ${identifier}`);
    process.exit(1);
  }

  const id = row.id as string;
  const prevRole = row.role as string;
  if (prevRole === "admin") {
    console.log(`Already admin: ${row.email} (${id})`);
    return;
  }

  const { error: upErr } = await admin.from("profiles").update({ role: "admin" }).eq("id", id);
  if (upErr) {
    console.error("[promote-admin] update failed:", upErr.message);
    process.exit(1);
  }

  console.log(`Promoted to admin: ${row.email} (${row.full_name || "no name"})`);
  console.log(`  id: ${id}`);
  console.log(`  role: ${prevRole} → admin`);
  console.log("Open /admin after signing in (refresh the app if you are already logged in).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
