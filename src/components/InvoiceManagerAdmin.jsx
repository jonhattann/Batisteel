import { useState } from "react";
import { Plus, Receipt, Trash2 } from "lucide-react";
import { styles } from "../styles.js";
import { EmptyState, StatusPill } from "./ui.jsx";
import { fmtDate, fmtAmount } from "../constants.js";
import { addInvoice, setInvoiceStatus, deleteInvoice } from "../api/invoices.js";

export default function InvoiceManagerAdmin({ clientId, invoices, onChange }) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ label: "", amount: "", status: "En attente", date: new Date().toISOString().slice(0, 10) });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const inv = await addInvoice(clientId, { ...form, amount: Number(form.amount) });
      onChange([inv, ...invoices]);
      setForm({ label: "", amount: "", status: "En attente", date: new Date().toISOString().slice(0, 10) });
      setShowNew(false);
    } catch (err) {
      alert(err.message || "Échec de l'ajout de la facture.");
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (inv) => {
    const status = inv.status === "Payée" ? "En attente" : "Payée";
    onChange(invoices.map((i) => (i.id === inv.id ? { ...i, status } : i)));
    try {
      await setInvoiceStatus(inv.id, status);
    } catch {
      onChange(invoices); // revert on failure
    }
  };

  const remove = async (id) => {
    const prev = invoices;
    onChange(invoices.filter((i) => i.id !== id));
    try {
      await deleteInvoice(id);
    } catch {
      onChange(prev);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button style={styles.primaryBtnSm} onClick={() => setShowNew((v) => !v)}>
          <Plus size={15} /> Nouvelle facture
        </button>
      </div>

      {showNew && (
        <form onSubmit={submit} style={{ ...styles.inlineForm, marginBottom: 20 }}>
          <input required style={styles.input} placeholder="Description" value={form.label} onChange={set("label")} />
          <input required type="number" min="0" step="0.01" style={{ ...styles.input, maxWidth: 130 }} placeholder="Montant €" value={form.amount} onChange={set("amount")} />
          <input type="date" style={{ ...styles.input, maxWidth: 160 }} value={form.date} onChange={set("date")} />
          <select style={{ ...styles.input, maxWidth: 140 }} value={form.status} onChange={set("status")}>
            <option>En attente</option>
            <option>Payée</option>
          </select>
          <button type="submit" disabled={busy} style={styles.primaryBtnSm}>{busy ? "Ajout…" : "Ajouter"}</button>
        </form>
      )}

      {invoices.length === 0 ? (
        <EmptyState text="Aucune facture pour l'instant." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {invoices.map((inv) => (
            <div key={inv.id} style={styles.fileRow}>
              <Receipt size={17} color="var(--gold)" />
              <div style={{ flex: 1 }}>
                <div style={{ color: "var(--paper)", fontSize: 14 }}>{inv.label}</div>
                <div style={{ color: "var(--slate)", fontSize: 12 }}>{fmtDate(inv.date)} · {fmtAmount(inv.amount)}</div>
              </div>
              <StatusPill status={inv.status} onClick={() => toggleStatus(inv)} />
              <button style={styles.iconBtn} onClick={() => remove(inv.id)}><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
