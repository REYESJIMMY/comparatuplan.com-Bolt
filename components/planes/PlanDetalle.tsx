"use client";

import { useState } from "react";
import Link from "next/link";

interface Plan {
  id_crc: string;
  operador: string;
  nombre: string;
  tipo: string;
  precio: number;
  velocidad_mbps: number | null;
  datos_gb: number | null;
  canales_tv: number | null;
  minutos: string | null;
  modalidad: string | null;
  tecnologia: string | null;
}

interface Historial {
  precio_anterior: number;
  precio_nuevo: number;
  diferencia: number;
  registrado_at: string;
}

interface Similar {
  id_crc: string;
  operador: string;
  nombre: string;
  precio: number;
  tipo: string;
  velocidad_mbps: number | null;
  datos_gb: number | null;
  modalidad: string | null;
}

interface Props {
  plan: Plan;
  historial: Historial[];
  similares: Similar[];
}

const OPERADOR_LOGOS: Record<string, { color: string; emoji: string }> = {
  Claro:    { color: "#E8001A", emoji: "🔴" },
  Movistar: { color: "#019DF4", emoji: "🔵" },
  Etb:      { color: "#FF6B00", emoji: "🟠" },
  Tigo:     { color: "#00ADEF", emoji: "🔵" },
};

function formatPrecio(p: number | string) {
  const num = typeof p === "string" ? parseFloat(p) : p;
  return `$${num.toLocaleString("es-CO")}`;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function getTipoLabel(tipo: string) {
  const map: Record<string, string> = {
    internet: "Internet Fijo",
    movil: "Plan Móvil",
    paquete: "Paquete",
    tv: "Televisión",
    otro: "Otro",
  };
  return map[tipo] ?? tipo;
}

export default function PlanDetalle({ plan, historial, similares }: Props) {
  const [tab, setTab] = useState<"specs" | "historial" | "similares">("specs");
  const [copied, setCopied] = useState(false);

  const operadorInfo = OPERADOR_LOGOS[plan.operador] ?? { color: "#00e5a0", emoji: "📡" };
  const precio = typeof plan.precio === "string" ? parseFloat(plan.precio) : plan.precio;

  const waMessage = encodeURIComponent(
    `Hola, me interesa el plan *${plan.nombre}* de ${plan.operador} que vi en ComparaTuPlan.com. ¿Me pueden dar más información?`
  );
  const waLink = `https://wa.me/573057876992?text=${waMessage}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const precioMinimo = historial.length > 0
    ? Math.min(...historial.map((h) => h.precio_nuevo), precio)
    : precio;
  const precioMaximo = historial.length > 0
    ? Math.max(...historial.map((h) => h.precio_nuevo), precio)
    : precio;

  return (
    <div className="detalle-wrap">
      {/* Breadcrumb */}
      <div className="detalle-breadcrumb">
        <Link href="/">Inicio</Link>
        <span>›</span>
        <Link href="/planes">Planes</Link>
        <span>›</span>
        <span>{plan.operador}</span>
      </div>

      {/* Hero del plan */}
      <div className="detalle-hero" style={{ borderColor: operadorInfo.color + "33" }}>
        <div className="detalle-hero-left">
          <div className="detalle-operador-badge" style={{ background: operadorInfo.color + "22", color: operadorInfo.color }}>
            {operadorInfo.emoji} {plan.operador}
          </div>
          <div className="detalle-tipo-badge">{getTipoLabel(plan.tipo)}</div>
          {plan.modalidad && (
            <div className="detalle-modalidad-badge">{plan.modalidad}</div>
          )}
          <h1 className="detalle-nombre">{plan.nombre}</h1>

          {/* Specs rápidos */}
          <div className="detalle-specs-row">
            {plan.velocidad_mbps && (
              <div className="detalle-spec">
                <span className="detalle-spec-val">{plan.velocidad_mbps}</span>
                <span className="detalle-spec-label">Mbps</span>
              </div>
            )}
            {plan.datos_gb && plan.datos_gb > 0 && (
              <div className="detalle-spec">
                <span className="detalle-spec-val">
                  {plan.datos_gb === -1 ? "∞" : plan.datos_gb}
                </span>
                <span className="detalle-spec-label">GB datos</span>
              </div>
            )}
            {plan.canales_tv && plan.canales_tv > 0 && (
              <div className="detalle-spec">
                <span className="detalle-spec-val">{plan.canales_tv}</span>
                <span className="detalle-spec-label">Canales TV</span>
              </div>
            )}
            {plan.minutos && plan.minutos !== "0" && (
              <div className="detalle-spec">
                <span className="detalle-spec-val">
                  {plan.minutos === "-1" ? "∞" : plan.minutos}
                </span>
                <span className="detalle-spec-label">Minutos</span>
              </div>
            )}
          </div>
        </div>

        {/* Precio y CTA */}
        <div className="detalle-hero-right">
          <div className="detalle-precio-card">
            <span className="detalle-precio-label">Precio mensual</span>
            <span className="detalle-precio-val">{formatPrecio(precio)}</span>
            <span className="detalle-precio-sub">Incluye IVA</span>

            {historial.length > 0 && (
              <div className="detalle-precio-range">
                <span>Mín: {formatPrecio(precioMinimo)}</span>
                <span>Máx: {formatPrecio(precioMaximo)}</span>
              </div>
            )}

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="detalle-btn-wa"
            >
              💬 Quiero este plan
            </a>

            <button className="detalle-btn-share" onClick={handleCopy}>
              {copied ? "✅ Link copiado" : "🔗 Compartir plan"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detalle-tabs">
        {(["specs", "historial", "similares"] as const).map((t) => (
          <button
            key={t}
            className={`detalle-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "specs" && "📋 Características"}
            {t === "historial" && `📈 Historial de precios ${historial.length > 0 ? `(${historial.length})` : ""}`}
            {t === "similares" && `🔍 Planes similares ${similares.length > 0 ? `(${similares.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* Tab: Specs */}
      {tab === "specs" && (
        <div className="detalle-tab-content">
          <div className="specs-grid">
            <div className="spec-row">
              <span className="spec-key">Operador</span>
              <span className="spec-val">{plan.operador}</span>
            </div>
            <div className="spec-row">
              <span className="spec-key">Tipo de plan</span>
              <span className="spec-val">{getTipoLabel(plan.tipo)}</span>
            </div>
            {plan.modalidad && (
              <div className="spec-row">
                <span className="spec-key">Modalidad</span>
                <span className="spec-val">{plan.modalidad}</span>
              </div>
            )}
            {plan.tecnologia && (
              <div className="spec-row">
                <span className="spec-key">Tecnología</span>
                <span className="spec-val">{plan.tecnologia}</span>
              </div>
            )}
            {plan.velocidad_mbps && (
              <div className="spec-row">
                <span className="spec-key">Velocidad</span>
                <span className="spec-val">{plan.velocidad_mbps} Mbps</span>
              </div>
            )}
            {plan.datos_gb !== null && (
              <div className="spec-row">
                <span className="spec-key">Datos móviles</span>
                <span className="spec-val">
                  {plan.datos_gb === -1 ? "Ilimitados" : `${plan.datos_gb} GB`}
                </span>
              </div>
            )}
            {plan.canales_tv && plan.canales_tv > 0 && (
              <div className="spec-row">
                <span className="spec-key">Canales TV</span>
                <span className="spec-val">{plan.canales_tv} canales</span>
              </div>
            )}
            {plan.minutos && plan.minutos !== "0" && (
              <div className="spec-row">
                <span className="spec-key">Minutos</span>
                <span className="spec-val">
                  {plan.minutos === "-1" ? "Ilimitados" : `${plan.minutos} min`}
                </span>
              </div>
            )}
            <div className="spec-row">
              <span className="spec-key">Precio</span>
              <span className="spec-val" style={{ color: "#00e5a0", fontWeight: 700 }}>
                {formatPrecio(precio)}/mes
              </span>
            </div>
          </div>

          {/* Aviso cobertura */}
          <div className="detalle-aviso">
            <span>📍</span>
            <div>
              <strong>Disponibilidad sujeta a cobertura</strong>
              <p>La disponibilidad de este plan en tu dirección exacta debe ser confirmada directamente con {plan.operador}. Al hacer clic en "Quiero este plan" un asesor verificará cobertura en tu zona.</p>
            </div>
          </div>

          {/* Fuente */}
          <div className="detalle-fuente">
            Datos tomados del comparador oficial de la CRC Colombia · Actualización diaria
          </div>
        </div>
      )}

      {/* Tab: Historial */}
      {tab === "historial" && (
        <div className="detalle-tab-content">
          {historial.length === 0 ? (
            <div className="historial-empty">
              <span>📊</span>
              <p>Aún no hay cambios de precio registrados para este plan.</p>
              <p className="historial-empty-sub">El historial se actualiza automáticamente cuando la CRC reporta cambios.</p>
            </div>
          ) : (
            <>
              <div className="historial-resumen">
                <div className="historial-stat">
                  <span className="historial-stat-label">Precio actual</span>
                  <span className="historial-stat-val">{formatPrecio(precio)}</span>
                </div>
                <div className="historial-stat">
                  <span className="historial-stat-label">Precio mínimo</span>
                  <span className="historial-stat-val ok">{formatPrecio(precioMinimo)}</span>
                </div>
                <div className="historial-stat">
                  <span className="historial-stat-label">Precio máximo</span>
                  <span className="historial-stat-val warn">{formatPrecio(precioMaximo)}</span>
                </div>
                <div className="historial-stat">
                  <span className="historial-stat-label">Cambios registrados</span>
                  <span className="historial-stat-val">{historial.length}</span>
                </div>
              </div>

              <div className="historial-lista">
                {historial.map((h, i) => (
                  <div key={i} className="historial-item">
                    <div className="historial-fecha">{formatFecha(h.registrado_at)}</div>
                    <div className="historial-cambio">
                      <span className="historial-prev">{formatPrecio(h.precio_anterior)}</span>
                      <span className="historial-arrow">→</span>
                      <span className="historial-new">{formatPrecio(h.precio_nuevo)}</span>
                    </div>
                    <div className={`historial-diff ${h.diferencia < 0 ? "baja" : "sube"}`}>
                      {h.diferencia < 0 ? "▼" : "▲"} {formatPrecio(Math.abs(h.diferencia))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab: Similares */}
      {tab === "similares" && (
        <div className="detalle-tab-content">
          {similares.length === 0 ? (
            <div className="historial-empty">
              <span>🔍</span>
              <p>No encontramos planes similares de {plan.operador} en este momento.</p>
            </div>
          ) : (
            <div className="similares-grid">
              {similares.map((s) => (
                <Link key={s.id_crc} href={`/planes/${s.id_crc}`} className="similar-card">
                  <div className="similar-operador">{s.operador}</div>
                  <div className="similar-nombre">{s.nombre}</div>
                  <div className="similar-specs">
                    {s.velocidad_mbps && <span>⚡ {s.velocidad_mbps} Mbps</span>}
                    {s.datos_gb && s.datos_gb > 0 && (
                      <span>📶 {s.datos_gb === -1 ? "∞" : s.datos_gb} GB</span>
                    )}
                    {s.modalidad && <span>{s.modalidad}</span>}
                  </div>
                  <div className="similar-precio">{formatPrecio(s.precio)}<span>/mes</span></div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .detalle-wrap {
          max-width: 900px; margin: 0 auto; padding: 1.5rem 1rem;
          font-family: var(--font-sans, system-ui);
          color: #fff; min-height: 100vh;
        }
        .detalle-breadcrumb {
          display: flex; gap: 8px; align-items: center;
          font-size: 12px; color: #666; margin-bottom: 1.5rem;
        }
        .detalle-breadcrumb a { color: #888; text-decoration: none; }
        .detalle-breadcrumb a:hover { color: #00e5a0; }
        .detalle-hero {
          display: grid; grid-template-columns: 1fr auto;
          gap: 1.5rem; background: #111; border: 1px solid #2a2a2a;
          border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem;
        }
        .detalle-operador-badge {
          display: inline-block; font-size: 12px; font-weight: 600;
          padding: 4px 12px; border-radius: 6px; margin-bottom: 6px;
        }
        .detalle-tipo-badge {
          display: inline-block; font-size: 11px; color: #888;
          background: #1a1a1a; border: 1px solid #333;
          padding: 3px 10px; border-radius: 4px; margin-bottom: 6px; margin-left: 6px;
        }
        .detalle-modalidad-badge {
          display: inline-block; font-size: 11px; color: #00e5a0;
          background: #001f17; border: 1px solid #00e5a044;
          padding: 3px 10px; border-radius: 4px; margin-bottom: 6px; margin-left: 6px;
        }
        .detalle-nombre {
          font-size: 22px; font-weight: 700; color: #fff;
          margin: 0.5rem 0 1rem; line-height: 1.3;
        }
        .detalle-specs-row {
          display: flex; gap: 16px; flex-wrap: wrap;
        }
        .detalle-spec {
          display: flex; flex-direction: column; align-items: center;
          background: #1a1a1a; border: 1px solid #2a2a2a;
          border-radius: 10px; padding: 10px 16px; min-width: 70px;
        }
        .detalle-spec-val {
          font-size: 20px; font-weight: 700; color: #00e5a0;
        }
        .detalle-spec-label {
          font-size: 10px; color: #888; margin-top: 2px;
        }
        .detalle-hero-right { min-width: 200px; }
        .detalle-precio-card {
          background: #0d0d0d; border: 1px solid #2a2a2a;
          border-radius: 14px; padding: 1.25rem;
          display: flex; flex-direction: column; gap: 8px;
          text-align: center;
        }
        .detalle-precio-label {
          font-size: 11px; color: #888;
        }
        .detalle-precio-val {
          font-size: 28px; font-weight: 800; color: #00e5a0;
        }
        .detalle-precio-sub {
          font-size: 11px; color: #666;
        }
        .detalle-precio-range {
          display: flex; justify-content: space-between;
          font-size: 11px; color: #888; padding-top: 4px;
          border-top: 1px solid #2a2a2a;
        }
        .detalle-btn-wa {
          display: block; background: #25D366; color: #fff;
          border-radius: 10px; padding: 12px; font-size: 14px;
          font-weight: 600; text-align: center; text-decoration: none;
          transition: opacity 0.2s; margin-top: 4px;
        }
        .detalle-btn-wa:hover { opacity: 0.9; }
        .detalle-btn-share {
          background: #1a1a1a; border: 1px solid #333; color: #aaa;
          border-radius: 8px; padding: 9px; font-size: 12px;
          cursor: pointer; width: 100%; transition: all 0.2s;
        }
        .detalle-btn-share:hover { border-color: #666; color: #fff; }
        .detalle-tabs {
          display: flex; gap: 4px; margin-bottom: 1rem;
          border-bottom: 1px solid #2a2a2a; padding-bottom: 0;
          overflow-x: auto;
        }
        .detalle-tab {
          background: none; border: none; color: #888;
          padding: 10px 16px; font-size: 13px; cursor: pointer;
          border-bottom: 2px solid transparent; white-space: nowrap;
          transition: all 0.2s;
        }
        .detalle-tab:hover { color: #fff; }
        .detalle-tab.active {
          color: #00e5a0; border-bottom-color: #00e5a0;
        }
        .detalle-tab-content {
          background: #111; border: 1px solid #2a2a2a;
          border-radius: 14px; padding: 1.25rem;
        }
        .specs-grid { display: flex; flex-direction: column; gap: 2px; }
        .spec-row {
          display: flex; justify-content: space-between;
          padding: 10px 0; border-bottom: 1px solid #1a1a1a;
          font-size: 14px;
        }
        .spec-row:last-child { border-bottom: none; }
        .spec-key { color: #888; }
        .spec-val { color: #fff; font-weight: 500; text-align: right; }
        .detalle-aviso {
          display: flex; gap: 12px; background: #0d1a15;
          border: 1px solid #00e5a033; border-radius: 10px;
          padding: 12px 14px; margin-top: 1rem; font-size: 12px;
        }
        .detalle-aviso span { font-size: 18px; flex-shrink: 0; }
        .detalle-aviso strong { color: #00e5a0; display: block; margin-bottom: 4px; }
        .detalle-aviso p { color: #888; line-height: 1.5; margin: 0; }
        .detalle-fuente {
          font-size: 11px; color: #555; text-align: center;
          margin-top: 1rem; padding-top: 1rem;
          border-top: 1px solid #1a1a1a;
        }
        .historial-empty {
          text-align: center; padding: 2rem; color: #888;
          display: flex; flex-direction: column; gap: 8px; align-items: center;
        }
        .historial-empty span { font-size: 32px; }
        .historial-empty-sub { font-size: 12px; color: #555; }
        .historial-resumen {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 10px; margin-bottom: 1rem;
        }
        .historial-stat {
          background: #0d0d0d; border: 1px solid #2a2a2a;
          border-radius: 10px; padding: 12px; text-align: center;
        }
        .historial-stat-label {
          font-size: 11px; color: #888; display: block; margin-bottom: 4px;
        }
        .historial-stat-val {
          font-size: 16px; font-weight: 700; color: #fff;
        }
        .historial-stat-val.ok { color: #00e5a0; }
        .historial-stat-val.warn { color: #f87171; }
        .historial-lista { display: flex; flex-direction: column; gap: 6px; }
        .historial-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 12px; background: #0d0d0d;
          border: 1px solid #1a1a1a; border-radius: 8px; font-size: 13px;
        }
        .historial-fecha { color: #888; font-size: 12px; min-width: 100px; }
        .historial-cambio { display: flex; gap: 8px; align-items: center; }
        .historial-prev { color: #888; text-decoration: line-through; }
        .historial-arrow { color: #555; }
        .historial-new { color: #fff; font-weight: 600; }
        .historial-diff { font-size: 12px; font-weight: 600; }
        .historial-diff.baja { color: #00e5a0; }
        .historial-diff.sube { color: #f87171; }
        .similares-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
        }
        .similar-card {
          background: #0d0d0d; border: 1px solid #2a2a2a;
          border-radius: 12px; padding: 14px; text-decoration: none;
          transition: all 0.2s; display: block;
        }
        .similar-card:hover {
          border-color: #00e5a0; transform: translateY(-2px);
        }
        .similar-operador {
          font-size: 11px; color: #888; margin-bottom: 4px;
        }
        .similar-nombre {
          font-size: 13px; font-weight: 600; color: #fff;
          margin-bottom: 8px; line-height: 1.3;
        }
        .similar-specs {
          display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;
        }
        .similar-specs span {
          font-size: 11px; background: #1a1a1a; border: 1px solid #333;
          border-radius: 4px; padding: 2px 7px; color: #aaa;
        }
        .similar-precio {
          font-size: 16px; font-weight: 700; color: #00e5a0;
        }
        .similar-precio span { font-size: 12px; font-weight: 400; color: #888; }
        @media (max-width: 640px) {
          .detalle-hero { grid-template-columns: 1fr; }
          .historial-resumen { grid-template-columns: 1fr 1fr; }
          .similares-grid { grid-template-columns: 1fr; }
          .detalle-nombre { font-size: 18px; }
          .detalle-precio-val { font-size: 22px; }
        }
      `}</style>
    </div>
  );
}
