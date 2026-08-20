"use client";
import { C } from "@/lib/constants";

export function Nexi({ emoji = "🤖" }: { emoji?: string }) {
  return (
    <div style={{ position: "fixed", left: 20, bottom: 20, zIndex: 950, width: 56, height: 56 }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        border: `2px solid ${C.neon}`, opacity: 0.5,
        animation: "nexi-ping 2.2s ease-out infinite",
      }} />
      <div style={{
        position: "absolute", inset: 6, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, #12123a, #05050f)",
        border: `2.5px solid ${C.neon}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24,
        boxShadow: "0 0 18px rgba(0,212,255,0.35), inset 0 0 10px rgba(0,212,255,0.15)",
        animation: "nexi-float 2.6s ease-in-out infinite",
      }}>
        {emoji}
      </div>
      <style>{`
        @keyframes nexi-ping { 0% { transform: scale(1); opacity: .5; } 100% { transform: scale(1.35); opacity: 0; } }
        @keyframes nexi-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      `}</style>
    </div>
  );
}
