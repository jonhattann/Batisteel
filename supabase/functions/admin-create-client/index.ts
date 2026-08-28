// Admin-only: creates the auth user + clients row for a new client.
// Client-side accounts can never self-register — only an authenticated
// admin (checked via requireAdmin, which reads the caller's own JWT) may
// call this function. It runs with the service-role key so it can create
// auth users, something the public anon key cannot do.
import { corsHeaders } from "../_shared/cors.ts";
import { requireAdmin, serviceRoleClient } from "../_shared/requireAdmin.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const admin = serviceRoleClient();

  try {
    await requireAdmin(req, admin);

    const { name, email, password, projectName } = await req.json();
    if (!name || !email || !password || !projectName) {
      return new Response(
        JSON.stringify({ error: "Champs manquants (name, email, password, projectName)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: "client" },
    });
    if (createErr || !created.user) {
      return new Response(
        JSON.stringify({ error: createErr?.message ?? "Création du compte impossible." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: insertErr } = await admin.from("clients").insert({
      id: created.user.id,
      name,
      project_name: projectName,
      stage_index: 0,
      stage_progress: 0,
    });
    if (insertErr) {
      // Roll back the auth user so we don't leave an orphaned account.
      await admin.auth.admin.deleteUser(created.user.id);
      return new Response(
        JSON.stringify({ error: insertErr.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ id: created.user.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const status = (e as { status?: number })?.status ?? 500;
    const message = (e as { message?: string })?.message ?? "Erreur inattendue.";
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
