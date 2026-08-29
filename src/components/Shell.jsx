import { LogOut } from "lucide-react";
import { styles } from "../styles.js";
import Wordmark from "./Wordmark.jsx";

export default function Shell({ nav, activeNav, onNav, onLogout, subtitle, children }) {
  return (
    <div className="brand-bg" style={{ minHeight: "100vh", background: "var(--ink)", display: "flex" }}>
      <aside className="ogen-sidebar" style={styles.sidebar}>
        <div style={{ padding: "22px 20px 18px" }}>
          <Wordmark width={140} />
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: "var(--slate)", marginTop: 6, letterSpacing: 1 }}>
            {subtitle}
          </div>
        </div>
        <nav style={{ flex: 1, padding: "8px 12px" }}>
          {nav.map((item) => (
            <button
              key={item.key}
              onClick={() => onNav(item.key)}
              style={{
                ...styles.navItem,
                background: activeNav === item.key ? "rgba(196,151,90,0.1)" : "transparent",
                color: activeNav === item.key ? "var(--gold)" : "var(--paper)",
                borderLeft: activeNav === item.key ? "2px solid var(--gold)" : "2px solid transparent",
              }}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: 16 }}>
          <button onClick={onLogout} style={styles.logoutBtn}>
            <LogOut size={15} /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="ogen-topnav" style={{ display: "none", position: "fixed", top: 0, left: 0, right: 0, zIndex: 10, background: "var(--ink-2)", padding: "12px 16px", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(196,151,90,0.15)" }}>
        <Wordmark width={110} />
        <select value={activeNav} onChange={(e) => onNav(e.target.value)} style={{ ...styles.input, width: "auto", padding: "6px 10px" }}>
          {nav.map((item) => (
            <option key={item.key} value={item.key}>{item.label}</option>
          ))}
        </select>
        <button onClick={onLogout} style={{ ...styles.logoutBtn, padding: "6px 10px" }}>
          <LogOut size={14} />
        </button>
      </div>

      <main className="ogen-scroll" style={{ flex: 1, padding: "32px 40px", overflowY: "auto", maxHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
