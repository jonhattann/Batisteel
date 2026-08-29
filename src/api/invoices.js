import { supabase } from "../lib/supabaseClient.js";

export async function listInvoices(clientId) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
}

export async function addInvoice(clientId, { label, amount, status, date }) {
  const { data, error } = await supabase
    .from("invoices")
    .insert({ client_id: clientId, label, amount, status, date })
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function setInvoiceStatus(id, status) {
  const { error } = await supabase.from("invoices").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteInvoice(id) {
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw error;
}

const fromRow = (row) => ({
  id: row.id,
  label: row.label,
  amount: row.amount,
  status: row.status,
  date: row.date,
});
