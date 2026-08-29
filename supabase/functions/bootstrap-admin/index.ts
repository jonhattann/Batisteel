// One-time setup helper: creates the very first admin account.
// Refuses to run once any admin already exists, so it's safe to leave
// deployed — it can't be used to mint a second admin without one already
// being logged in (use admin-create-client's sibling pattern for that,
// or just flip app_metadata.role via the dashboard/SQL for extra admins).
import { corsHeaders } from "../_shared/cors.ts";
import { serviceRoleClient } from "../_shared/requireAdmin.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const admin = serviceRoleClient();

  try {
    const { email, password, secret } = await req.json();

    const expected = Deno.env.get("BOOTSTRAP_ADMIN_SECRET");
    if (!expected || secret !== expected) {
      return new Response(JSON.stringify({ error: "Secret invalide." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!email || !password) {
      return new Response(JSON.stringify({ error: "email et password requis." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Refuse if an admin already exists (paginate through users defensively).
    let page = 1;
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const alreadyHasAdmin = data.users.some(
        (u) => (u.app_metadata as Record<string, unknown> | null)?.role === "admin"
      );
      if (alreadyHasAdmin) {
        return new Response(
          JSON.stringify({ error: "Un compte admin existe déjà." }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (data.users.length < 200) break;
      page += 1;
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role: "admin" },
    });
    if (createErr || !created.user) {
      return new Response(
        JSON.stringify({ error: createErr?.message ?? "Création impossible." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ id: created.user.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = (e as { message?: string })?.message ?? "Erreur inattendue.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
