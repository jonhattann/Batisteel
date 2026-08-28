import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { styles } from "../styles.js";
import { EmptyState } from "./ui.jsx";
import ContractRow from "./ContractRow.jsx";
import { setContract } from "../api/contracts.js";

export default function ContractEditor({ clientId, contract, onSaved }) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert("Fichier trop volumineux (max 15 Mo).");
      return;
    }
    setBusy(true);
    try {
      const saved = await setContract(clientId, file);
      onSaved(saved);
    } catch (err) {
      alert(err.message || "Échec de l'envoi du contrat.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {contract ? <ContractRow contract={contract} /> : <EmptyState text="Aucun contrat déposé pour ce client." />}
      <input ref={inputRef} type="file" onChange={handleFile} style={{ display: "none" }} />
      <button style={{ ...styles.secondaryBtn, marginTop: 16 }} onClick={() => inputRef.current.click()} disabled={busy}>
        <Upload size={15} /> {busy ? "Envoi…" : contract ? "Remplacer le contrat" : "Déposer le contrat"}
      </button>
    </div>
  );
}
