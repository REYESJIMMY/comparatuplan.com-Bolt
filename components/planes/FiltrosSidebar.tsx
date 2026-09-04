"use client";
import { C } from "@/lib/constants";
import { useTheme } from "@/context/ThemeContext";

export interface Filtros {
  tipo: string;
  operadores: string[];
  modalidad: string;
  precioMin: number;
  precioMax: number;
  velocidadMin: number;
  datosMin: number;   // 0 = sin filtro, -1 = solo ilimitados
  canalesMin: number;
  estrato: number;    // 0 = todos
  tecnologia: string; // '' = todas
}

export const FILTROS_INICIALES: Filtros = {
  tipo: "", operadores: [], modalidad: "",
  precioMin: 0, precioMax: 500000,
  velocidadMin: 0, datosMin: 0, canalesMin: 0,
  estrato: 0, tecnologia: "",
};

const OPERADORES = ["Claro", "Movistar", "Etb", "Tigo"];
const OP_COLORS: Record<string, string> = { Claro: "#e2001a", Movistar: "#00aa44", Etb: "#f59e0b", Tigo: "#00a0e3" };
const TECNOLOGIAS = ["Fibra", "Cobre", "4G", "5G"];

const TIPOS = [
  { id: "internet", label: "Internet Hogar" },
  { id: "movil",    label: "Móvil" },
  { id: "paquete",  label: "TV + Paquetes (Dúo/Triple)" },
  { id: "tv",       label: "Solo TV" },
];

interface Props {
  filtros: Filtros;
  onChange: (f: Filtros) => void;
  onClear: () => void;
  activeCount: number;
  precioRango: { min: number; max: number }
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const { theme } = useTheme();
  const L = theme === "light";
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ color: L ? "#94a3b8" : "rgba(180,195,230,0.4)", fontSize: 9.5, fontWeight: 800, letterSpacing: 1, marginBottom: 10 }}>
        {title.toUpperCase()}
      </div>
      {children}
    </div>
  );
};

