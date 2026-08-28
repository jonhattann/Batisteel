import { useCallback, useEffect, useState } from "react";
import { LayoutDashboard, Upload, FileText, Receipt } from "lucide-react";
import { STAGES } from "../constants.js";
import { PageHeader, Panel, Muted, EmptyState, StatusPill } from "./ui.jsx";
import Shell from "./Shell.jsx";
import VoyageProgress from "./VoyageProgress.jsx";
import FileUploader from "./FileUploader.jsx";
import FileList from "./FileList.jsx";
import ContractRow from "./ContractRow.jsx";
import { styles } from "../styles.js";
import { fmtDate, fmtAmount } from "../constants.js";
import { getClient } from "../api/clients.js";
import { listFiles, addFile, deleteFile } from "../api/files.js";
import { getContract } from "../api/contracts.js";
import { listInvoices } from "../api/invoices.js";

export default function ClientApp({ clientId, onLogout }) {
  const [view, setView] = useState("dashboard");
  const [client, setClient] = useState(null);
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    const [c, files, contract, invoices] = await Promise.all([
      getClient(clientId),
      listFiles(clientId),
      getContract(clientId),
      listInvoices(clientId),
    ]);
    setClient(c);
    setData({ files, contract, invoices });
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  const handleAddFile = async (file, category) => {
    const saved = await addFile(clientId, file, category);
    setData((d) => ({ ...d, files: [saved, ...d.files] }));
  };

  const handleDeleteFile = async (file) => {
    const prev = data.files;
    setData((d) => ({ ...d, files: d.files.filter((f) => f.id !== file.id) }));
    try {
      await deleteFile(file.id, file.storagePath);
    } catch {
      setData((d) => ({ ...d, files: prev }));
    }
  };

  const nav = [
    { key: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { key: "fichiers", label: "Mes fichiers", icon: Upload },
    { key: "contrat", label: "Mon contrat", icon: FileText },
    { key: "factures", label: "Mes factures", icon: Receipt },
  ];

  if (!client || !data) {
    return (
      <Shell nav={nav} activeNav={view} onNav={setView} onLogout={onLogout} subtitle="ESPACE CLIENT">
        <Muted>Chargement…</Muted>
      </Shell>
    );
  }

  return (
    <Shell nav={nav} activeNav={view} onNav={setView} onLogout={onLogout} subtitle={client.projectName}>
      {view === "dashboard" && (
        <div>
          <PageHeader eyebrow="SUIVI EN TEMPS RÉEL" title={client.projectName} />
          <Panel>
            <VoyageProgress stageIndex={client.stageIndex} stageProgress={client.stageProgress} />
            <div style={{ marginTop: 20, padding: 16, background: "rgba(196,151,90,0.06)", borderRadius: 10, border: "1px solid rgba(196,151,90,0.2)" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: "var(--gold)", letterSpacing: 1 }}>
                ÉTAPE EN COURS — {STAGES[client.stageIndex]?.code}
              </div>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 17, color: "var(--paper)", marginTop: 4 }}>
                {STAGES[client.stageIndex]?.label}
              </div>
              <div style={{ fontSize: 13, color: "var(--slate)", marginTop: 4 }}>{client.stageProgress}% de cette étape complétée</div>
            </div>
          </Panel>
        </div>
      )}

      {view === "fichiers" && (
        <div>
          <PageHeader eyebrow="ESPACE PARTAGÉ" title="Mes fichiers" />
          <Panel>
            <FileUploader onAdd={handleAddFile} />
            <div style={{ marginTop: 20 }}>
              {data.files.length === 0 ? (
                <EmptyState text="Dépose ton logo, tes images ou tes textes ici — ils seront visibles par l'équipe OGEN." />
              ) : (
                <FileList files={data.files} onDelete={handleDeleteFile} />
              )}
            </div>
          </Panel>
        </div>
      )}

      {view === "contrat" && (
        <div>
          <PageHeader eyebrow="DOCUMENT LÉGAL" title="Mon contrat" />
          <Panel>
            {data.contract ? (
              <ContractRow contract={data.contract} />
            ) : (
              <EmptyState text="Ton contrat n'a pas encore été mis en ligne par l'équipe OGEN." />
            )}
          </Panel>
        </div>
      )}

      {view === "factures" && (
        <div>
          <PageHeader eyebrow="FACTURATION" title="Mes factures" />
          <Panel>
            {data.invoices.length === 0 ? (
              <EmptyState text="Aucune facture pour l'instant." />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.invoices.map((inv) => (
                  <div key={inv.id} style={styles.fileRow}>
                    <Receipt size={17} color="var(--gold)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "var(--paper)", fontSize: 14 }}>{inv.label}</div>
                      <div style={{ color: "var(--slate)", fontSize: 12 }}>{fmtDate(inv.date)} · {fmtAmount(inv.amount)}</div>
                    </div>
                    <StatusPill status={inv.status} />
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      )}
    </Shell>
  );
}
