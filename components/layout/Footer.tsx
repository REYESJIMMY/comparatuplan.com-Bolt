"use client";
import { Zap } from "lucide-react";
import { C, openWA } from "@/lib/constants";
import { WaIco } from "@/components/ui";

const WA_BTN_STYLE: React.CSSProperties = {
  background: "linear-gradient(135deg,#1aab58,#0d7a3e)",
  border: "1px solid rgba(37,211,102,0.2)",
  borderRadius: 9, padding: "8px 13px",
  color: "#fff", fontWeight: 700, fontSize: 11,
  cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
};

export const Footer = () => (
  <footer style={{ background: "rgba(4,4,15,0.99)", borderTop: `1px solid ${C.borderSoft}`, padding: "36px 20px 22px" }}>
    <div style={{ maxWidth: 1380, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 24, marginBottom: 28 }}>

        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "linear-gradient(135deg,#00d4ff,#0080ff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 14px #00d4ff44",
            }}>
              <Zap size={16} color="#fff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <span style={{ fontWeight: 900, fontSize: 14, color: "#fff" }}>Compara</span>
                <span style={{ fontWeight: 900, fontSize: 14, background: "linear-gradient(90deg,#00d4ff,#0080ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tu</span>
                <span style={{ fontWeight: 900, fontSize: 14, color: "#ff6b35" }}>Plan</span>
                <span style={{ fontWeight: 700, fontSize: 10, color: "rgba(0,212,255,0.5)" }}>.com</span>
              </div>
              <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 1.5, color: "rgba(0,212,255,0.3)" }}>COLOMBIA · TELCO #1</div>
            </div>
          </div>
          <p style={{ color: C.muted, fontSize: 11, lineHeight: 1.6, maxWidth: 190 }}>
            La plataforma #1 en Colombia para comparar y contratar planes de telecomunicaciones.
          </p>
        </div>

        {/* Link columns */}
        {[
          { title: "Servicios", links: ["Internet Hogar", "Planes Móviles", "TV + Streaming", "Combos"] },
          { title: "Empresas",  links: ["PBX Virtual", "WhatsApp IA", "VoIP", "Fibra Dedicada"] },
          { title: "Legal",     links: ["Términos y Condiciones", "Política de Privacidad", "Habeas Data"] },
        ].map((col) => (
          <div key={col.title}>
            <div style={{ color: "rgba(0,212,255,0.3)", fontSize: 8.5, fontWeight: 800, letterSpacing: 1.5, marginBottom: 10 }}>
              {col.title.toUpperCase()}
            </div>
            {col.links.map((l) => (
              <a
                key={l} href="#"
                style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 600, textDecoration: "none", marginBottom: 7, transition: "color .14s" }}
                onMouseEnter={(e: any) => e.currentTarget.style.color = C.neon}
                onMouseLeave={(e: any) => e.currentTarget.style.color = C.muted}
              >{l}</a>
            ))}
          </div>
        ))}

        {/* Contact */}
        <div>
          <div style={{ color: "rgba(0,212,255,0.3)", fontSize: 8.5, fontWeight: 800, letterSpacing: 1.5, marginBottom: 10 }}>CONTACTO</div>
          <button onClick={() => openWA("consulta")} style={WA_BTN_STYLE}>
            <WaIco />+57 305 787 6992
          </button>
          <p style={{ color: C.muted, fontSize: 10 }}>Bogotá, Colombia 🇨🇴<br />Atención 24/7</p>
        </div>
      </div>

      <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(0,212,255,0.2),transparent)", marginBottom: 14 }} />
      <p style={{ color: "rgba(0,212,255,0.2)", fontSize: 10, textAlign: "center" }}>
        © 2025 ComparaTuPlan.com · Todos los derechos reservados · Bogotá, Colombia
      </p>
    </div>
  </footer>
);
