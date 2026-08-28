import { supabase } from "../lib/supabaseClient.js";
import { uploadClientFile, removeClientFile, filePath } from "./storage.js";

export async function listFiles(clientId) {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("client_id", clientId)
    .order("uploaded_at", { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
}

export async function addFile(clientId, file, category) {
  const path = filePath(clientId, file.name);
  await uploadClientFile(path, file);

  const { data, error } = await supabase
    .from("files")
    .insert({ client_id: clientId, name: file.name, category, storage_path: path })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function deleteFile(id, storagePath) {
  const { error } = await supabase.from("files").delete().eq("id", id);
  if (error) throw error;
  await removeClientFile(storagePath).catch(() => {});
}

const fromRow = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  storagePath: row.storage_path,
  uploadedAt: row.uploaded_at,
});
