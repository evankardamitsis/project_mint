/**
 * Admin Supabase client for Node CLI scripts (seed / clear).
 * Node 21 has no native WebSocket in the same shape Realtime expects; pass `ws` as transport.
 */
import type { WebSocketLikeConstructor } from "@supabase/realtime-js";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

export function createDemoSupabaseAdmin(url: string, serviceRoleKey: string) {
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    realtime: {
      transport: WebSocket as unknown as WebSocketLikeConstructor,
    },
  });
}
