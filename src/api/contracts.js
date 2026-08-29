import { supabase } from "../lib/supabaseClient.js";
import { uploadClientFile, contractPath } from "./storage.js";

export async function getContract(clientId) {
  const { data, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("client_id", clientId)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data) : null;
}

export async function setContract(clientId, file) {
  const path = contractPath(clientId, file.name);
  await uploadClientFile(path, file);

  const { data, error } = await supabase
    .from("contracts")
    .upsert({ client_id: clientId, file_name: file.name, storage_path: path, uploaded_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

const fromRow = (row) => ({
  name: row.file_name,
  storagePath: row.storage_path,
  uploadedAt: row.uploaded_at,
});
