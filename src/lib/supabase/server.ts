import { createServerClient } from "@supabase/ssr";
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
 * Server client bound to the caller's cookies (publishable key, RLS applies).
 * When a session exists, pins `Authorization: Bearer <access_token>` on every
 * REST/Storage request so PostgREST always evaluates RLS with the user JWT
 * (avoids intermittent anon-key-only requests in Server Actions).
 * For service-role / bypass-RLS work, use `createAdminClient` from `@/lib/supabase/admin`.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

  const cookiesOpts = cookieAdapter(cookieStore);
  const base = createServerClient(url, key, { cookies: cookiesOpts });

  const {
    data: { session },
  } = await base.auth.getSession();

  if (!session?.access_token) {
    return base;
  }

  return createServerClient(url, key, {
    cookies: cookiesOpts,
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  });
}
