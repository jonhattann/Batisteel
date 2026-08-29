import { Anchor } from "lucide-react";
import { STAGES } from "../constants.js";
import { WHEEL_ICON } from "../assets/brand.js";

// Étape franchie = ancrée (Anchor). Étape en cours = à la roue
// (icône roue animée). Étape à venir = simple repère creux.
export default function VoyageProgress({ stageIndex, stageProgress }) {
  const w = 760, pad = 60;
  const step = (w - pad * 2) / (STAGES.length - 1);
  const travelPct = Math.min(stageIndex + stageProgress / 100, STAGES.length - 1) / (STAGES.length - 1) * 100;

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ position: "relative", minWidth: w, height: 178 }}>
        <div style={{
          position: "absolute", left: pad, right: pad, top: 33, height: 0,
          borderTop: "1.5px dashed rgba(196,151,90,0.3)",
        }} />
        <div style={{
          position: "absolute", left: pad, top: 32, height: 2,
          width: `calc((100% - ${pad * 2}px) * ${travelPct / 100})`,
          background: "var(--gold)",
        }} />

        {STAGES.map((s, i) => {
          const leftPx = pad + step * i;
          const done = i < stageIndex;
          const current = i === stageIndex;
          const color = done ? "var(--green)" : current ? "var(--gold)" : "rgba(166,156,137,0.55)";
          return (
            <div
              key={s.code}
              style={{
                position: "absolute", top: 0, left: leftPx, transform: "translateX(-50%)",
                display: "flex", flexDirection: "column", alignItems: "center", width: 108,
              }}
            >
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: 2, color, marginBottom: 6 }}>
                {s.code}
              </div>
              <div style={{
                width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                border: `1.5px solid ${color}`, background: "var(--ink)", flexShrink: 0,
              }}>
                {done ? (
                  <Anchor size={15} color="var(--green)" />
                ) : current ? (
                  <img src={WHEEL_ICON} className="wheel-spin" width={18} height={18} alt="" />
                ) : (
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(166,156,137,0.55)" }} />
                )}
              </div>
              <div style={{
                marginTop: 10, fontSize: 11.5, textAlign: "center", lineHeight: 1.35,
                color: current ? "var(--paper)" : "var(--slate)", fontWeight: current ? 600 : 400,
              }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
