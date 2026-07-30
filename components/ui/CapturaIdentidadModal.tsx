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
// import { supabase } from "@/lib/supabase";

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
  const [enviando, setEnviando] = useState(false);
  const copy = COPY[origen];

  const puedeEnviar = nombre.trim() !== "" && /\S+@\S+\.\S+/.test(correo);

  const registrar = async () => {
    setEnviando(true);
    try {
      // Insert liviano en tabla `leads` — NO es el signup completo de AuthContext.
      // Se puede promover a cuenta completa después sin pedirle datos de nuevo.
      // await supabase.from("leads").insert({ nombre, correo, origen });
      onRegistrado?.({ nombre, correo });
      onClose();
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

      <button disabled={!puedeEnviar || enviando} onClick={registrar}>
        {enviando ? "Guardando..." : "Registrarme y recibir recompensa"}
      </button>
      <button className="secundario" onClick={onClose}>
        Continuar sin registrarme
      </button>
    </div>
  );
}
