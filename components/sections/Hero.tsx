"use client";
import { Check, Search, Zap, Shield, BookOpen, ShoppingCart, ArrowRight, MapPin, ListChecks, MessageCircle } from "lucide-react";
import { C, openWA } from "@/lib/constants";
import { GlowBtn, WABtn, Card, Chip, Particles } from "@/components/ui";
import { useTheme } from "@/context/ThemeContext";

/* ── Hero ────────────────────────────────────────────────────── */
interface HeroProps {
  onGame:    () => void;
  onMovil:   () => void;
  onSegment: () => void;
  addToCart: (item: any) => void;
}

export const Hero = ({ onGame, onMovil, onSegment }: HeroProps) => {
  const { theme } = useTheme();
  const L = theme === "light";

  return (
    <section style={{
      position: "relative", borderRadius: 20, overflow: "hidden",
      border: `1px solid ${L ? "#e2e8f0" : C.border}`,
      background: L ? "#ffffff" : "rgba(6,4,22,0.7)",
      padding: "clamp(28px,5vw,48px) clamp(16px,4vw,32px) 40px",
      minHeight: 300,
      boxShadow: L ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
    }}>
      {!L && <Particles count={30} />}
      <div style={{ position: "relative", zIndex: 2 }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: L ? "#e8f5e9" : "rgba(0,212,255,0.08)",
          border: `1px solid ${L ? "#a5d6a7" : C.border}`,
          borderRadius: 99, padding: "5px 14px", marginBottom: 16,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: L ? "#3ab54a" : C.green, display: "inline-block", animation: "blink 1.5s infinite" }} />
          <span style={{ color: L ? "#2e7d32" : C.neon, fontSize: 11, fontWeight: 700 }}>+1.500 usuarios ahorran cada mes</span>
        </div>

        {/* H1 */}
        <h1 style={{ fontSize: "clamp(1.7rem,4vw,2.7rem)", fontWeight: 900, lineHeight: 1.15, marginBottom: 12, color: L ? "#0d1b2e" : "#fff", letterSpacing: -1 }}>
          Compara y desbloquea el<br />
          <span className="hero-gradient-text">
            máximo potencial de tu red,
          </span>
          <span style={{ display: "block" }}>todo desde un solo lugar</span>
        </h1>

        <p style={{ fontSize: 14, color: L ? "#475569" : "rgba(180,195,230,0.75)", marginBottom: 26, maxWidth: 460, lineHeight: 1.65 }}>
          Ahorra hasta un <strong style={{ color: L ? "#0d1b2e" : "#fff" }}>40% en tu factura</strong>. Análisis inteligente de planes en segundos.
        </p>

        {/* CTAs — 3 de igual peso */}
        <div className="hero-actions" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "stretch", marginBottom: 14 }}>
          <div>
            <GlowBtn onClick={onGame} gradient={L ? "linear-gradient(135deg,#1a56db,#3b82f6)" : "linear-gradient(135deg,#6600cc,#a855f7)"} glow={L ? "#1a56db" : C.neon2} style={{ borderRadius: 11, padding: "11px 22px", fontSize: 14 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}><Zap size={14} />Diseñar hogar digital</span>
            </GlowBtn>
            <div style={{ marginTop: 5, color: L ? "#1a56db" : C.neon2, fontSize: 10, fontWeight: 700, textAlign: "center" }}>Simulador interactivo</div>
          </div>

          <div>
            <GlowBtn onClick={() => window.location.href = "/planes"} gradient={L ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#059669,#10b981)"} glow={L ? "#059669" : C.green} style={{ borderRadius: 11, padding: "11px 22px", fontSize: 14 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}><ListChecks size={14} />Comparador de planes</span>
            </GlowBtn>
            <div style={{ marginTop: 5, color: L ? "#059669" : C.green, fontSize: 10, fontWeight: 700, textAlign: "center" }}>Explora y compara</div>
          </div>

          <div>
            <GlowBtn onClick={onSegment} gradient="linear-gradient(135deg,#0070cc,#0050aa)" glow={L ? "#1a56db" : C.neon} style={{ borderRadius: 11, padding: "11px 22px", fontSize: 14 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}><MapPin size={14} />Consulta tu cobertura</span>
            </GlowBtn>
            <div style={{ marginTop: 5, color: L ? "#3ab54a" : C.green, fontSize: 10, fontWeight: 700, textAlign: "center" }}>Hogar · Móvil</div>
          </div>
        </div>

        {/* WhatsApp — link secundario, ya no botón grande */}
        <button
          onClick={() => openWA("asesoría personalizada")}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 0,
            display: "flex", alignItems: "center", gap: 6,
            color: L ? "#3ab54a" : C.green, fontSize: 12, fontWeight: 600,
          }}
        >
          <MessageCircle size={13} />¿Prefieres hablar con un asesor? Escríbenos por WhatsApp
        </button>
      </div>
    </section>
  );
};
