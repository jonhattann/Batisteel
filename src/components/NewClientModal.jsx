import { useState } from "react";
import { styles } from "../styles.js";
import { Labeled, ModalShell } from "./ui.jsx";
import { createClient } from "../api/clients.js";

export default function NewClientModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", projectName: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const id = await createClient(form);
      onCreated(id);
    } catch (error) {
      setErr(error.message || "Échec de la création du dossier client.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell onClose={onClose} title="Nouveau client">
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Labeled label="Nom du client">
          <input required style={styles.input} value={form.name} onChange={set("name")} placeholder="Julie Martin" />
        </Labeled>
        <Labeled label="Nom du projet">
          <input required style={styles.input} value={form.projectName} onChange={set("projectName")} placeholder="Site vitrine — Atelier Martin" />
        </Labeled>
        <Labeled label="Email de connexion">
          <input required type="email" style={styles.input} value={form.email} onChange={set("email")} placeholder="julie@exemple.fr" />
        </Labeled>
        <Labeled label="Mot de passe">
          <input required minLength={6} style={styles.input} value={form.password} onChange={set("password")} placeholder="Mot de passe temporaire" />
        </Labeled>
        {err && <div style={{ color: "var(--red)", fontSize: 13 }}>{err}</div>}
        <button type="submit" disabled={busy} style={{ ...styles.primaryBtn, marginTop: 8 }}>
          {busy ? "Création…" : "Créer le dossier client"}
        </button>
      </form>
    </ModalShell>
  );
}
