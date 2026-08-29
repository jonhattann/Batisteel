import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { styles } from "../styles.js";
import { STAGES } from "../constants.js";
import { PageHeader, Panel, Muted, EmptyState, Labeled } from "./ui.jsx";
import VoyageProgress from "./VoyageProgress.jsx";
import FileList from "./FileList.jsx";
import ContractEditor from "./ContractEditor.jsx";
import InvoiceManagerAdmin from "./InvoiceManagerAdmin.jsx";
import { listFiles } from "../api/files.js";
import { getContract } from "../api/contracts.js";
import { listInvoices } from "../api/invoices.js";
import { deleteClient } from "../api/clients.js";

export default function ClientDetailAdmin({ client, onBack, onUpdate, onDeleted }) {
  const [tab, setTab] = useState("suivi");
  const [data, setData] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setData(null);
    const [files, contract, invoices] = await Promise.all([
      listFiles(client.id),
      getContract(client.id),
      listInvoices(client.id),
    ]);
    setData({ files, contract, invoices });
  }, [client.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteClient(client.id);
      onDeleted();
    } catch (err) {
      alert(err.message || "Échec de la suppression.");
      setDeleting(false);
    }
  };

  const tabs = [
    { key: "suivi", label: "Suivi du projet" },
    { key: "fichiers", label: "Fichiers reçus" },
    { key: "contrat", label: "Contrat" },
    { key: "factures", label: "Factures" },
  ];

  return (
    <div>
      <button onClick={onBack} style={styles.backBtn}>← Tous les clients</button>
      <PageHeader eyebrow={client.projectName} title={client.name} />

      <div style={styles.tabRow}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ ...styles.tabBtn, ...(tab === t.key ? styles.tabBtnActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "suivi" && (
        <Panel>
          <VoyageProgress stageIndex={client.stageIndex} stageProgress={client.stageProgress} />
          <div style={{ marginTop: 24, display: "grid", gap: 16, maxWidth: 420 }}>
            <Labeled label="Étape actuelle">
              <select
                style={styles.input}
                value={client.stageIndex}
                onChange={(e) => onUpdate({ stageIndex: Number(e.target.value), stageProgress: 0 })}
              >
                {STAGES.map((s, i) => (
                  <option key={s.code} value={i}>{s.code} — {s.label}</option>
                ))}
              </select>
            </Labeled>
            <Labeled label={`Avancement de l'étape — ${client.stageProgress}%`}>
              <input
                type="range" min="0" max="100" value={client.stageProgress}
                onChange={(e) => onUpdate({ stageProgress: Number(e.target.value) })}
                style={{ width: "100%" }}
              />
            </Labeled>
          </div>
        </Panel>
      )}

      {tab === "fichiers" && (
        <Panel>
          {!data ? <Muted>Chargement…</Muted> : data.files.length === 0 ? (
            <EmptyState text="Le client n'a pas encore déposé de fichier." />
          ) : (
            <FileList files={data.files} onDelete={null} />
          )}
        </Panel>
      )}

      {tab === "contrat" && (
        <Panel>
          {!data ? <Muted>Chargement…</Muted> : (
            <ContractEditor
              clientId={client.id}
              contract={data.contract}
              onSaved={(contract) => setData({ ...data, contract })}
            />
          )}
        </Panel>
      )}

      {tab === "factures" && (
        <Panel>
          {!data ? <Muted>Chargement…</Muted> : (
            <InvoiceManagerAdmin
              clientId={client.id}
              invoices={data.invoices}
              onChange={(invoices) => setData({ ...data, invoices })}
            />
          )}
        </Panel>
      )}

      <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(120,112,96,0.15)" }}>
        {!confirmDelete ? (
          <button style={styles.dangerLinkBtn} onClick={() => setConfirmDelete(true)}>
            <Trash2 size={14} /> Supprimer ce dossier client
          </button>
        ) : (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--red)" }}>Confirmer la suppression définitive ?</span>
            <button style={styles.dangerBtnSm} onClick={handleDelete} disabled={deleting}>
              {deleting ? "Suppression…" : "Oui, supprimer"}
            </button>
            <button style={styles.ghostBtnSm} onClick={() => setConfirmDelete(false)} disabled={deleting}>Annuler</button>
          </div>
        )}
      </div>
    </div>
  );
}
