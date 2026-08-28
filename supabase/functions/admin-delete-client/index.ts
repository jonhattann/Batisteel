// Admin-only: deletes a client's auth account, storage files and rows.
import { corsHeaders } from "../_shared/cors.ts";
import { requireAdmin, serviceRoleClient } from "../_shared/requireAdmin.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const admin = serviceRoleClient();

  try {
    await requireAdmin(req, admin);

    const { clientId } = await req.json();
    if (!clientId) {
      return new Response(JSON.stringify({ error: "clientId manquant." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Storage objects aren't removed by the FK cascade — clean the folder up first.
    const { data: filesList } = await admin.storage
      .from("client-files")
      .list(`${clientId}/files`);
    const { data: contractList } = await admin.storage
      .from("client-files")
      .list(`${clientId}/contract`);

    const paths = [
      ...(filesList ?? []).map((f) => `${clientId}/files/${f.name}`),
      ...(contractList ?? []).map((f) => `${clientId}/contract/${f.name}`),
    ];
    if (paths.length > 0) {
      await admin.storage.from("client-files").remove(paths);
    }

    // clients row cascades to contracts/files/invoices via FK.
    const { error: deleteRowErr } = await admin.from("clients").delete().eq("id", clientId);
    if (deleteRowErr) {
      return new Response(JSON.stringify({ error: deleteRowErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: deleteUserErr } = await admin.auth.admin.deleteUser(clientId);
    if (deleteUserErr) {
      return new Response(JSON.stringify({ error: deleteUserErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
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
