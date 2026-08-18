"use client";
import { motion, AnimatePresence } from "motion/react";
import { C } from "@/lib/constants";
import type { Capsula } from "./capsulas";

export function CapsulaToast({
  capsula, onClose,
}: { capsula: Capsula | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {capsula && (
        <motion.div
          key={capsula.id}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 50, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            position: "fixed", right: 20, bottom: 90, zIndex: 900,
            maxWidth: 260, background: "#0d0d1a", border: `1.5px solid ${C.border}`,
            borderRadius: 12, padding: "12px 14px",
            boxShadow: "0 0 18px rgba(0,212,255,0.15)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: C.neon, letterSpacing: 0.5 }}>
              {capsula.icono} {capsula.titulo.toUpperCase()}
            </span>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}
            >
              ×
            </button>
          </div>
          <p style={{ color: "#e8eaf6", fontSize: 12, lineHeight: 1.4, margin: "0 0 6px" }}>{capsula.texto}</p>
          <p style={{ color: C.muted, fontSize: 10.5, lineHeight: 1.4, margin: 0 }}>{capsula.puente}</p>
          <div style={{ marginTop: 8, textAlign: "right", color: "#10b981", fontSize: 10, fontWeight: 800 }}>
            +{capsula.xp} XP
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
