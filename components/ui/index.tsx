"use client";
import { useEffect, useRef } from "react";
import { C, openWA } from "@/lib/constants";

/* ── WhatsApp icon ───────────────────────────────────────────── */
export const WaIco = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="#fff">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/* ── GlowBtn ─────────────────────────────────────────────────── */
interface GlowBtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  gradient?: string;
  glow?: string;
  style?: React.CSSProperties;
  full?: boolean;
  className?: string;
}
export const GlowBtn = ({
  children, onClick, disabled, gradient, glow, style = {}, full, className,
}: GlowBtnProps) => {
  const g  = gradient ?? "linear-gradient(135deg,#00d4ff22,#a855f722)";
  const gl = glow     ?? C.neon;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        width:       full ? "100%" : undefined,
        background:  disabled ? "rgba(255,255,255,0.05)" : g,
        color:       disabled ? "#444" : "#fff",
        border:      disabled ? "1px solid rgba(255,255,255,0.07)" : `1px solid ${gl}44`,
        borderRadius: 10,
        padding:     "10px 20px",
        fontWeight:  700,
        fontSize:    13,
        cursor:      disabled ? "default" : "pointer",
        boxShadow:   disabled ? "none" : `0 0 18px ${gl}33`,
        transition:  "all .2s",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform  = "translateY(-2px)";
          e.currentTarget.style.boxShadow = `0 4px 28px ${gl}55`;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform  = "";
        e.currentTarget.style.boxShadow = disabled ? "none" : `0 0 18px ${gl}33`;
      }}
    >
      {children}
    </button>
  );
};

/* ── WABtn ───────────────────────────────────────────────────── */
interface WABtnProps {
  name: string;
  label?: string;
  full?: boolean;
  style?: React.CSSProperties;
}
export const WABtn = ({ name, label = "Lo Quiero", full, style = {} }: WABtnProps) => (
  <button
    onClick={() => openWA(name)}
    style={{
      width:       full ? "100%" : undefined,
      background:  "linear-gradient(135deg,#25d366,#128c7e)",
      color:       "#fff",
      border:      "none",
      borderRadius: 10,
      padding:     "10px 16px",
      fontWeight:  700,
      fontSize:    13,
      cursor:      "pointer",
      display:     "flex",
      alignItems:  "center",
      justifyContent: "center",
      gap:         7,
      transition:  "transform .15s",
      ...style,
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "")}
  >
    <WaIco />
    {label}
  </button>
);

/* ── Card ────────────────────────────────────────────────────── */
interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  glow?: string;
  onClick?: () => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void;
}
export const Card = ({ children, style = {}, glow, onClick, onMouseEnter, onMouseLeave }: CardProps) => (
  <div
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    style={{
      background:    "rgba(8,6,28,0.8)",
      border:        `1px solid ${glow ? glow + "28" : C.borderSoft}`,
      borderRadius:  16,
      backdropFilter:"blur(16px)",
      boxShadow:     glow ? `0 0 24px ${glow}12` : "none",
      transition:    "all .2s",
      ...style,
    }}
  >
    {children}
  </div>
);

/* ── Chip ────────────────────────────────────────────────────── */
export const Chip = ({ children, color = C.neon, style = {} }: { children: React.ReactNode; color?: string; style?: React.CSSProperties }) => (
  <span
    style={{
      background:    `${color}14`,
      border:        `1px solid ${color}33`,
      color,
      borderRadius:  99,
      padding:       "2px 10px",
      fontSize:      10,
      fontWeight:    800,
      letterSpacing: .5,
      whiteSpace:    "nowrap",
      ...style,
    }}
  >
    {children}
  </span>
);

/* ── Particles canvas ────────────────────────────────────────── */
export const Particles = ({ count = 35 }: { count?: number }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    c.width  = c.offsetWidth;
    c.height = c.offsetHeight;
    const pts = Array.from({ length: count }, () => ({
      x:  Math.random() * c.width,
      y:  Math.random() * c.height,
      vx: (Math.random() - .5) * .3,
      vy: (Math.random() - .5) * .3,
      r:  Math.random() * 1.5 + .3,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width)  p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,212,255,.35)";
        ctx.fill();
      });
      pts.forEach((a, i) =>
        pts.slice(i + 1).forEach((b) => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 80) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,212,255,${.08 * (1 - d / 80)})`;
            ctx.lineWidth   = .5;
            ctx.stroke();
          }
        })
      );
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [count]);
  return (
    <canvas
      ref={ref}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
};
