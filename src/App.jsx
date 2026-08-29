import { useEffect, useState } from "react";
import { styles } from "./styles.js";
import { FONT_IMPORT } from "./constants.js";
import { getSession, onAuthStateChange, roleFromUser, signOut } from "./api/auth.js";
import LoadingScreen from "./components/LoadingScreen.jsx";
import LoginScreen from "./components/LoginScreen.jsx";
import AdminApp from "./components/AdminApp.jsx";
import ClientApp from "./components/ClientApp.jsx";

export default function App() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    getSession()
      .then((s) => { if (mounted) setSession(s); })
      .catch(() => { if (mounted) setError("Impossible de vérifier la session. Réessaie de recharger."); })
      .finally(() => { if (mounted) setReady(true); });

    const unsubscribe = onAuthStateChange((s) => {
      if (mounted) setSession(s);
    });

    return () => { mounted = false; unsubscribe(); };
  }, []);

  const role = session ? roleFromUser(session.user) : null;

  return (
    <div style={styles.appShell}>
      <style>{`
        ${FONT_IMPORT}
        * { box-sizing: border-box; }
        :root {
          --ink: #0D0D0D;
          --ink-2: #171512;
          --ink-3: #211E19;
          --gold: #C4975A;
          --paper: #F5F3EF;
          --amber: #D98E4C;
          --slate: #A69C89;
          --green: #7FB88A;
          --red: #E2725B;
        }
        body { margin: 0; }
        input, select, button, textarea { font-family: 'Inter', sans-serif; }
        input:focus, select:focus, textarea:focus, button:focus-visible {
          outline: 2px solid var(--gold); outline-offset: 2px;
        }
        .brand-bg {
          background-image: radial-gradient(rgba(196,151,90,0.16) 1px, transparent 1.4px);
          background-size: 42px 42px;
          background-position: 0 0;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .wheel-spin { animation: spin-slow 12s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .wheel-spin { animation: none; }
        }
        .ogen-scroll::-webkit-scrollbar { width: 8px; }
        .ogen-scroll::-webkit-scrollbar-thumb { background: rgba(196,151,90,0.25); border-radius: 8px; }
        @media (max-width: 760px) {
          .ogen-sidebar { display: none !important; }
          .ogen-topnav { display: flex !important; }
        }
      `}</style>

      {!ready ? (
        <LoadingScreen error={error} />
      ) : !session ? (
        <LoginScreen />
      ) : role === "admin" ? (
        <AdminApp onLogout={signOut} />
      ) : (
        <ClientApp clientId={session.user.id} onLogout={signOut} />
      )}
    </div>
  );
}
