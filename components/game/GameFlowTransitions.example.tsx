"use client";

// EJEMPLO DE REFERENCIA — no reemplaza tu GameFlow.tsx real.
// Muestra el patrón de integración de "motion" (Framer Motion) sobre
// el mismo modelo de estado que ya usas: nivel 0-3 (Perfil, Casa, Consumo, Plan).
//
// Instalar: npm install motion
// Import: import { motion, AnimatePresence } from "motion/react";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type Nivel = 0 | 1 | 2 | 3;

const NIVELES = ["Perfil", "Casa", "Consumo", "Plan"] as const;

// ---------------------------------------------------------------------
// 1) Barra de XP animada — sube automáticamente al cambiar de nivel.
//    Reemplaza tu barra de progreso actual del GameFlow tal cual.
// ---------------------------------------------------------------------
function XpBar({ nivel }: { nivel: Nivel }) {
  const porcentaje = ((nivel + 1) / NIVELES.length) * 100;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          flex: 1,
          height: 8,
          borderRadius: 99,
          overflow: "hidden",
          background: "rgba(255,255,255,0.08)",
        }}
      >
        <motion.div
          animate={{ width: `${porcentaje}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ height: "100%", background: "var(--accent, #7f5af0)" }}
        />
      </div>
      <span style={{ fontSize: 13, opacity: 0.7 }}>
        Nivel {nivel + 1} / {NIVELES.length}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------
// 2) Transición entre niveles — desliza según la dirección de avance,
//    igual que tu navegación por tabs actual (Perfil→Casa→Consumo→Plan).
//    "direction" evita que retroceder se sienta igual que avanzar.
// ---------------------------------------------------------------------
const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -60 : 60, opacity: 0 }),
};

function NivelPanel({
  nivel,
  direction,
  children,
}: {
  nivel: Nivel;
  direction: number;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={nivel}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.28, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------
// 3) Reveal escalonado — para tu paso "Plan" con las 3 tarjetas
//    (Mejor Oferta / Mejor Velocidad / Mejor Precio). Cada tarjeta
//    entra 80ms después de la anterior, sensación de "cofres abriéndose".
// ---------------------------------------------------------------------
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1 },
};

function PlanesReveal({ planes }: { planes: { nombre: string; precio: string }[] }) {
  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="show"
      style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}
    >
      {planes.map((p) => (
        <motion.div
          key={p.nombre}
          variants={cardVariants}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{ padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.05)" }}
        >
          <p style={{ fontWeight: 500, margin: 0 }}>{p.nombre}</p>
          <p style={{ fontSize: 20, margin: "4px 0 0" }}>{p.precio}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ---------------------------------------------------------------------
// Ejemplo de orquestador — así se conecta con tu setLvl() existente.
// En tu GameFlow.tsx real, la lógica de negocio (cálculo de Mbps,
// smartComparator, etc.) no cambia; solo se envuelve la salida visual.
// ---------------------------------------------------------------------
export default function GameFlowExample() {
  const [nivel, setNivel] = useState<Nivel>(0);
  const [direction, setDirection] = useState(1);

  function irANivel(destino: Nivel) {
    setDirection(destino > nivel ? 1 : -1);
    setNivel(destino);
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <XpBar nivel={nivel} />

      <div style={{ display: "flex", gap: 6, margin: "16px 0" }}>
        {NIVELES.map((label, i) => (
          <button key={label} onClick={() => irANivel(i as Nivel)}>
            {label}
          </button>
        ))}
      </div>

      <NivelPanel nivel={nivel} direction={direction}>
        {nivel === 3 ? (
          <PlanesReveal
            planes={[
              { nombre: "Mejor oferta", precio: "$139.900" },
              { nombre: "Mejor velocidad", precio: "$57.900" },
              { nombre: "Mejor precio", precio: "$29.900" },
            ]}
          />
        ) : (
          <p>Contenido del nivel: {NIVELES[nivel]}</p>
        )}
      </NivelPanel>
    </div>
  );
}
