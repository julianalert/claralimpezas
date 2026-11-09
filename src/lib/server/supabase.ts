import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The service-role key bypasses row level security: this client must never reach the browser.
// Every table has RLS enabled without policies (supabase/schema.sql), so this is the only way in.

export const PHOTO_BUCKET = "lead-photos";

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Thrown when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are missing. */
export class NotConfiguredError extends Error {
  constructor() {
    super("Supabase is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    this.name = "NotConfiguredError";
  }
}

let client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new NotConfiguredError();
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
