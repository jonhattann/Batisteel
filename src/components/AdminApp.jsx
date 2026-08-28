import { useCallback, useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import { styles } from "../styles.js";
import { STAGES } from "../constants.js";
import { PageHeader, Muted, EmptyState } from "./ui.jsx";
import Shell from "./Shell.jsx";
import NewClientModal from "./NewClientModal.jsx";
import ClientDetailAdmin from "./ClientDetailAdmin.jsx";
import { listClients, updateClient } from "../api/clients.js";

export default function AdminApp({ onLogout }) {
  const [clients, setClients] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const loadClients = useCallback(async () => {
    setClients(await listClients());
  }, []);

  useEffect(() => { loadClients(); }, [loadClients]);

  const selected = clients?.find((c) => c.id === selectedId) || null;

  const handleUpdate = async (patch) => {
    setClients((cur) => cur.map((c) => (c.id === selected.id ? { ...c, ...patch } : c)));
    try {
      await updateClient(selected.id, patch);
    } catch {
      await loadClients();
    }
  };

  const handleCreated = async () => {
    setShowNew(false);
    await loadClients();
  };

  const nav = [{ key: "clients", label: "Clients", icon: Users }];

  return (
    <Shell nav={nav} activeNav="clients" onNav={() => {}} onLogout={onLogout} subtitle="ESPACE ADMINISTRATEUR">
      {clients === null ? (
        <Muted>Chargement des clients…</Muted>
      ) : selected ? (
        <ClientDetailAdmin
          client={selected}
          onBack={() => setSelectedId(null)}
          onUpdate={handleUpdate}
          onDeleted={() => { setSelectedId(null); loadClients(); }}
        />
      ) : (
        <>
          <PageHeader
            eyebrow="TABLEAU DE BORD"
            title="Clients"
            action={
              <button style={styles.primaryBtnSm} onClick={() => setShowNew(true)}>
                <Plus size={15} /> Nouveau client
              </button>
            }
          />
          {clients.length === 0 ? (
            <EmptyState text="Aucun client pour l'instant. Crée le premier dossier client." />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginTop: 24 }}>
              {clients.map((c) => (
                <button key={c.id} onClick={() => setSelectedId(c.id)} style={styles.clientCard}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: "var(--gold)", letterSpacing: 1 }}>
                    {STAGES[c.stageIndex]?.code}
                  </div>
                  <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 16, color: "var(--paper)", marginTop: 6 }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--slate)", marginTop: 2 }}>{c.projectName}</div>
                  <div style={{ marginTop: 14, height: 4, background: "rgba(120,112,96,0.2)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${((c.stageIndex + c.stageProgress / 100) / STAGES.length) * 100}%`, height: "100%", background: "var(--gold)" }} />
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--slate)" }}>{STAGES[c.stageIndex]?.label}</div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {showNew && <NewClientModal onClose={() => setShowNew(false)} onCreated={handleCreated} />}
    </Shell>
  );
}
