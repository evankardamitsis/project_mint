/**
 * Demo seed: fetch generic placeholder photos and upload to public listing-images bucket.
 * Photos are from picsum.photos (Lorem Picsum / Unsplash-style pool), not product shots.
 */
import { createDemoSupabaseAdmin } from "./demo-supabase-admin-client";

const BUCKET = "listing-images";

type DemoAdminClient = ReturnType<typeof createDemoSupabaseAdmin>;

export type DemoSeedListingImageKey =
  | "guitar"
  | "synth"
  | "pedal"
  | "amp"
  | "mic"
  | "dj"
  | "case";

/** Deterministic seeds → stable images across runs (same seed = same photo). */
const PICSUM_SEEDS: Record<DemoSeedListingImageKey, string> = {
  guitar: "projectmint-demo-guitar-1",
  synth: "projectmint-demo-synth-1",
  pedal: "projectmint-demo-pedal-1",
  amp: "projectmint-demo-amp-1",
  mic: "projectmint-demo-mic-1",
  dj: "projectmint-demo-dj-1",
  case: "projectmint-demo-case-1",
};

export type RasterPayload = {
  body: Buffer;
  contentType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
  ext: string;
};

function sniffImageMime(buf: Buffer): RasterPayload["contentType"] {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return "image/png";
  }
  if (buf.length >= 12 && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) {
    return "image/webp";
  }
  if (buf.length >= 6 && buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
    return "image/gif";
  }
  return "image/jpeg";
}

function extForMime(m: RasterPayload["contentType"]): string {
  if (m === "image/png") {
    return "png";
  }
  if (m === "image/webp") {
    return "webp";
  }
  if (m === "image/gif") {
    return "gif";
  }
  return "jpg";
}

async function fetchOneRaster(key: DemoSeedListingImageKey): Promise<RasterPayload> {
  const seed = PICSUM_SEEDS[key];
  const url = `https://picsum.photos/seed/${encodeURIComponent(seed)}/1280/960`;
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      Accept: "image/jpeg,image/png,image/webp,image/gif,*/*",
      "User-Agent": "ProjectMint-demo-seed/1.0 (+https://github.com/)",
    },
  });
  if (!res.ok) {
    throw new Error(`Fetch demo image "${key}": HTTP ${res.status}`);
  }
  const body = Buffer.from(await res.arrayBuffer());
  const headerCt = res.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
  let contentType: RasterPayload["contentType"] = sniffImageMime(body);
  if (
    headerCt === "image/jpeg" ||
    headerCt === "image/png" ||
    headerCt === "image/webp" ||
    headerCt === "image/gif"
  ) {
    contentType = headerCt;
  }
  return { body, contentType, ext: extForMime(contentType) };
}

const ALL_KEYS: DemoSeedListingImageKey[] = [
  "guitar",
  "synth",
  "pedal",
  "amp",
  "mic",
  "dj",
  "case",
];

/** When null, caller should fall back to local SVG paths. */
export async function prefetchDemoListingRasters(): Promise<Map<DemoSeedListingImageKey, RasterPayload> | null> {
  if (process.env.DEMO_SEED_SKIP_REMOTE_IMAGES === "1") {
    return null;
  }
  const map = new Map<DemoSeedListingImageKey, RasterPayload>();
  for (const key of ALL_KEYS) {
    map.set(key, await fetchOneRaster(key));
    await new Promise((r) => setTimeout(r, 120));
  }
  return map;
}

export function localSvgListingImagePath(key: DemoSeedListingImageKey): string {
  return `/demo/listings/${key}.svg`;
}

export function storagePublicObjectUrl(supabaseProjectUrl: string, objectPath: string): string {
  const base = supabaseProjectUrl.replace(/\/$/, "");
  const clean = objectPath.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${BUCKET}/${clean}`;
}

export async function uploadDemoListingPrimaryPhoto(
  admin: DemoAdminClient,
  supabaseProjectUrl: string,
  listingId: string,
  raster: RasterPayload,
): Promise<string> {
  const path = `${listingId}/demo-seed-primary.${raster.ext}`;
  const { error } = await admin.storage.from(BUCKET).upload(path, raster.body, {
    contentType: raster.contentType,
    upsert: true,
  });
  if (error) {
    throw new Error(`Storage upload ${path}: ${error.message}`);
  }
  return storagePublicObjectUrl(supabaseProjectUrl, path);
}

export async function removeListingImageObjects(
  admin: DemoAdminClient,
  listingIds: string[],
): Promise<{ removed: number; warnings: string[] }> {
  const warnings: string[] = [];
  let removed = 0;
  for (const id of listingIds) {
    const { data: files, error } = await admin.storage.from(BUCKET).list(id, { limit: 100 });
    if (error) {
      warnings.push(`list ${id}: ${error.message}`);
      continue;
    }
    const names = (files ?? []).map((f) => f.name).filter(Boolean);
    if (names.length === 0) {
      continue;
    }
    const paths = names.map((n) => `${id}/${n}`);
    const { error: rmErr } = await admin.storage.from(BUCKET).remove(paths);
    if (rmErr) {
      warnings.push(`remove ${id}: ${rmErr.message}`);
    } else {
      removed += paths.length;
    }
  }
  return { removed, warnings };
}
