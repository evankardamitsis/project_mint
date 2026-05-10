import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Admin / service-role Supabase client — bypasses RLS (uses SUPABASE_SECRET_KEY).
 *
 * Use only in trusted server contexts: Server Actions, Route Handlers, background jobs, etc.
 * Never import this module from Client Components or pass the secret key to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url?.trim() || !secretKey?.trim()) {
    throw new Error(
      "Supabase admin client: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (server-only).",
    );
  }

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
