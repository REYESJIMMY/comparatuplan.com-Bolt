"use client";
/**
 * CapturaIdentidadModal
 * -----------------------
 * Se dispara DESPUÉS de mostrar el resultado (comparativo o
 * recomendación), nunca antes. El usuario siempre puede cerrarlo
 * y seguir viendo su resultado sin registrarse.
 *
 * Uso previsto — el mismo componente, distinto `origen` para el copy:
 *   - Misión 3D, tab "Plan"        -> origen="mision3d"
 *   - Catálogo, vista comparativo  -> origen="comparativo"
 *   - Nexus, tras dar recomendación -> origen="nexus"
 */
import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface Props {
  origen: "mision3d" | "comparativo" | "nexus";
  onClose: () => void;
  onRegistrado?: (lead: { nombre: string; correo: string }) => void;
}

const COPY: Record<Props["origen"], { titulo: string; sub: string }> = {
  mision3d: {
    titulo: "Guarda tu plan ideal",
    sub: "Regístrate y te avisamos si baja de precio — además recibes tu recompensa de bienvenida.",
  },
  comparativo: {
    titulo: "Guarda este comparativo",
    sub: "Regístrate para volver a verlo cuando quieras y recibir alertas de precio.",
  },
  nexus: {
    titulo: "¿Quieres que te avise si aparece algo mejor?",
    sub: "Déjame tu correo y te aviso — sin spam, solo cuando haya un mejor plan para ti.",
  },
};

export function CapturaIdentidadModal({ origen, onClose, onRegistrado }: Props) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [autoriza, setAutoriza] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(false);
  const copy = COPY[origen];

  const puedeEnviar = nombre.trim() !== "" && /\S+@\S+\.\S+/.test(correo) && autoriza;

  const registrar = async () => {
    if (!puedeEnviar) return;
    setEnviando(true);
    setError(false);
    try {
      const { error: err } = await supabase.from("leads").insert({
        nombre,
        email: correo,
        origen,
        autorizo_datos: true,
        autorizado_at: new Date().toISOString(),
      });
      if (err) throw err;
      onRegistrado?.({ nombre, correo });
      onClose();
    } catch (e) {
      console.error("Error guardando lead:", e);
      setError(true);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="captura-identidad-modal" role="dialog" aria-modal="true">
      <button className="cerrar" onClick={onClose} aria-label="Cerrar y seguir sin registrarme">
        ✕
      </button>
      <h3>{copy.titulo}</h3>
      <p>{copy.sub}</p>

      <input
        placeholder="Tu nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <input
        placeholder="Tu correo"
        type="email"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
      />

      <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11.5, lineHeight: 1.5, margin: "10px 0", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={autoriza}
          onChange={(e) => setAutoriza(e.target.checked)}
          style={{ marginTop: 2, flexShrink: 0, cursor: "pointer" }}
        />
        <span>
          Autorizo el tratamiento de mis datos personales conforme a la{" "}
          <a
            href="/politica-de-datos"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Política de Tratamiento de Datos Personales
          </a>{" "}
          (Ley 1581 de 2012)
        </span>
      </label>

      {error && (
        <p style={{ color: "#ef4444", fontSize: 11, margin: "0 0 8px" }}>
          No pudimos guardar tu registro. Intenta de nuevo.
        </p>
      )}

      <button disabled={!puedeEnviar || enviando} onClick={registrar}>
        {enviando ? "Guardando..." : "Registrarme y recibir recompensa"}
      </button>
      <button className="secundario" onClick={onClose}>
        Continuar sin registrarme
      </button>
    </div>
  );
}
