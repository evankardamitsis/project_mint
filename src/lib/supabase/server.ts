import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const cookieAdapter = (cookieStore: Awaited<ReturnType<typeof cookies>>) => ({
  getAll() {
    return cookieStore.getAll();
  },
  setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
    try {
      cookiesToSet.forEach(({ name, value, options }) => {
        cookieStore.set(name, value, options);
      });
    } catch {
      // Server Component without mutable cookies; session refresh runs in middleware.
    }
  },
});

/**
 * Publishable (anon) Supabase client with no Next.js `cookies()` — safe inside `unstable_cache`.
 * RLS runs as anonymous; use only for public reads allowed to anon.
 */
export function createPublishableServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
  return createSupabaseJsClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Server client bound to the caller's cookies (publishable key, RLS applies).
 * Session refresh runs in middleware (`updateSession`); use `supabase.auth.getUser()`
 * when you need a verified user — not `getSession()`, which reads unverified cookie data.
 * For service-role / bypass-RLS work, use `createAdminClient` from `@/lib/supabase/admin`.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

  return createServerClient(url, key, { cookies: cookieAdapter(cookieStore) });
}
