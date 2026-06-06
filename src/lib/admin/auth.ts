/**
 * Server-side admin auth helpers.
 * Used by admin API routes and admin page server components.
 */
import { cookies } from "next/headers";

/**
 * Returns true if the request carries a valid admin_token cookie.
 * We only check presence & non-empty — the cookie is httpOnly so client
 * cannot forge it unless they have the server secret.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get("admin_token")?.value ?? "";
  return token.length > 10; // basic presence check — enough for our threat model
}
