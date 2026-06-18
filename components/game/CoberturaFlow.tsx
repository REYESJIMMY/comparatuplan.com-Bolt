"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Operadores fase 1
const OPERADORES_FASE1 = ["Claro", "Movistar", "Etb", "Tigo"];

const TIPOS_HOGAR = ["internet", "paquete", "tv"];
const TIPOS_MOVIL = ["movil"];

const ESTRATOS = [1, 2, 3, 4, 5, 6];

const DEPARTAMENTOS_PRINCIPALES = [
  { label: "Bogotá D.C.", municipios: ["Bogotá"] },
  { label: "Antioquia", municipios: ["Medellín", "Bello", "Itagüí", "Envigado", "Sabaneta"] },
  { label: "Valle del Cauca", municipios: ["Cali", "Palmira", "Buenaventura", "Tuluá"] },
  { label: "Atlántico", municipios: ["Barranquilla", "Soledad", "Malambo"] },
  { label: "Santander", municipios: ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta"] },
  { label: "Bolívar", municipios: ["Cartagena"] },
  { label: "Cundinamarca", municipios: ["Soacha", "Chía", "Zipaquirá", "Fusagasugá"] },
  { label: "Nariño", municipios: ["Pasto"] },
  { label: "Risaralda", municipios: ["Pereira", "Dosquebradas"] },
  { label: "Quindío", municipios: ["Armenia"] },
  { label: "Caldas", municipios: ["Manizales"] },
  { label: "Huila", municipios: ["Neiva"] },
  { label: "Tolima", municipios: ["Ibagué"] },
  { label: "Córdoba", municipios: ["Montería"] },
  { label: "Meta", municipios: ["Villavicencio"] },
];

interface Plan {
  id_crc: string;
  operador: string;
  nombre: string;
  tipo: string;
  precio: number;
  precio_mensual: number;
  velocidad_mbps: number;
  datos_gb: number;
  canales_tv: number;
  minutos: string;
  modalidad: string;
  tecnologia: string;
  beneficios: string[];
  badge: string;
  emoji: string;
  color: string;
  estratos: number[];
}

interface CoberturaData {
  departamento: string;
  municipio: string;
  estrato: number;
  direccion: string;
  segmento: "hogar" | "movil" | null;
}

const STEPS = ["ubicacion", "estrato", "direccion", "segmento", "planes"] as const;
type Step = typeof STEPS[number];

export default function CoberturaFlow({ onClose }: { onClose?: () => void }) {
  const [step, setStep] = useState<Step>("ubicacion");
  const [data, setData] = useState<CoberturaData>({
    departamento: "",
    municipio: "",
    estrato: 0,
    direccion: "",
    segmento: null,
  });
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deptoOpen, setDeptoOpen] = useState(false);
  const [selectedDepto, setSelectedDepto] = useState<string>("");

  const municipiosDep = DEPARTAMENTOS_PRINCIPALES.find(
    (d) => d.label === selectedDepto
  )?.municipios ?? [];

  const goNext = () => {
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const goBack = () => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  const buscarPlanes = async (segmento: "hogar" | "movil") => {
    setLoading(true);
    setError("");
    const tipos = segmento === "hogar" ? TIPOS_HOGAR : TIPOS_MOVIL;

    const { data: result, error: err } = await supabase
      .from("planes")
      .select(
        "id_crc, operador, nombre, tipo, precio, precio_mensual, velocidad_mbps, datos_gb, canales_tv, minutos, modalidad, tecnologia, beneficios, badge, emoji, color, estratos"
      )
      .eq("activo", true)
      .in("tipo", tipos)
      .in("operador", OPERADORES_FASE1)
      .contains("estratos", [data.estrato])
      .order("precio", { ascending: true })
      .limit(30);

    if (err) {
      setError("Error al cargar planes. Intenta de nuevo.");
    } else {
      setPlanes(result ?? []);
    }
    setLoading(false);
  };

  const handleSegmento = async (segmento: "hogar" | "movil") => {
    setData((d) => ({ ...d, segmento }));
    await buscarPlanes(segmento);
    setStep("planes");
  };

  const formatPrecio = (p: number) =>
    p ? `$${p.toLocaleString("es-CO")}` : "Consultar";

  const stepProgress = STEPS.indexOf(step) + 1;

  return (
    <div className="cobertura-overlay">
      <div className="cobertura-modal">
        {/* Header */}
        <div className="cobertura-header">
          <div className="cobertura-header-top">
            <span className="cobertura-title">
              {step === "planes" ? "Planes disponibles para ti" : "Verificar cobertura"}
            </span>
            {onClose && (
              <button className="cobertura-close" onClick={onClose}>✕</button>
            )}
          </div>
          {step !== "planes" && (
            <div className="cobertura-progress">
              {STEPS.slice(0, 4).map((s, i) => (
                <div
                  key={s}
                  className={`cobertura-progress-step ${i < stepProgress ? "active" : ""}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Paso 1 — Ubicación */}
        {step === "ubicacion" && (
          <div className="cobertura-body">
            <h2 className="cobertura-question">¿Dónde estás ubicado?</h2>
            <p className="cobertura-sub">Selecciona tu departamento y municipio</p>

            <div className="cobertura-field">
              <label>Departamento</label>
              <div className="cobertura-select-wrap">
                <select
                  value={selectedDepto}
                  onChange={(e) => {
                    setSelectedDepto(e.target.value);
                    setData((d) => ({ ...d, departamento: e.target.value, municipio: "" }));
                  }}
                >
                  <option value="">Selecciona departamento</option>
                  {DEPARTAMENTOS_PRINCIPALES.map((d) => (
                    <option key={d.label} value={d.label}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedDepto && (
              <div className="cobertura-field">
                <label>Municipio</label>
                <div className="cobertura-select-wrap">
                  <select
                    value={data.municipio}
                    onChange={(e) => setData((d) => ({ ...d, municipio: e.target.value }))}
                  >
                    <option value="">Selecciona municipio</option>
                    {municipiosDep.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              className="cobertura-btn"
              disabled={!data.departamento || !data.municipio}
              onClick={goNext}
            >
              Continuar →
            </button>
          </div>
        )}

        {/* Paso 2 — Estrato */}
        {step === "estrato" && (
          <div className="cobertura-body">
            <h2 className="cobertura-question">¿Cuál es tu estrato?</h2>
            <p className="cobertura-sub">
              En <strong>{data.municipio}</strong> · {data.departamento}
            </p>
            <div className="estrato-grid">
              {ESTRATOS.map((e) => (
                <button
                  key={e}
                  className={`estrato-btn ${data.estrato === e ? "selected" : ""}`}
                  onClick={() => setData((d) => ({ ...d, estrato: e }))}
                >
                  <span className="estrato-num">{e}</span>
                  <span className="estrato-label">Estrato</span>
                </button>
              ))}
            </div>
            <div className="cobertura-nav">
              <button className="cobertura-btn-back" onClick={goBack}>← Volver</button>
              <button
                className="cobertura-btn"
                disabled={!data.estrato}
                onClick={goNext}
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* Paso 3 — Dirección */}
        {step === "direccion" && (
          <div className="cobertura-body">
            <h2 className="cobertura-question">¿Cuál es tu dirección?</h2>
            <p className="cobertura-sub">
              El operador la usará para confirmar cobertura exacta
            </p>
            <div className="cobertura-field">
              <label>Dirección completa</label>
              <input
                type="text"
                className="cobertura-input"
                placeholder="Ej: Calle 72 # 10-34, Apto 501"
                value={data.direccion}
                onChange={(e) => setData((d) => ({ ...d, direccion: e.target.value }))}
              />
              <span className="cobertura-hint">
                Incluye calle, número, apartamento o piso si aplica
              </span>
            </div>
            <div className="cobertura-nav">
              <button className="cobertura-btn-back" onClick={goBack}>← Volver</button>
              <button
                className="cobertura-btn"
                disabled={!data.direccion.trim()}
                onClick={goNext}
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* Paso 4 — Segmento */}
        {step === "segmento" && (
          <div className="cobertura-body">
            <h2 className="cobertura-question">¿Qué tipo de plan buscas?</h2>
            <p className="cobertura-sub">
              Estrato {data.estrato} · {data.municipio}
            </p>
            <div className="segmento-grid">
              <button
                className="segmento-btn"
                onClick={() => handleSegmento("hogar")}
              >
                <span className="segmento-icon">🏠</span>
                <span className="segmento-name">Hogar</span>
                <span className="segmento-desc">Internet fijo, TV y paquetes para tu casa</span>
              </button>
              <button
                className="segmento-btn"
                onClick={() => handleSegmento("movil")}
              >
                <span className="segmento-icon">📱</span>
                <span className="segmento-name">Móvil</span>
                <span className="segmento-desc">Planes de datos y minutos para tu celular</span>
              </button>
            </div>
            <button className="cobertura-btn-back" style={{ marginTop: "1rem" }} onClick={goBack}>
              ← Volver
            </button>
          </div>
        )}

        {/* Paso 5 — Planes */}
        {step === "planes" && (
          <div className="cobertura-body planes-body">
            {loading && (
              <div className="planes-loading">
                <div className="planes-spinner" />
                <p>Buscando los mejores planes para ti...</p>
              </div>
            )}
            {error && <p className="planes-error">{error}</p>}
            {!loading && !error && planes.length === 0 && (
              <div className="planes-empty">
                <span>😕</span>
                <p>No encontramos planes disponibles con estos criterios.</p>
                <button className="cobertura-btn-back" onClick={() => setStep("segmento")}>
                  ← Cambiar segmento
                </button>
              </div>
            )}
            {!loading && planes.length > 0 && (
              <>
                <div className="planes-info">
                  <span className="planes-count">{planes.length} planes encontrados</span>
                  <span className="planes-meta">
                    {data.segmento === "hogar" ? "🏠 Hogar" : "📱 Móvil"} · Estrato {data.estrato} · {data.municipio}
                  </span>
                </div>
                <div className="planes-grid">
                  {planes.map((plan) => (
                    <div key={plan.id_crc} className="plan-card">
                      {plan.badge && <span className="plan-badge">{plan.badge}</span>}
                      <div className="plan-header">
                        <span className="plan-emoji">{plan.emoji || "📡"}</span>
                        <div>
                          <div className="plan-operador">{plan.operador}</div>
                          <div className="plan-nombre">{plan.nombre}</div>
                        </div>
                      </div>
                      <div className="plan-precio">
                        {formatPrecio(plan.precio_mensual || plan.precio)}
                        <span className="plan-mes">/mes</span>
                      </div>
                      <div className="plan-specs">
                        {plan.velocidad_mbps > 0 && (
                          <span className="plan-spec">⚡ {plan.velocidad_mbps} Mbps</span>
                        )}
                        {plan.datos_gb > 0 && (
                          <span className="plan-spec">📶 {plan.datos_gb} GB</span>
                        )}
                        {plan.canales_tv > 0 && (
                          <span className="plan-spec">📺 {plan.canales_tv} canales</span>
                        )}
                        {plan.minutos && plan.minutos !== "0" && (
                          <span className="plan-spec">📞 {plan.minutos} min</span>
                        )}
                      </div>
                      <div className="plan-actions">
                        <a
                          href={`/planes/${plan.id_crc}`}
                          className="plan-btn-detail"
                        >
                          Ver detalle
                        </a>
                        <a
                          href={`https://wa.me/57?text=Hola, me interesa el plan ${encodeURIComponent(plan.nombre)} de ${plan.operador}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="plan-btn-wa"
                        >
                          💬 Lo quiero
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="cobertura-btn-back"
                  style={{ marginTop: "1rem" }}
                  onClick={() => setStep("segmento")}
                >
                  ← Cambiar segmento
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        .cobertura-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 1rem;
        }
        .cobertura-modal {
          background: #0d0d0d; border: 1px solid #2a2a2a;
          border-radius: 16px; width: 100%; max-width: 560px;
          max-height: 90vh; overflow-y: auto;
        }
        .cobertura-header {
          padding: 1.25rem 1.5rem 0;
          border-bottom: 1px solid #1a1a1a;
          padding-bottom: 1rem;
        }
        .cobertura-header-top {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 0.75rem;
        }
        .cobertura-title {
          font-size: 14px; font-weight: 600; color: #fff;
        }
        .cobertura-close {
          background: none; border: none; color: #666;
          font-size: 18px; cursor: pointer; padding: 0;
        }
        .cobertura-close:hover { color: #fff; }
        .cobertura-progress {
          display: flex; gap: 6px;
        }
        .cobertura-progress-step {
          height: 3px; flex: 1; background: #2a2a2a; border-radius: 2px;
          transition: background 0.3s;
        }
        .cobertura-progress-step.active { background: #00e5a0; }
        .cobertura-body {
          padding: 1.5rem;
        }
        .planes-body { padding: 1rem 1.25rem; }
        .cobertura-question {
          font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 6px;
        }
        .cobertura-sub {
          font-size: 13px; color: #888; margin-bottom: 1.5rem;
        }
        .cobertura-field { margin-bottom: 1rem; }
        .cobertura-field label {
          display: block; font-size: 12px; color: #aaa;
          margin-bottom: 6px; font-weight: 500;
        }
        .cobertura-select-wrap select {
          width: 100%; background: #1a1a1a; border: 1px solid #333;
          border-radius: 10px; padding: 12px 14px; color: #fff;
          font-size: 14px; appearance: none; cursor: pointer;
        }
        .cobertura-select-wrap select:focus {
          outline: none; border-color: #00e5a0;
        }
        .cobertura-input {
          width: 100%; background: #1a1a1a; border: 1px solid #333;
          border-radius: 10px; padding: 12px 14px; color: #fff;
          font-size: 14px;
        }
        .cobertura-input:focus { outline: none; border-color: #00e5a0; }
        .cobertura-hint {
          font-size: 11px; color: #666; margin-top: 6px; display: block;
        }
        .estrato-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
          margin-bottom: 1.5rem;
        }
        .estrato-btn {
          background: #1a1a1a; border: 1px solid #333; border-radius: 12px;
          padding: 16px; cursor: pointer; display: flex;
          flex-direction: column; align-items: center; gap: 4px;
          transition: all 0.2s;
        }
        .estrato-btn:hover { border-color: #00e5a0; }
        .estrato-btn.selected {
          background: #001f17; border-color: #00e5a0;
        }
        .estrato-num {
          font-size: 24px; font-weight: 700; color: #fff;
        }
        .estrato-label {
          font-size: 11px; color: #888;
        }
        .segmento-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
          margin-bottom: 0.5rem;
        }
        .segmento-btn {
          background: #1a1a1a; border: 1px solid #333; border-radius: 14px;
          padding: 24px 16px; cursor: pointer; display: flex;
          flex-direction: column; align-items: center; gap: 8px;
          transition: all 0.2s; text-align: center;
        }
        .segmento-btn:hover {
          border-color: #00e5a0; background: #001f17;
          transform: translateY(-2px);
        }
        .segmento-icon { font-size: 36px; }
        .segmento-name {
          font-size: 16px; font-weight: 700; color: #fff;
        }
        .segmento-desc {
          font-size: 12px; color: #888; line-height: 1.4;
        }
        .cobertura-nav {
          display: flex; gap: 10px; justify-content: space-between;
          align-items: center;
        }
        .cobertura-btn {
          background: #00e5a0; color: #000; border: none;
          border-radius: 10px; padding: 12px 24px; font-size: 14px;
          font-weight: 600; cursor: pointer; transition: opacity 0.2s;
          width: 100%;
        }
        .cobertura-btn:disabled {
          opacity: 0.4; cursor: not-allowed;
        }
        .cobertura-btn:not(:disabled):hover { opacity: 0.9; }
        .cobertura-btn-back {
          background: none; border: 1px solid #333; color: #aaa;
          border-radius: 10px; padding: 12px 20px; font-size: 13px;
          cursor: pointer; white-space: nowrap; flex-shrink: 0;
        }
        .cobertura-btn-back:hover { border-color: #666; color: #fff; }
        .planes-loading {
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; padding: 2rem; color: #888;
        }
        .planes-spinner {
          width: 32px; height: 32px; border: 2px solid #333;
          border-top-color: #00e5a0; border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .planes-error { color: #f87171; text-align: center; padding: 1rem; }
        .planes-empty {
          text-align: center; padding: 2rem; color: #888;
          display: flex; flex-direction: column; gap: 12px; align-items: center;
        }
        .planes-empty span { font-size: 32px; }
        .planes-info {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem; flex-wrap: wrap; gap: 6px;
        }
        .planes-count {
          font-size: 13px; font-weight: 600; color: #00e5a0;
        }
        .planes-meta { font-size: 12px; color: #666; }
        .planes-grid {
          display: flex; flex-direction: column; gap: 10px;
        }
        .plan-card {
          background: #1a1a1a; border: 1px solid #2a2a2a;
          border-radius: 14px; padding: 14px 16px; position: relative;
        }
        .plan-badge {
          position: absolute; top: 10px; right: 10px;
          background: #00e5a0; color: #000; font-size: 10px;
          font-weight: 700; padding: 2px 8px; border-radius: 4px;
        }
        .plan-header {
          display: flex; gap: 10px; align-items: flex-start;
          margin-bottom: 10px;
        }
        .plan-emoji { font-size: 24px; }
        .plan-operador {
          font-size: 11px; color: #888; font-weight: 500; text-transform: uppercase;
        }
        .plan-nombre {
          font-size: 14px; font-weight: 600; color: #fff;
        }
        .plan-precio {
          font-size: 22px; font-weight: 800; color: #00e5a0;
          margin-bottom: 10px;
        }
        .plan-mes { font-size: 13px; font-weight: 400; color: #888; }
        .plan-specs {
          display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;
        }
        .plan-spec {
          font-size: 11px; background: #111; border: 1px solid #333;
          border-radius: 6px; padding: 3px 8px; color: #ccc;
        }
        .plan-actions {
          display: flex; gap: 8px;
        }
        .plan-btn-detail {
          flex: 1; background: #222; border: 1px solid #333;
          color: #aaa; border-radius: 8px; padding: 9px;
          font-size: 12px; font-weight: 500; text-align: center;
          text-decoration: none; cursor: pointer;
          transition: all 0.2s;
        }
        .plan-btn-detail:hover { border-color: #666; color: #fff; }
        .plan-btn-wa {
          flex: 1; background: #25D366; border: none; color: #fff;
          border-radius: 8px; padding: 9px; font-size: 12px;
          font-weight: 600; text-align: center; text-decoration: none;
          cursor: pointer; transition: opacity 0.2s;
        }
        .plan-btn-wa:hover { opacity: 0.9; }
        @media (max-width: 480px) {
          .cobertura-modal { border-radius: 12px; }
          .cobertura-question { font-size: 18px; }
          .estrato-grid { grid-template-columns: repeat(2, 1fr); }
          .segmento-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
