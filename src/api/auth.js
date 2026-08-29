import { supabase } from "../lib/supabaseClient.js";

// Role lives in the JWT's app_metadata, set server-side only by the
// bootstrap-admin / admin-create-client edge functions — a client can
// never grant themselves the "admin" role.
export function roleFromUser(user) {
  return user?.app_metadata?.role === "admin" ? "admin" : "client";
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}
