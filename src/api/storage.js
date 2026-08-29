import { supabase } from "../lib/supabaseClient.js";

const BUCKET = "client-files";
const SIGNED_URL_TTL = 60 * 60; // 1h, plenty for an immediate download click.

export async function uploadClientFile(path, file) {
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || "application/octet-stream",
  });
  if (error) throw error;
}

export async function removeClientFile(path) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

export async function getSignedUrl(path) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error) throw error;
  return data.signedUrl;
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export function filePath(clientId, fileName) {
  return `${clientId}/files/${uid()}-${fileName}`;
}

export function contractPath(clientId, fileName) {
  return `${clientId}/contract/${fileName}`;
}
