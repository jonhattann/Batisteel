import { FileText, Download } from "lucide-react";
import { styles } from "../styles.js";
import { fmtDate } from "../constants.js";
import { getSignedUrl } from "../api/storage.js";

async function download(storagePath) {
  try {
    const url = await getSignedUrl(storagePath);
    window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    alert("Impossible de générer le lien de téléchargement.");
  }
}

export default function ContractRow({ contract }) {
  return (
    <div style={styles.fileRow}>
      <FileText size={18} color="var(--gold)" />
      <div style={{ flex: 1 }}>
        <div style={{ color: "var(--paper)", fontSize: 14 }}>{contract.name}</div>
        <div style={{ color: "var(--slate)", fontSize: 12 }}>Envoyé le {fmtDate(contract.uploadedAt)}</div>
      </div>
      <button style={styles.iconBtn} onClick={() => download(contract.storagePath)}><Download size={15} /></button>
    </div>
  );
}
