import { supabase } from "../lib/supabaseClient.js";

export async function listClients() {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
}

export async function getClient(id) {
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function updateClient(id, patch) {
  const { error } = await supabase.from("clients").update(toRow(patch)).eq("id", id);
  if (error) throw error;
}

// Creating/deleting a client needs elevated privileges (creating an auth
// user, deleting one) that the anon key can never hold — those go through
// admin-only edge functions running with the service role key.
export async function createClient({ name, email, password, projectName }) {
  const { data, error } = await supabase.functions.invoke("admin-create-client", {
    body: { name, email, password, projectName },
  });
  if (error) throw new Error(await extractFunctionError(error));
  return data.id;
}

export async function deleteClient(clientId) {
  const { error } = await supabase.functions.invoke("admin-delete-client", {
    body: { clientId },
  });
  if (error) throw new Error(await extractFunctionError(error));
}

async function extractFunctionError(error) {
  // supabase-js wraps non-2xx responses; the function body carries the real message.
  try {
    const body = await error.context?.json?.();
    return body?.error || error.message;
  } catch {
    return error.message;
  }
}

const fromRow = (row) => ({
  id: row.id,
  name: row.name,
  projectName: row.project_name,
  stageIndex: row.stage_index,
  stageProgress: row.stage_progress,
  createdAt: row.created_at,
});

const toRow = (patch) => {
  const row = {};
  if (patch.stageIndex !== undefined) row.stage_index = patch.stageIndex;
  if (patch.stageProgress !== undefined) row.stage_progress = patch.stageProgress;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.projectName !== undefined) row.project_name = patch.projectName;
  return row;
};
