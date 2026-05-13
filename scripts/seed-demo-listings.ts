/**
 * Dev-only demo seed for Project Mint listings.
 *
 * ⚠️  Do NOT run against production databases.
 *
 * Env (required):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SECRET_KEY  (or SUPABASE_SERVICE_ROLE_KEY — same value)
 *
 * Env files (optional, merged if process.env is unset): .env then .env.local
 *
 * Optional:
 *   DEMO_SELLER_USER_IDS — comma-separated UUIDs of existing auth users to use as the 3 sellers (skips auth user creation).
 *   DEMO_SEED_PASSWORD — password for newly created demo auth users (default: DemoSeed-Local-Only-2026!)
 *   DEMO_SEED_SKIP_REMOTE_IMAGES=1 — skip network; keep /demo/listings/*.svg URLs only (no Storage upload).
 *
 * Run: npm run seed:demo
 *
 * Database: role updates use the service role key; apply migration
 * `20250512200001_profile_role_change_allow_service_role.sql` (or `supabase db push`)
 * so the profiles trigger allows service_role (see enforce_profile_role_change).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { createDemoSupabaseAdmin } from "./demo-supabase-admin-client";
import {
  localSvgListingImagePath,
  prefetchDemoListingRasters,
  uploadDemoListingPrimaryPhoto,
  type RasterPayload,
} from "./demo-seed-listing-images";

const DEMO_SLUG_PREFIX = "demo-pm-";
const DEMO_MARKER = "[Demo seed — delete with npm run seed:demo:clear]";

const SELLERS = [
  {
    email: "demo.seller1@projectmint.local",
    displayName: "Athens Vintage Gear",
    location: "Athens, Greece",
  },
  {
    email: "demo.seller2@projectmint.local",
    displayName: "Studio Second Life",
    location: "Thessaloniki, Greece",
  },
  {
    email: "demo.seller3@projectmint.local",
    displayName: "Pedal Room Athens",
    location: "Patras, Greece",
  },
] as const;

const EXTRA_BRANDS: { name: string; slug: string }[] = [
  { name: "Strymon", slug: "strymon" },
  { name: "Electro-Harmonix", slug: "electro-harmonix" },
  { name: "Chase Bliss", slug: "chase-bliss" },
  { name: "Shure", slug: "shure" },
  { name: "Universal Audio", slug: "universal-audio" },
  { name: "Pioneer", slug: "pioneer" },
  { name: "Technics", slug: "technics" },
  { name: "Analog Cases", slug: "analog-cases" },
  { name: "Vox", slug: "vox" },
  { name: "Marshall", slug: "marshall" },
  { name: "Neumann", slug: "neumann" },
  { name: "PRS", slug: "prs" },
  { name: "Nord", slug: "nord" },
  { name: "Audio-Technica", slug: "audio-technica" },
  { name: "Focusrite", slug: "focusrite" },
];

type ListingStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "reserved"
  | "sold"
  | "rejected"
  | "archived";
type Condition = "brand_new" | "mint" | "excellent" | "very_good" | "good" | "fair" | "poor" | "non_functioning";

type DemoListing = {
  slug: string;
  title: string;
  body: string;
  categorySlug: string;
  brandSlug: string | null;
  condition: Condition;
  price_cents: number;
  location: string;
  offers_enabled: boolean;
  protected_delivery_enabled: boolean;
  status: ListingStatus;
  rejection_reason?: string | null;
  image: "guitar" | "synth" | "pedal" | "amp" | "mic" | "dj" | "case";
};

function localDemoSvgPath(key: DemoListing["image"]): string {
  return localSvgListingImagePath(key);
}

const DEMO_LISTINGS: DemoListing[] = [
  {
    slug: `${DEMO_SLUG_PREFIX}fender-strat-62-reissue`,
    title: "Fender Stratocaster ’62 Reissue",
    body: `Classic American Strat tone. Light fret wear, electronics original. Ships in hard case.\n\n${DEMO_MARKER}`,
    categorySlug: "electric-guitars",
    brandSlug: "fender",
    condition: "excellent",
    price_cents: 189900,
    location: "Athens, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "active",
    image: "guitar",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}gibson-les-paul-studio`,
    title: "Gibson Les Paul Studio",
    body: `Weight-relieved studio model. Fresh setup, no breaks or repairs.\n\n${DEMO_MARKER}`,
    categorySlug: "electric-guitars",
    brandSlug: "gibson",
    condition: "very_good",
    price_cents: 92000,
    location: "Thessaloniki, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "active",
    image: "guitar",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}ibanez-rg-prestige`,
    title: "Ibanez RG Prestige",
    body: `Japanese-made RG. Fast neck, stock pickups. Case included.\n\n${DEMO_MARKER}`,
    categorySlug: "electric-guitars",
    brandSlug: "ibanez",
    condition: "mint",
    price_cents: 145000,
    location: "Patras, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "active",
    image: "guitar",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}roland-sh-101`,
    title: "Roland SH-101",
    body: `Vintage monosynth. Serviced caps, stable tuning. Minor keybed yellowing only.\n\n${DEMO_MARKER}`,
    categorySlug: "synths-keyboards",
    brandSlug: "roland",
    condition: "good",
    price_cents: 165000,
    location: "Athens, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "active",
    image: "synth",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}korg-minilogue-xd`,
    title: "Korg Minilogue XD",
    body: `Digital multi-engine + analog voices. Original box and PSU.\n\n${DEMO_MARKER}`,
    categorySlug: "synths-keyboards",
    brandSlug: "korg",
    condition: "excellent",
    price_cents: 52000,
    location: "Thessaloniki, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "active",
    image: "synth",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}moog-subsequent-37`,
    title: "Moog Subsequent 37",
    body: `Two-note paraphonic Moog. Light home use only.\n\n${DEMO_MARKER}`,
    categorySlug: "synths-keyboards",
    brandSlug: "moog",
    condition: "mint",
    price_cents: 178000,
    location: "Athens, Greece",
    offers_enabled: false,
    protected_delivery_enabled: true,
    status: "reserved",
    image: "synth",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}yamaha-dx7`,
    title: "Yamaha DX7",
    body: `Classic FM. Battery replaced, factory banks loaded.\n\n${DEMO_MARKER}`,
    categorySlug: "synths-keyboards",
    brandSlug: "yamaha",
    condition: "fair",
    price_cents: 48000,
    location: "Patras, Greece",
    offers_enabled: true,
    protected_delivery_enabled: false,
    status: "active",
    image: "synth",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}boss-ce-2`,
    title: "Boss CE-2 Chorus",
    body: `Green label MIJ. Velcro on back, works perfectly.\n\n${DEMO_MARKER}`,
    categorySlug: "effects-pedals",
    brandSlug: "boss",
    condition: "fair",
    price_cents: 18500,
    location: "Athens, Greece",
    offers_enabled: true,
    protected_delivery_enabled: false,
    status: "active",
    image: "pedal",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}ehx-big-muff`,
    title: "Electro-Harmonix Big Muff Pi",
    body: `NYC reissue. Box included, barely used.\n\n${DEMO_MARKER}`,
    categorySlug: "effects-pedals",
    brandSlug: "electro-harmonix",
    condition: "very_good",
    price_cents: 8900,
    location: "Thessaloniki, Greece",
    offers_enabled: true,
    protected_delivery_enabled: false,
    status: "pending_review",
    image: "pedal",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}strymon-timeline`,
    title: "Strymon Timeline",
    body: `Flagship delay. Latest firmware, includes power supply.\n\n${DEMO_MARKER}`,
    categorySlug: "effects-pedals",
    brandSlug: "strymon",
    condition: "excellent",
    price_cents: 38500,
    location: "Athens, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "pending_review",
    image: "pedal",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}chase-bliss-mood`,
    title: "Chase Bliss Mood",
    body: `Granular + delay playground. Dip switches documented.\n\n${DEMO_MARKER}`,
    categorySlug: "effects-pedals",
    brandSlug: "chase-bliss",
    condition: "mint",
    price_cents: 42000,
    location: "Patras, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "active",
    image: "pedal",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}fender-blues-junior`,
    title: "Fender Blues Junior IV",
    body: `Warm tube combo. Jensen speaker upgrade.\n\n${DEMO_MARKER}`,
    categorySlug: "amps",
    brandSlug: "fender",
    condition: "very_good",
    price_cents: 49500,
    location: "Athens, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "active",
    image: "amp",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}vox-ac15`,
    title: "Vox AC15C1",
    body: `British chime. Stock tubes with spare set included.\n\n${DEMO_MARKER}`,
    categorySlug: "amps",
    brandSlug: "vox",
    condition: "excellent",
    price_cents: 62000,
    location: "Thessaloniki, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "active",
    image: "amp",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}marshall-dsl40`,
    title: "Marshall DSL40CR",
    body: `Two-channel combo. Gigged lightly, footswitch included.\n\n${DEMO_MARKER}`,
    categorySlug: "amps",
    brandSlug: "marshall",
    condition: "good",
    price_cents: 55000,
    location: "Patras, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "sold",
    image: "amp",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}neumann-u87`,
    title: "Neumann U87 Ai",
    body: `Large-diaphragm studio standard. Demo listing for rejected flow.\n\n${DEMO_MARKER}`,
    categorySlug: "pro-audio",
    brandSlug: "neumann",
    condition: "mint",
    price_cents: 289000,
    location: "Athens, Greece",
    offers_enabled: false,
    protected_delivery_enabled: true,
    status: "rejected",
    rejection_reason: "Demo seed: simulated moderation rejection (serial photos unclear).",
    image: "mic",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}shure-sm7b`,
    title: "Shure SM7B",
    body: `Broadcast dynamic. Demo archived inventory.\n\n${DEMO_MARKER}`,
    categorySlug: "pro-audio",
    brandSlug: "shure",
    condition: "excellent",
    price_cents: 38900,
    location: "Thessaloniki, Greece",
    offers_enabled: true,
    protected_delivery_enabled: false,
    status: "archived",
    image: "mic",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}ua-apollo-twin`,
    title: "Universal Audio Apollo Twin X Duo",
    body: `Thunderbolt interface. Demo reserved state.\n\n${DEMO_MARKER}`,
    categorySlug: "pro-audio",
    brandSlug: "universal-audio",
    condition: "very_good",
    price_cents: 112000,
    location: "Athens, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "reserved",
    image: "mic",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}technics-sl1200mk2`,
    title: "Technics SL-1200MK2",
    body: `DJ classic. Pitch stable, tonearm serviced.\n\n${DEMO_MARKER}`,
    categorySlug: "dj-gear",
    brandSlug: "technics",
    condition: "good",
    price_cents: 98000,
    location: "Patras, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "active",
    image: "dj",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}pioneer-djm750`,
    title: "Pioneer DJM-750MK2",
    body: `Four-channel mixer. All faders smooth.\n\n${DEMO_MARKER}`,
    categorySlug: "dj-gear",
    brandSlug: "pioneer",
    condition: "excellent",
    price_cents: 72000,
    location: "Athens, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "active",
    image: "dj",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}analog-cases-synth-case`,
    title: "Analog Cases 49-key synth case",
    body: `Padded gig case for compact synths. Low value — PD off.\n\n${DEMO_MARKER}`,
    categorySlug: "accessories",
    brandSlug: "analog-cases",
    condition: "good",
    price_cents: 7900,
    location: "Thessaloniki, Greece",
    offers_enabled: true,
    protected_delivery_enabled: false,
    status: "active",
    image: "case",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}prs-se-custom-24`,
    title: "PRS SE Custom 24",
    body: `Versatile humbuckers, wide-thin neck. Setup included.\n\n${DEMO_MARKER}`,
    categorySlug: "electric-guitars",
    brandSlug: "prs",
    condition: "excellent",
    price_cents: 64900,
    location: "Athens, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "active",
    image: "guitar",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}nord-lead-a1`,
    title: "Nord Lead A1",
    body: `Virtual analog four-part multi-timbral. Road case available separately.\n\n${DEMO_MARKER}`,
    categorySlug: "synths-keyboards",
    brandSlug: "nord",
    condition: "very_good",
    price_cents: 118000,
    location: "Patras, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "active",
    image: "synth",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}focusrite-scarlett-18i20`,
    title: "Focusrite Scarlett 18i20 (3rd Gen)",
    body: `USB interface, 18-in / 20-out. Rack ears included.\n\n${DEMO_MARKER}`,
    categorySlug: "pro-audio",
    brandSlug: "focusrite",
    condition: "good",
    price_cents: 36500,
    location: "Thessaloniki, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "pending_review",
    image: "mic",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}squier-jazz-bass-cv`,
    title: "Squier Classic Vibe Jazz Bass",
    body: `Lightweight offset. Fresh strings, low action.\n\n${DEMO_MARKER}`,
    categorySlug: "bass",
    brandSlug: "fender",
    condition: "very_good",
    price_cents: 32900,
    location: "Athens, Greece",
    offers_enabled: true,
    protected_delivery_enabled: true,
    status: "active",
    image: "guitar",
  },
  {
    slug: `${DEMO_SLUG_PREFIX}audio-technica-m50x`,
    title: "Audio-Technica ATH-M50x",
    body: `Closed-back reference cans. Pads replaced with velour.\n\n${DEMO_MARKER}`,
    categorySlug: "accessories",
    brandSlug: "audio-technica",
    condition: "excellent",
    price_cents: 9900,
    location: "Patras, Greece",
    offers_enabled: true,
    protected_delivery_enabled: false,
    status: "active",
    image: "case",
  },
];

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

async function getProfileIdByEmail(admin: ReturnType<typeof createDemoSupabaseAdmin>, email: string): Promise<string | null> {
  const { data, error } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
  if (error) {
    console.error("[seed] profiles lookup", error.message);
    return null;
  }
  return (data?.id as string | undefined) ?? null;
}

async function ensureSellerForUser(
  admin: ReturnType<typeof createDemoSupabaseAdmin>,
  userId: string,
  displayName: string,
  location: string,
): Promise<string> {
  const { error: pErr } = await admin
    .from("profiles")
    .update({ role: "seller", full_name: displayName })
    .eq("id", userId);
  if (pErr) {
    throw new Error(`Failed to set seller role: ${pErr.message}`);
  }

  const { data: existing, error: sErr } = await admin.from("seller_profiles").select("id").eq("user_id", userId).maybeSingle();
  if (sErr) {
    throw new Error(`seller_profiles lookup: ${sErr.message}`);
  }
  if (existing?.id) {
    const { error: uErr } = await admin
      .from("seller_profiles")
      .update({
        display_name: displayName,
        location,
        bio: "Demo seller (seed script).",
        verification_status: "verified",
        payout_status: "not_started",
      })
      .eq("id", existing.id);
    if (uErr) {
      throw new Error(`seller_profiles update: ${uErr.message}`);
    }
    return existing.id as string;
  }

  const { data: inserted, error: iErr } = await admin
    .from("seller_profiles")
    .insert({
      user_id: userId,
      display_name: displayName,
      bio: "Demo seller (seed script).",
      location,
      verification_status: "verified",
      payout_status: "not_started",
    })
    .select("id")
    .single();
  if (iErr || !inserted) {
    throw new Error(`seller_profiles insert: ${iErr?.message ?? "no row"}`);
  }
  return inserted.id as string;
}

async function ensureDemoAuthUser(
  admin: ReturnType<typeof createDemoSupabaseAdmin>,
  email: string,
  displayName: string,
  location: string,
  password: string,
): Promise<string> {
  let userId = await getProfileIdByEmail(admin, email);
  if (userId) {
    return ensureSellerForUser(admin, userId, displayName, location);
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: displayName },
  });
  if (error) {
    if (error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("registered")) {
      userId = await getProfileIdByEmail(admin, email);
      if (!userId) {
        throw new Error(`User exists for ${email} but profile not found — check auth sync.`);
      }
      return ensureSellerForUser(admin, userId, displayName, location);
    }
    throw new Error(`auth.admin.createUser: ${error.message}`);
  }
  if (!data.user?.id) {
    throw new Error("createUser returned no user id");
  }
  await new Promise((r) => setTimeout(r, 400));
  userId = await getProfileIdByEmail(admin, email);
  if (!userId) {
    throw new Error("Profile not created after signup — check handle_new_user trigger.");
  }
  return ensureSellerForUser(admin, userId, displayName, location);
}

async function resolveDemoPrimaryImageUrl(
  admin: ReturnType<typeof createDemoSupabaseAdmin>,
  supabaseUrl: string,
  listingId: string,
  image: DemoListing["image"],
  rasterMap: Map<DemoListing["image"], RasterPayload> | null,
): Promise<string> {
  const raster = rasterMap?.get(image);
  if (!raster) {
    return localDemoSvgPath(image);
  }
  return uploadDemoListingPrimaryPhoto(admin, supabaseUrl, listingId, raster);
}

async function main(): Promise<void> {
  loadEnvFromFiles();

  console.log("\n⚠️  WARNING: Demo seed should not be run against production.\n");

  const url = getUrl();
  const serviceKey = getServiceKey();
  const admin = createDemoSupabaseAdmin(url, serviceKey);

  let usersCreatedOrFound = 0;
  const sellerIds: string[] = [];

  const demoUserIdsEnv = process.env.DEMO_SELLER_USER_IDS?.trim();
  if (demoUserIdsEnv) {
    const parts = demoUserIdsEnv.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length < 3) {
      throw new Error("DEMO_SELLER_USER_IDS must contain 3 comma-separated UUIDs (or omit to auto-create demo users).");
    }
    for (let i = 0; i < 3; i++) {
      const uid = parts[i];
      const s = SELLERS[i];
      const sid = await ensureSellerForUser(admin, uid, s.displayName, s.location);
      sellerIds.push(sid);
      usersCreatedOrFound++;
    }
    console.log(`Using ${sellerIds.length} seller profiles from DEMO_SELLER_USER_IDS.`);
  } else {
    const password = process.env.DEMO_SEED_PASSWORD?.trim() || "DemoSeed-Local-Only-2026!";
    for (let i = 0; i < SELLERS.length; i++) {
      const s = SELLERS[i];
      const sid = await ensureDemoAuthUser(admin, s.email, s.displayName, s.location, password);
      sellerIds.push(sid);
      usersCreatedOrFound++;
      console.log(`  Seller ready: ${s.displayName} (${s.email})`);
    }
  }

  for (const b of EXTRA_BRANDS) {
    const { error } = await admin.from("brands").upsert({ name: b.name, slug: b.slug }, { onConflict: "slug" });
    if (error) {
      console.warn(`  Brand upsert skip ${b.slug}: ${error.message}`);
    }
  }

  const { data: cats, error: cErr } = await admin.from("categories").select("id, slug");
  if (cErr || !cats?.length) {
    throw new Error(`categories: ${cErr?.message ?? "empty"}`);
  }
  const categoryBySlug = new Map((cats as { id: string; slug: string }[]).map((c) => [c.slug, c.id]));

  const { data: brands, error: bErr } = await admin.from("brands").select("id, slug");
  if (bErr) {
    throw new Error(`brands: ${bErr.message}`);
  }
  const brandBySlug = new Map((brands as { id: string; slug: string }[]).map((b) => [b.slug, b.id]));

  let rasterMap: Map<DemoListing["image"], RasterPayload> | null = null;
  try {
    rasterMap = await prefetchDemoListingRasters();
  } catch (e) {
    console.warn(
      `  Demo listing photos: prefetch failed (${e instanceof Error ? e.message : String(e)}). Using local SVG paths.`,
    );
    rasterMap = null;
  }
  if (rasterMap) {
    console.log("  Demo listing photos: loaded 7 generic rasters → will upload to listing-images per listing.");
  }

  let listingsInserted = 0;
  let listingsSkipped = 0;
  let imagesInserted = 0;
  let imagesSkipped = 0;
  let rasterStorageUploads = 0;
  let rasterUrlUpgrades = 0;

  for (let i = 0; i < DEMO_LISTINGS.length; i++) {
    const L = DEMO_LISTINGS[i];
    const catId = categoryBySlug.get(L.categorySlug);
    if (!catId) {
      console.warn(`  Skip ${L.slug}: unknown category ${L.categorySlug}`);
      listingsSkipped++;
      continue;
    }
    const brandId = L.brandSlug ? brandBySlug.get(L.brandSlug) ?? null : null;
    const sellerId = sellerIds[i % sellerIds.length];

    const { data: existing } = await admin.from("listings").select("id").eq("slug", L.slug).maybeSingle();
    if (existing?.id) {
      listingsSkipped++;
      const lid = existing.id as string;
      const { data: imgRows } = await admin
        .from("listing_images")
        .select("id, url")
        .eq("listing_id", lid)
        .order("sort_order", { ascending: true })
        .limit(1);
      const first = imgRows?.[0] as { id: string; url: string } | undefined;

      if (!first) {
        let insUrl: string;
        try {
          insUrl = await resolveDemoPrimaryImageUrl(admin, url, lid, L.image, rasterMap);
        } catch (e) {
          console.warn(`  ${L.slug} image: ${e instanceof Error ? e.message : e}`);
          insUrl = localDemoSvgPath(L.image);
        }
        const { error: imgErr } = await admin.from("listing_images").insert({
          listing_id: lid,
          url: insUrl,
          sort_order: 0,
        });
        if (imgErr) {
          console.warn(`  listing_images insert ${L.slug}: ${imgErr.message}`);
        } else {
          imagesInserted++;
          if (insUrl.includes("/storage/v1/object/public/listing-images/")) {
            rasterStorageUploads++;
          }
        }
      } else if (
        rasterMap &&
        first.url.includes("/demo/listings/") &&
        first.url.endsWith(".svg")
      ) {
        try {
          const newUrl = await resolveDemoPrimaryImageUrl(admin, url, lid, L.image, rasterMap);
          const { error: upErr } = await admin.from("listing_images").update({ url: newUrl }).eq("id", first.id);
          if (upErr) {
            console.warn(`  listing_images upgrade ${L.slug}: ${upErr.message}`);
          } else if (newUrl.includes("/storage/v1/object/public/listing-images/")) {
            rasterStorageUploads++;
            rasterUrlUpgrades++;
          }
        } catch (e) {
          console.warn(`  listing_images upgrade ${L.slug}: ${e instanceof Error ? e.message : e}`);
        }
        imagesSkipped++;
      } else {
        imagesSkipped++;
      }
      continue;
    }

    const published =
      L.status === "active" || L.status === "reserved" || L.status === "sold"
        ? new Date().toISOString()
        : null;

    const { data: row, error: insErr } = await admin
      .from("listings")
      .insert({
        seller_id: sellerId,
        category_id: catId,
        brand_id: brandId,
        title: L.title,
        slug: L.slug,
        description: L.body,
        condition: L.condition,
        price_cents: L.price_cents,
        currency: "EUR",
        location: L.location,
        status: L.status,
        offers_enabled: L.offers_enabled,
        protected_delivery_enabled: L.protected_delivery_enabled,
        published_at: published,
        rejection_reason: L.rejection_reason ?? null,
      })
      .select("id")
      .single();

    if (insErr || !row) {
      console.warn(`  Listing insert failed ${L.slug}: ${insErr?.message ?? "no row"}`);
      listingsSkipped++;
      continue;
    }
    listingsInserted++;
    const listingId = row.id as string;

    let primaryUrl: string;
    try {
      primaryUrl = await resolveDemoPrimaryImageUrl(admin, url, listingId, L.image, rasterMap);
    } catch (e) {
      console.warn(`  ${L.slug} image: ${e instanceof Error ? e.message : e}`);
      primaryUrl = localDemoSvgPath(L.image);
    }
    const { error: imgErr } = await admin.from("listing_images").insert({
      listing_id: listingId,
      url: primaryUrl,
      sort_order: 0,
    });
    if (imgErr) {
      console.warn(`  listing_images ${L.slug}: ${imgErr.message}`);
    } else {
      imagesInserted++;
      if (primaryUrl.includes("/storage/v1/object/public/listing-images/")) {
        rasterStorageUploads++;
      }
    }
  }

  console.log("\n--- Demo seed summary ---");
  console.log(`Demo seller profiles ensured: ${sellerIds.length} (users resolved/created: ${usersCreatedOrFound})`);
  console.log(`Listings inserted: ${listingsInserted}, skipped (already present): ${listingsSkipped}`);
  console.log(`Listing images inserted: ${imagesInserted}, skipped / already had image: ${imagesSkipped}`);
  console.log(
    `Raster photos uploaded to Storage: ${rasterStorageUploads}; SVG rows upgraded to Storage URLs: ${rasterUrlUpgrades}`,
  );
  console.log("Done.\n");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
