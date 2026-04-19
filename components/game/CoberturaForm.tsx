"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { C } from "@/lib/constants";
import { GlowBtn } from "@/components/ui";

// ── Datos geográficos Colombia ────────────────────────────────
const DEPARTAMENTOS: Record<string, string[]> = {
  "Bogotá D.C.":     ["Bogotá"],
  "Antioquia":       ["Medellín","Bello","Itagüí","Envigado","Sabaneta","Rionegro","Copacabana","Apartadó"],
  "Valle del Cauca": ["Cali","Palmira","Buenaventura","Tuluá","Cartago","Buga"],
  "Atlántico":       ["Barranquilla","Soledad","Malambo","Sabanalarga","Galapa"],
  "Santander":       ["Bucaramanga","Floridablanca","Girón","Piedecuesta","Barrancabermeja"],
  "Bolívar":         ["Cartagena","Magangué","Turbaco"],
  "Cundinamarca":    ["Soacha","Chía","Zipaquirá","Fusagasugá","Facatativá","Mosquera","Madrid"],
  "Nariño":          ["Pasto","Tumaco","Ipiales","Túquerres"],
  "Risaralda":       ["Pereira","Dosquebradas","Santa Rosa de Cabal"],
  "Quindío":         ["Armenia","Calarcá","La Tebaida"],
  "Caldas":          ["Manizales","Villamaría","Chinchiná"],
  "Huila":           ["Neiva","Pitalito","Garzón"],
  "Tolima":          ["Ibagué","Espinal","Melgar","Honda"],
  "Córdoba":         ["Montería","Lorica","Sahagún"],
  "Meta":            ["Villavicencio","Acacías","Granada"],
  "Magdalena":       ["Santa Marta","Ciénaga","Fundación"],
  "Cauca":           ["Popayán","Santander de Quilichao","Puerto Tejada"],
  "Norte de Santander": ["Cúcuta","Ocaña","Pamplona","Villa del Rosario"],
  "Boyacá":          ["Tunja","Duitama","Sogamoso","Chiquinquirá"],
  "Cesar":           ["Valledupar","Aguachica","Codazzi"],
  "Sucre":           ["Sincelejo","Sampués","Corozal"],
  "Chocó":           ["Quibdó"],
  "Arauca":          ["Arauca","Saravena"],
  "Casanare":        ["Yopal","Aguazul","Tauramena"],
  "La Guajira":      ["Riohacha","Maicao","Uribia"],
  "Putumayo":        ["Mocoa","Puerto Asís"],
  "Caquetá":         ["Florencia"],
  "Amazonas":        ["Leticia"],
  "Vichada":         ["Puerto Carreño"],
  "Guainía":         ["Inírida"],
  "Guaviare":        ["San José del Guaviare"],
  "Vaupés":          ["Mitú"],
};

export interface UbicacionData {
  departamento: string;
  municipio:    string;
  barrio:       string;
  direccion:    string;
  estrato:      number;
}

interface Props {
  onContinuar: (data: UbicacionData) => void;
  onCancel:    () => void;
}

