'use client';
import { ShoppingCart } from 'lucide-react'; // Asegúrate de tener lucide-react o cámbialo por tu icono

// Variables simuladas de paleta basadas en tu diseño
const C = {
  red: '#ff4a4a',
  neon: '#00f6ff',
  cyan: '#00d2ff',
  green: '#39ff14',
  neon2: '#ff007f',
  yellow: '#ffdf00',
  muted: '#64748b'
};

export function BentoOffers({ addToCart }: { addToCart: (item: any) => void }) {
  const items = [
    { name: "Router WiFi 6 AX3000", price: 189900, old: 289900, emoji: "📡", badge: "-34%", color: C.neon, subtitle: "Ideal para casas de 2 o más pisos. Adiós a las zonas muertas." },
    { name: "Repetidor Mesh Tenda",  price: 89900,  old: 129900, emoji: "📶", badge: "-31%", color: C.cyan, subtitle: "Amplía tu cobertura de internet inalámbrico." },
    { name: "Cable Cat8 10m",        price: 29900,  old: 45900,  emoji: "🌐", badge: "-35%", color: C.green, subtitle: "Velocidad pura y estable para gaming." },
    { name: "Gaming Mouse 25K",      price: 149900, old: 249900, emoji: "🖱️", badge: "-40%", color: C.red, subtitle: "Precisión extrema para tus partidas pro." },
    { name: "Auriculares ANC Pro",   price: 119900, old: 199900, emoji: "🎧", badge: "-40%", color: C.neon2, subtitle: "Cancelación de ruido activa premium." },
    { name: "Cargador 65W GaN",      price: 49900,  old: 79900,  emoji: "🔋", badge: "-37%", color: C.yellow, subtitle: "Carga rápida inteligente multidevice." },
  ];

  return (
    <section style={{ padding: "24px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <span style={{ background: C.red, color: '#fff', borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 900 }}>🔥 OFERTAS ESPECIALES</span>
          <h2 style={{ fontWeight: 900, fontSize: "clamp(1.1rem,3vw,1.5rem)", marginTop: 8, color: "inherit" }}>
            Equipos y accesorios tech
          </h2>
        </div>
        <span style={{ color: C.red, fontSize: 11, fontWeight: 800, animation: "blink 2s infinite" }}>⚡ Solo hoy</span>
      </div>

      <div className="offers-bento-grid">
        {items.map((item, i) => {
          const isFeatured = i === 0;
          return (
            <div
              key={i}
              className={isFeatured ? "bento-featured" : ""}
              style={{
                background: "rgba(8,6,28,0.45)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${item.color}18`,
                borderRadius: 16,
                padding: isFeatured ? "24px" : "16px 14px",
                cursor: "pointer",
                transition: "all .3s ease",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                overflow: "hidden"
              }}
            >
              <div style={{ position: "absolute", top: 10, left: 10, background: C.red, color: "#fff", borderRadius: 6, padding: "2px 6px", fontSize: 9, fontWeight: 900, zIndex: 2 }}>
                {item.badge}
              </div>

              <div>
                <div style={{ display: "flex", gap: 16, alignItems: "center", flexDirection: isFeatured ? "row" : "column", marginTop: 12 }}>
                  <div style={{ fontSize: isFeatured ? 48 : 28 }}>{item.emoji}</div>
                  <div style={{ flex: 1, textAlign: isFeatured ? "left" : "center" }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: isFeatured ? 15 : 11, marginBottom: 4 }}>
                      {item.name}
                    </div>
                    <div style={{ color: "rgba(148,163,184,0.7)", fontSize: isFeatured ? 12 : 10, lineHeight: 1.3 }}>
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <span style={{ color: item.color, fontWeight: 900, fontSize: isFeatured ? 15 : 13 }}>
                    ${item.price.toLocaleString()}
                  </span>
                  <span style={{ color: C.muted, fontSize: 9, textDecoration: "line-through", marginLeft: 6 }}>
                    ${item.old.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart({ id: `offer-${i}`, name: item.name, price: item.price, emoji: item.emoji, color: item.color, qty: 1 });
                  }}
                  style={{
                    width: "100%",
                    background: `${item.color}12`,
                    border: `1px solid ${item.color}28`,
                    borderRadius: 8,
                    padding: "6px 0",
                    color: item.color,
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4
                  }}
                >
                  Agregar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .offers-bento-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width: 768px) {
          .offers-bento-grid { grid-template-columns: repeat(3, 1fr); }
          .bento-featured { grid-column: span 2; }
        }
      `}</style>
    </section>
  );
}
