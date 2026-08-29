import { styles } from "../styles.js";
import Wordmark from "./Wordmark.jsx";

export default function LoadingScreen({ error }) {
  return (
    <div style={{ ...styles.centerScreen, flexDirection: "column", gap: 12 }}>
      <Wordmark width={150} />
      <div style={{ color: "var(--slate)", fontFamily: "'Inter', sans-serif", fontSize: 13 }}>
        {error ? error : "Chargement de la plateforme…"}
      </div>
    </div>
  );
}