export const CoberturaForm = ({ onContinuar, onCancel }: Props) => {
  const [depto,     setDepto]     = useState("");
  const [municipio, setMunicipio] = useState("");
  const [barrio,    setBarrio]    = useState("");
  const [direccion, setDireccion] = useState("");
  const [estrato,   setEstrato]   = useState(0);
  const [guardando, setGuardando] = useState(false);

  const municipios = depto ? (DEPARTAMENTOS[depto] ?? []) : [];
  const listo = depto && municipio && estrato > 0;

  const handleContinuar = async () => {
    if (!listo) return;
    setGuardando(true);

    // Guardar consulta en Supabase para métricas
    await supabase.from("consultas_cobertura").insert({
      departamento: depto,
      municipio,
      estrato,
      direccion: direccion || barrio || null,
      fuente: "hero",
    }).then(() => {}).catch(() => {});

    setGuardando(false);
    onContinuar({ departamento: depto, municipio, barrio, direccion, estrato });
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(4,4,15,0.93)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999, padding: "1rem",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{
        background: "linear-gradient(160deg,#06041a,#0a0620)",
        border: `1px solid ${C.border}`,
        borderRadius: 20, padding: "1.75rem",
        maxWidth: 500, width: "100%",
        maxHeight: "90vh", overflowY: "auto",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>📍</div>
          <div style={{ color: C.neon, fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 6 }}>
            PASO 1 DE 2 — UBICACIÓN
          </div>
          <h2 style={{ fontWeight: 900, fontSize: "1.4rem", color: "#fff", marginBottom: 6 }}>
            ¿Dónde estás ubicado?
          </h2>
          <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>
            Necesitamos tu ubicación para mostrarte los planes disponibles en tu zona
          </p>
        </div>

        {/* Progreso */}
        <div style={{ display: "flex", gap: 6, marginBottom: "1.5rem" }}>
          {["Ubicación", "Tipo de plan", "Resultados"].map((l, i) => (
            <div key={l} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i === 0 ? C.neon : "rgba(255,255,255,0.08)",
            }} />
          ))}
        </div>

        {/* Formulario */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Departamento */}
          <div>
            <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>
              DEPARTAMENTO *
            </label>
            <select
              value={depto}
              onChange={(e) => { setDepto(e.target.value); setMunicipio(""); }}
              style={{
                width: "100%", background: "#1a1a2e",
                border: `1px solid ${depto ? C.neon : "rgba(255,255,255,0.1)"}`,
                borderRadius: 10, padding: "11px 14px",
                color: depto ? "#fff" : "rgba(255,255,255,0.3)",
                fontSize: 14, cursor: "pointer", appearance: "none",
              }}
            >
              <option value="">Selecciona tu departamento</option>
              {Object.keys(DEPARTAMENTOS).sort().map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Municipio */}
          <div>
            <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>
              MUNICIPIO / CIUDAD *
            </label>
            <select
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              disabled={!depto}
              style={{
                width: "100%", background: "#1a1a2e",
                border: `1px solid ${municipio ? C.neon : "rgba(255,255,255,0.1)"}`,
                borderRadius: 10, padding: "11px 14px",
                color: municipio ? "#fff" : "rgba(255,255,255,0.3)",
                fontSize: 14, cursor: depto ? "pointer" : "not-allowed",
                opacity: depto ? 1 : 0.5, appearance: "none",
              }}
            >
              <option value="">Selecciona tu municipio</option>
              {municipios.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Barrio */}
          <div>
            <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>
              BARRIO <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400 }}>(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ej: El Poblado, Chapinero, Laureles..."
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
              style={{
                width: "100%", background: "#1a1a2e",
                border: `1px solid ${barrio ? C.neon : "rgba(255,255,255,0.1)"}`,
                borderRadius: 10, padding: "11px 14px",
                color: "#fff", fontSize: 14, outline: "none",
              }}
            />
          </div>

          {/* Dirección */}
          <div>
            <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: 0.5 }}>
              DIRECCIÓN <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 400 }}>(opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Calle 72 # 10-34, Apto 501"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              style={{
                width: "100%", background: "#1a1a2e",
                border: `1px solid ${direccion ? C.neon : "rgba(255,255,255,0.1)"}`,
                borderRadius: 10, padding: "11px 14px",
                color: "#fff", fontSize: 14, outline: "none",
              }}
            />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 4, display: "block" }}>
              El operador la usará para confirmar cobertura exacta al momento de contratar
            </span>
          </div>

          {/* Estrato */}
          <div>
            <label style={{ display: "block", color: C.muted, fontSize: 11, fontWeight: 700, marginBottom: 10, letterSpacing: 0.5 }}>
              ESTRATO SOCIOECONÓMICO *
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
              {[1,2,3,4,5,6].map((e) => (
                <button
                  key={e}
                  onClick={() => setEstrato(e)}
                  style={{
                    background: estrato === e ? `${C.neon}18` : "#1a1a2e",
                    border: `2px solid ${estrato === e ? C.neon : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 10, padding: "12px 0",
                    cursor: "pointer", transition: "all .18s",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", gap: 2,
                  }}
                >
                  <span style={{ color: estrato === e ? C.neon : "#fff", fontWeight: 800, fontSize: 18 }}>{e}</span>
                  <span style={{ color: C.muted, fontSize: 9 }}>Estrato</span>
                </button>
              ))}
            </div>
            {estrato > 0 && estrato <= 2 && (
              <div style={{ marginTop: 8, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "#10b981" }}>
                💡 Estrato {estrato} — Puedes acceder a planes sociales con descuentos especiales
              </div>
            )}
          </div>

        </div>

        {/* Botones */}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button
            onClick={onCancel}
            style={{
              padding: "11px 20px", borderRadius: 10,
              border: `1px solid rgba(255,255,255,0.08)`,
              background: "transparent", color: C.muted,
              fontSize: 13, cursor: "pointer", fontWeight: 600,
            }}
          >
            Cancelar
          </button>
          <GlowBtn
            onClick={handleContinuar}
            disabled={!listo || guardando}
            gradient="linear-gradient(135deg,#0070cc,#0050aa)"
            glow={C.neon}
            style={{ flex: 1, borderRadius: 10, padding: "11px 0", fontSize: 14 }}
          >
            {guardando ? "⏳ Guardando..." : "Continuar → Elegir tipo de plan"}
          </GlowBtn>
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.15)", fontSize: 10, marginTop: 12 }}>
          * Campos obligatorios · Datos protegidos bajo Ley 1581 de 2012
        </p>
      </div>
    </div>
  );
};
