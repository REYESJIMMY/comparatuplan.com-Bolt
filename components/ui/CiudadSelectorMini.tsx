"use client";
/**
 * CiudadSelectorMini
 * -------------------
 * Versión reducida del Paso 1 de CoberturaForm: solo Departamento +
 * Municipio, usando la MISMA fuente de datos (lib/colombia.ts) que
 * CoberturaForm — nada duplicado.
 *
 * Se auto-oculta si ya hay ubicación guardada (venga de CoberturaForm
 * o de una visita anterior). Sin botón propio: guarda al elegir
 * municipio; el avance real lo controla el flujo que lo use (ej. el
 * botón "Siguiente → Diseñar Casa" de GameFlow).
 */
import { useState } from "react";
import { useUbicacion } from "@/context/UbicacionContext";
import { C } from "@/lib/constants";
import { DEPARTAMENTOS } from "@/lib/colombia";

const selectStyle = (activo: boolean): React.CSSProperties => ({
  width: "100%",
  background: "#1a1a2e",
  border: `1px solid ${activo ? C.neon : "rgba(255,255,255,0.1)"}`,
  borderRadius: 10,
  padding: "10px 12px",
  color: activo ? "#fff" : "rgba(255,255,255,0.3)",
  fontSize: 13,
  fontWeight: 600,
  outline: "none",
  cursor: "pointer",
  appearance: "none",
});

export function CiudadSelectorMini({ onListo }: { onListo?: () => void }) {
  const { ubicacion, setUbicacionMinima, tieneUbicacionMinima } = useUbicacion();
  const [departamento, setDepartamento] = useState("");
  const [editando, setEditando] = useState(false);

  const municipios = departamento ? (DEPARTAMENTOS[departamento] ?? []) : [];

  if (tieneUbicacionMinima && !editando) {
    return (
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(0,212,255,0.05)", border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "10px 14px", marginBottom: 18,
        }}
      >
        <span style={{ color: "#fff", fontSize: 12.5, fontWeight: 700 }}>
          📍 {ubicacion!.municipio}, {ubicacion!.departamento}
        </span>
        <button
          type="button"
          onClick={() => setEditando(true)}
          style={{
            background: "transparent", border: `1px solid rgba(255,255,255,0.1)`,
            borderRadius: 8, padding: "5px 12px", color: C.neon,
            fontSize: 11, fontWeight: 700, cursor: "pointer",
          }}
        >
          Cambiar
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`,
        borderRadius: 14, padding: "16px 18px", marginBottom: 20,
      }}
    >
      <div style={{ color: C.neon, fontWeight: 800, fontSize: 13, marginBottom: 2 }}>
        📍 ¿Desde dónde nos visitas?
      </div>
      <div style={{ color: C.muted, fontSize: 11, marginBottom: 12 }}>
        Así te mostramos solo planes que sí llegan a tu zona
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <select
          style={selectStyle(!!departamento)}
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
        >
          <option value="">Departamento</option>
          {Object.keys(DEPARTAMENTOS).sort().map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          style={{ ...selectStyle(false), opacity: departamento ? 1 : 0.5, cursor: departamento ? "pointer" : "not-allowed" }}
          disabled={!departamento}
          value=""
          onChange={(e) => {
            const municipio = e.target.value;
            if (!municipio) return;
            setUbicacionMinima(departamento, municipio);
            onListo?.();
          }}
        >
          <option value="">Municipio</option>
          {municipios.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
