import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const isConfigured =
  url.startsWith("http://") || url.startsWith("https://");

if (!isConfigured) {
  console.warn("⚠️  Supabase not configured — add your URL and keys to .env.local. Save/load features will be disabled.");
}

// Lazy singleton — only created when Supabase is actually configured.
// This prevents a crash at module load time when keys are missing.
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!isConfigured) {
    throw new Error("Supabase is not configured. Please add your credentials to .env.local");
  }
  if (!_client) _client = createClient(url, key);
  return _client;
}

// Proxy so existing imports (`supabase.from(...)`) still work unchanged.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as never)[prop as keyof SupabaseClient];
  },
});
