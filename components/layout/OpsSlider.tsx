"use client";
import { C, OPS } from "@/lib/constants";

export const OpsSlider = () => {
  const doubled = [...OPS, ...OPS];
  return (
    <div style={{
      overflow: "hidden", position: "relative", padding: "14px 0",
      background: "rgba(4,4,15,0.9)",
      borderTop:    `1px solid ${C.borderSoft}`,
      borderBottom: `1px solid ${C.borderSoft}`,
    }}>
      {/* Fade edges */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 60, background: "linear-gradient(90deg,#04040f,transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 60, background: "linear-gradient(270deg,#04040f,transparent)", zIndex: 2, pointerEvents: "none" }} />

      <div style={{ display: "flex", gap: 12, animation: "slideLeft 28s linear infinite", width: "max-content" }}>
        {doubled.map((op, i) => (
          <div
            key={i}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: `${op.c}10`, border: `1px solid ${op.c}28`,
              borderRadius: 99, padding: "6px 16px", flexShrink: 0,
              cursor: "default", transition: "all .2s", whiteSpace: "nowrap",
            }}
            onMouseEnter={(e: any) => { e.currentTarget.style.background = `${op.c}22`; e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={(e: any) => { e.currentTarget.style.background = `${op.c}10`; e.currentTarget.style.transform = ""; }}
          >
            <span style={{ fontSize: 12 }}>{op.e}</span>
            <span style={{ color: op.c, fontWeight: 700, fontSize: 11.5 }}>{op.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
