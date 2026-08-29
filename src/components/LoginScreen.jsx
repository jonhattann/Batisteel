import { useState } from "react";
import { Mail, Lock, ChevronRight, AlertCircle } from "lucide-react";
import { styles } from "../styles.js";
import { signIn } from "../api/auth.js";
import Wordmark from "./Wordmark.jsx";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await signIn(email, password);
      // App.jsx's onAuthStateChange listener picks up the new session.
    } catch {
      setErr("Identifiants incorrects.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="brand-bg" style={{ ...styles.centerScreen, background: "var(--ink)" }}>
      <div style={{ width: "100%", maxWidth: 380, padding: 24 }}>
        <div style={{ marginBottom: 32, display: "flex", justifyContent: "center" }}>
          <Wordmark width={260} />
        </div>
        <div style={styles.panel}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "var(--gold)", letterSpacing: 1.5, marginBottom: 4 }}>
            ACCÈS — ESPACE CLIENT
          </div>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, color: "var(--paper)", margin: "0 0 20px" }}>
            Connexion
          </h1>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field icon={Mail} type="email" placeholder="email@exemple.fr" value={email} onChange={setEmail} />
            <Field icon={Lock} type="password" placeholder="Mot de passe" value={password} onChange={setPassword} />
            {err && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--red)", fontSize: 13 }}>
                <AlertCircle size={14} /> {err}
              </div>
            )}
            <button type="submit" disabled={busy} style={styles.primaryBtn}>
              {busy ? "Connexion…" : "Se connecter"}
              <ChevronRight size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, type, placeholder, value, onChange }) {
  return (
    <div style={{ position: "relative" }}>
      <Icon size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--slate)" }} />
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...styles.input, paddingLeft: 36 }}
      />
    </div>
  );
}
