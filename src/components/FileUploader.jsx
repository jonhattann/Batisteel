import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { styles } from "../styles.js";

const MAX_SIZE = 15 * 1024 * 1024; // Supabase Storage handles large files fine; well past the old base64 limit.

export default function FileUploader({ onAdd }) {
  const [category, setCategory] = useState("Logo");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (fileList) => {
    const file = fileList?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE) {
      alert("Fichier trop volumineux (max 15 Mo).");
      return;
    }
    setBusy(true);
    try {
      await onAdd(file, category);
    } catch (e) {
      alert(e.message || "Échec de l'envoi du fichier.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        {["Logo", "Image", "Texte", "Autre"].map((c) => (
          <button key={c} onClick={() => setCategory(c)} style={{ ...styles.chip, ...(category === c ? styles.chipActive : {}) }}>
            {c}
          </button>
        ))}
      </div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current.click()}
        style={{ ...styles.dropzone, borderColor: dragOver ? "var(--gold)" : "rgba(196,151,90,0.3)" }}
      >
        <Upload size={22} color="var(--gold)" />
        <div style={{ color: "var(--paper)", fontSize: 14, marginTop: 8 }}>
          {busy ? "Envoi en cours…" : `Glisse un fichier "${category}" ici, ou clique pour choisir`}
        </div>
        <div style={{ color: "var(--slate)", fontSize: 12, marginTop: 2 }}>Max 15 Mo par fichier</div>
      </div>
      <input ref={inputRef} type="file" style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}
