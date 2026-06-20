"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { C } from "@/lib/constants";

const WA_NUMBER = "573057876992";

interface OfertaHot {
  id: number;
  titulo: string;
  operador: string | null;
  descripcion: string | null;
  precio: number | null;
  precio_antes: number | null;
  tipo: string | null;
  badge: string | null;
  emoji: string;
  color: string;
  url_wa: string | null;
  fecha_fin: string | null;
}

const formatPrecio = (p: number) => `$${p.toLocaleString("es-CO")}`;

const calcDescuento = (antes: number, ahora: number) =>
  Math.round(((antes - ahora) / antes) * 100);

export default function OfertasPage() {
  const [ofertas,  setOfertas]  = useState<OfertaHot[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    supabase
      .from("ofertas_hot")
      .select("*")
      .eq("activa", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOfertas(data ?? []);
        setLoading(false);
      });
  }, []);

  const getWaLink = (oferta: OfertaHot) => {
    const msg = encodeURIComponent(
      `Hola, vi la oferta *${oferta.titulo}* en ComparaTuPlan.com y quiero más información 🚀`
    );
    return oferta.url_wa || `https://wa.me/${WA_NUMBER}?text=${msg}`;
  };

  return (
    <div style={{ background: "#04040f", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif", padding: "100px 20px 60px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 99, padding: "5px 16px", marginBottom: 14 }}>
            <span style={{ animation: "blink 1s infinite", fontSize: 14 }}>🔥</span>
            <span style={{ color: "#ef4444", fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>OFERTAS DEL DÍA</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 900, marginBottom: 10, background: "linear-gradient(90deg,#ef4444,#f59e0b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Ofertas Hot ⚡
          </h1>
          <p style={{ color: "rgba(180,195,230,0.6)", fontSize: 14, maxWidth: 500, margin: "0 auto" }}>
            Promociones exclusivas por tiempo limitado que no están en la CRC. Actualizado diariamente.
          </p>
        </div>

        {/* Contenido */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⚡</div>
            <div style={{ color: "rgba(239,68,68,0.6)", fontWeight: 600 }}>Cargando ofertas...</div>
          </div>
        ) : ofertas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>😴</div>
            <h2 style={{ color: "#fff", fontWeight: 700, marginBottom: 8 }}>No hay ofertas activas hoy</h2>
            <p style={{ color: "rgba(180,195,230,0.5)", fontSize: 14 }}>
              Vuelve mañana — publicamos nuevas ofertas cada día.
            </p>
            <a
              href="/planes"
              style={{ display: "inline-block", marginTop: 20, padding: "10px 24px", background: "linear-gradient(135deg,#0070cc,#0050aa)", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}
            >
              Ver catálogo completo →
            </a>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
            {ofertas.map((o) => {
              const descuento = o.precio && o.precio_antes ? calcDescuento(o.precio_antes, o.precio) : null;
              return (
                <div
                  key={o.id}
                  style={{
                    background: "rgba(8,6,28,0.85)",
                    border: `1px solid ${o.color}33`,
                    borderRadius: 16, padding: 22,
                    position: "relative", transition: "all .2s",
                  }}
                  onMouseEnter={(e: any) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = `${o.color}66`; e.currentTarget.style.boxShadow = `0 12px 32px ${o.color}18`; }}
                  onMouseLeave={(e: any) => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = `${o.color}33`; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* Badge descuento */}
                  {descuento && (
                    <div style={{ position: "absolute", top: 14, right: 14, background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 900, padding: "3px 10px", borderRadius: 99 }}>
                      -{descuento}%
                    </div>
                  )}

                  {/* Badge custom */}
                  {o.badge && (
                    <div style={{ display: "inline-block", background: `${o.color}18`, border: `1px solid ${o.color}44`, color: o.color, fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 99, marginBottom: 12 }}>
                      {o.badge}
                    </div>
                  )}

                  {/* Emoji + título */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 32 }}>{o.emoji}</span>
                    <div>
                      {o.operador && <div style={{ color: o.color, fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{o.operador}</div>}
                      <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, lineHeight: 1.3 }}>{o.titulo}</div>
                    </div>
                  </div>

                  {/* Descripción */}
                  {o.descripcion && (
                    <p style={{ color: "rgba(180,195,230,0.65)", fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>
                      {o.descripcion}
                    </p>
                  )}

                  {/* Precio */}
                  {o.precio && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                        <span style={{ color: o.color, fontWeight: 900, fontSize: 26 }}>{formatPrecio(o.precio)}</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>/mes</span>
                      </div>
                      {o.precio_antes && (
                        <div style={{ color: "rgba(180,195,230,0.4)", fontSize: 12, textDecoration: "line-through" }}>
                          Antes: {formatPrecio(o.precio_antes)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fecha fin */}
                  {o.fecha_fin && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, color: "#f59e0b", fontSize: 11, fontWeight: 700 }}>
                      ⏰ Válido hasta: {new Date(o.fecha_fin).toLocaleDateString("es-CO", { day: "numeric", month: "long" })}
                    </div>
                  )}

                  {/* CTA */}
                  <a
                    href={getWaLink(o)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", background: "#25D366", color: "#fff", borderRadius: 10, padding: "11px 0", fontWeight: 700, fontSize: 13, textAlign: "center", textDecoration: "none", transition: "opacity .2s" }}
                    onMouseEnter={(e: any) => e.currentTarget.style.opacity = "0.9"}
                    onMouseLeave={(e: any) => e.currentTarget.style.opacity = "1"}
                  >
                    💬 Quiero esta oferta
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
