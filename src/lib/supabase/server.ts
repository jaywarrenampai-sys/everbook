/**
 * Server-only Supabase client — uses the service role key.
 * NEVER import this file from any "use client" component.
 * It bypasses Row Level Security — only call from API routes.
 */
import { createClient } from "@supabase/supabase-js";

export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !key || url === "your-project-url-here") {
    throw new Error("Supabase env vars not set. Check .env.local");
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
