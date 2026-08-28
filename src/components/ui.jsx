import { X, Check, Clock } from "lucide-react";
import { styles } from "../styles.js";

export function PageHeader({ eyebrow, title, action }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
      <div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "var(--gold)", letterSpacing: 1.5 }}>{eyebrow}</div>
        <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 26, color: "var(--paper)", margin: "4px 0 0" }}>{title}</h1>
      </div>
      {action}
    </div>
  );
}

export function Panel({ children }) {
  return <div style={{ ...styles.panel, marginTop: 24 }}>{children}</div>;
}

export function Muted({ children }) {
  return <div style={{ color: "var(--slate)", fontSize: 14 }}>{children}</div>;
}

export function EmptyState({ text }) {
  return (
    <div style={{ textAlign: "center", padding: "28px 16px", color: "var(--slate)", fontSize: 13.5, border: "1px dashed rgba(120,112,96,0.3)", borderRadius: 10 }}>
      {text}
    </div>
  );
}

export function Labeled({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: "var(--slate)" }}>
      {label}
      {children}
    </label>
  );
}

export function StatusPill({ status, onClick }) {
  const isPaid = status === "Payée";
  const Comp = onClick ? "button" : "div";
  return (
    <Comp onClick={onClick} style={{
      ...styles.pill,
      color: isPaid ? "var(--green)" : "var(--amber)",
      borderColor: isPaid ? "rgba(52,211,153,0.4)" : "rgba(255,176,32,0.4)",
      background: isPaid ? "rgba(52,211,153,0.08)" : "rgba(255,176,32,0.08)",
      cursor: onClick ? "pointer" : "default",
    }}>
      {isPaid ? <Check size={12} /> : <Clock size={12} />}
      {status}
    </Comp>
  );
}

export function ModalShell({ title, onClose, children }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: 18, color: "var(--paper)", margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={styles.iconBtn}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
