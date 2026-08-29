import { createClient, SupabaseClient, User } from "npm:@supabase/supabase-js@2";

/**
 * Verifies the caller's JWT (from the Authorization header) belongs to an
 * admin, using the service-role client so RLS never gets in the way of the
 * check itself. Throws a Response-friendly error object on failure.
 */
export async function requireAdmin(
  req: Request,
  adminClient: SupabaseClient
): Promise<User> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    throw { status: 401, message: "Authentification requise." };
  }

  const { data, error } = await adminClient.auth.getUser(token);
  if (error || !data.user) {
    throw { status: 401, message: "Session invalide." };
  }

  const role = (data.user.app_metadata as Record<string, unknown> | null)?.role;
  if (role !== "admin") {
    throw { status: 403, message: "Réservé aux administrateurs." };
  }

  return data.user;
}

export function serviceRoleClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