export const FiltrosSidebar = ({ filtros, onChange, onClear, activeCount, precioRango }: Props) => {
  const { theme } = useTheme();
  const L = theme === "light";
  const set = <K extends keyof Filtros>(k: K, v: Filtros[K]) => onChange({ ...filtros, [k]: v });

  const toggleOperador = (op: string) => {
    const has = filtros.operadores.includes(op);
    set("operadores", has ? filtros.operadores.filter((o) => o !== op) : [...filtros.operadores, op]);
  };

  const inputBase: React.CSSProperties = {
    width: "100%", accentColor: C.neon, cursor: "pointer",
  };
  const pillBase = (active: boolean, color: string): React.CSSProperties => ({
    padding: "6px 12px", borderRadius: 99, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
    border: `1.5px solid ${active ? color : (L ? "#e2e8f0" : "rgba(255,255,255,0.1)")}`,
    background: active ? `${color}14` : "transparent",
    color: active ? color : (L ? "#64748b" : "rgba(180,195,230,0.5)"),
  });

  return (
    <div style={{
      background: L ? "#ffffff" : "rgba(8,6,28,0.6)",
      border: `1px solid ${L ? "#e2e8f0" : C.borderSoft}`,
      borderRadius: 16, padding: 18,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ color: L ? "#0d1b2e" : "#fff", fontWeight: 800, fontSize: 13 }}>Filtrar por</span>
        {activeCount > 0 && (
          <button onClick={onClear} style={{ background: "none", border: "none", color: C.red, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            Limpiar ({activeCount})
          </button>
        )}
      </div>

      {/* Tipo de servicio */}
      <Section title="Tipo de servicio">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {TIPOS.map((t) => (
            <label key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="radio" name="tipo" checked={filtros.tipo === t.id}
                onChange={() => set("tipo", filtros.tipo === t.id ? "" : t.id)}
                style={{ accentColor: C.neon }}
              />
              <span style={{ color: L ? "#334155" : "rgba(220,230,255,0.8)", fontSize: 12.5 }}>{t.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Proveedor */}
      <Section title="Proveedor">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {OPERADORES.map((op) => (
            <button key={op} onClick={() => toggleOperador(op)} style={pillBase(filtros.operadores.includes(op), OP_COLORS[op])}>
              {op}
            </button>
          ))}
        </div>
      </Section>

      {/* Estrato */}
      <Section title="Estrato">
        <select
          value={filtros.estrato}
          onChange={(e) => set("estrato", Number(e.target.value))}
          style={{ width: "100%", background: L ? "#f8fafc" : "#1a1a2e", border: `1px solid ${L ? "#e2e8f0" : "rgba(255,255,255,0.1)"}`, borderRadius: 9, padding: "9px 12px", color: L ? "#0d1b2e" : "#fff", fontSize: 12.5, appearance: "none" }}
        >
          <option value={0}>Todos los estratos</option>
          {[1, 2, 3, 4, 5, 6].map((e) => <option key={e} value={e}>Estrato {e}</option>)}
        </select>
      </Section>

      {/* Modalidad — solo relevante para móvil */}
      {(filtros.tipo === "movil" || filtros.tipo === "") && (
        <Section title="Modalidad">
          <div style={{ display: "flex", gap: 6 }}>
            {["", "prepago", "pospago"].map((m) => (
              <button key={m || "todas"} onClick={() => set("modalidad", m)} style={pillBase(filtros.modalidad === m, C.neon2)}>
                {m === "" ? "Todas" : m === "prepago" ? "Prepago" : "Pospago"}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Precio */}
      <Section title="Precio mensual (COP)">
        <div style={{ color: L ? "#0d1b2e" : "#fff", fontWeight: 800, fontSize: 13, marginBottom: 8 }}>
          ${filtros.precioMin.toLocaleString("es-CO")} – ${filtros.precioMax.toLocaleString("es-CO")}
        </div>
        <input type="range" min={precioRango.min} max={precioRango.max} step={1000} value={filtros.precioMin}
          onChange={(e) => set("precioMin", Math.min(Number(e.target.value), filtros.precioMax))} style={inputBase} />
        <input type="range" min={precioRango.min} max={precioRango.max} step={1000} value={filtros.precioMax}
          onChange={(e) => set("precioMax", Math.max(Number(e.target.value), filtros.precioMin))} style={{ ...inputBase, marginTop: 4 }} />
      </Section>

      {/* Velocidad — internet/paquete */}
      {(filtros.tipo === "internet" || filtros.tipo === "paquete" || filtros.tipo === "") && (
        <Section title="Velocidad mínima">
          <div style={{ color: C.neon, fontWeight: 800, fontSize: 13, marginBottom: 6 }}>
            {filtros.velocidadMin === 0 ? "Cualquiera" : `${filtros.velocidadMin}+ Mbps`}
          </div>
          <input type="range" min={0} max={1000} step={10} value={filtros.velocidadMin}
            onChange={(e) => set("velocidadMin", Number(e.target.value))} style={inputBase} />
        </Section>
      )}

      {/* Datos — móvil */}
      {(filtros.tipo === "movil" || filtros.tipo === "") && (
        <Section title="Datos móviles">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[[0, "Cualquiera"], [5, "5+ GB"], [20, "20+ GB"], [50, "50+ GB"], [-1, "Ilimitados"]].map(([v, l]) => (
              <button key={String(v)} onClick={() => set("datosMin", Number(v))} style={pillBase(filtros.datosMin === v, C.cyan)}>{l}</button>
            ))}
          </div>
        </Section>
      )}

      {/* Canales — tv/paquete */}
      {(filtros.tipo === "tv" || filtros.tipo === "paquete" || filtros.tipo === "") && (
        <Section title="Canales TV mínimos">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {[[0, "Cualquiera"], [50, "50+"], [100, "100+"], [150, "150+"]].map(([v, l]) => (
              <button key={String(v)} onClick={() => set("canalesMin", Number(v))} style={pillBase(filtros.canalesMin === v, C.yellow)}>{l}</button>
            ))}
          </div>
        </Section>
      )}

      {/* Tecnología */}
      <Section title="Tecnología">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <button onClick={() => set("tecnologia", "")} style={pillBase(filtros.tecnologia === "", C.green)}>Todas</button>
          {TECNOLOGIAS.map((t) => (
            <button key={t} onClick={() => set("tecnologia", t)} style={pillBase(filtros.tecnologia === t, C.green)}>{t}</button>
          ))}
        </div>
      </Section>
    </div>
  );
};
