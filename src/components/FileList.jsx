import { Building2, Image as ImageIcon, FileType, File as FileIcon, Download, Trash2 } from "lucide-react";
import { styles } from "../styles.js";
import { fmtDate } from "../constants.js";
import { getSignedUrl } from "../api/storage.js";

const iconFor = (cat) => (cat === "Logo" ? Building2 : cat === "Image" ? ImageIcon : cat === "Texte" ? FileType : FileIcon);

async function download(storagePath) {
  try {
    const url = await getSignedUrl(storagePath);
    window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    alert("Impossible de générer le lien de téléchargement.");
  }
}

export default function FileList({ files, onDelete }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {files.map((f) => {
        const Icon = iconFor(f.category);
        return (
          <div key={f.id} style={styles.fileRow}>
            <Icon size={17} color="var(--gold)" />
            <div style={{ flex: 1 }}>
              <div style={{ color: "var(--paper)", fontSize: 14 }}>{f.name}</div>
              <div style={{ color: "var(--slate)", fontSize: 12 }}>{f.category} · {fmtDate(f.uploadedAt)}</div>
            </div>
            <button style={styles.iconBtn} onClick={() => download(f.storagePath)}><Download size={15} /></button>
            {onDelete && <button style={styles.iconBtn} onClick={() => onDelete(f)}><Trash2 size={15} /></button>}
          </div>
        );
      })}
    </div>
  );
}
