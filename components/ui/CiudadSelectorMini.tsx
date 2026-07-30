"use client";
/**
 * CiudadSelectorMini
 * -------------------
 * Versión reducida del Paso 1 de "Consulta Cobertura": solo
 * Departamento + Ciudad. Se auto-oculta si ya hay ubicación
 * guardada (venga del flujo de Cobertura o de una visita anterior).
 *
 * Uso previsto:
 *   - Dentro del tab "Perfil" de Misión 3D, antes del selector de perfil digital
 *   - Como paso inicial de Nexus si el usuario pregunta por planes/cobertura
 *   - En el catálogo, antes de mostrar resultados filtrados
 */
import { useState } from "react";
import { useUbicacion } from "@/context/UbicacionContext";
// import { DEPARTAMENTOS, MUNICIPIOS_POR_DEPARTAMENTO } from "@/lib/constants";
// ^ reutilizar la misma fuente de datos que ya usa el flujo de Cobertura,
//   no duplicar la lista de departamentos/municipios.

export function CiudadSelectorMini({ onListo }: { onListo?: () => void }) {
  const { ubicacion, setUbicacionMinima, tieneUbicacionMinima } = useUbicacion();
  const [departamento, setDepartamento] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [editando, setEditando] = useState(false);

  // Ya sabemos dónde está — mostramos un chip de confirmación, no el formulario
  if (tieneUbicacionMinima && !editando) {
    return (
      <div className="ciudad-chip" role="status">
        <span>📍 {ubicacion!.ciudad}, {ubicacion!.departamento}</span>
        <button type="button" onClick={() => setEditando(true)}>
          Cambiar
        </button>
      </div>
    );
  }

  const puedeContinuar = departamento.trim() !== "" && ciudad.trim() !== "";

  return (
    <div className="ciudad-selector-mini">
      <p className="label">¿Desde dónde nos visitas?</p>
      <p className="hint">Así te mostramos solo planes que sí llegan a tu zona</p>

      {/* Reemplazar por los mismos <select> con datos reales del flujo de Cobertura */}
      <select value={departamento} onChange={(e) => setDepartamento(e.target.value)}>
        <option value="">Selecciona tu departamento</option>
      </select>
      <select value={ciudad} onChange={(e) => setCiudad(e.target.value)} disabled={!departamento}>
        <option value="">Selecciona tu municipio</option>
      </select>

      <button
        type="button"
        disabled={!puedeContinuar}
        onClick={() => {
          setUbicacionMinima(departamento, ciudad);
          setEditando(false);
          onListo?.();
        }}
      >
        Continuar
      </button>
    </div>
  );
}
