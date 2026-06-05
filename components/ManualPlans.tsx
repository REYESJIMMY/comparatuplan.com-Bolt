'use client';
import { ShieldCheck, Zap } from 'lucide-react';

interface PlanManual {
  id: string;
  operator: string;
  logoColor: string;
  speed: string;
  price: number;
  features: string[];
  badge?: string;
}

interface ManualPlansProps {
  addToCart: (item: any) => void;
  isDarkMode: boolean;
}

export function ManualPlans({ addToCart, isDarkMode }: ManualPlansProps) {
  // Aquí puedes agregar manualmente los planes que no reporta la CRC
  const mejoresPlanes: PlanManual[] = [
    {
      id: 'man-claro-1',
      operator: 'Claro Local Pro',
      logoColor: '#ef4444',
      speed: '500 Mbps + TV',
      price: 89900,
      features: ['Fibra Simétrica', 'Suscripción Prime Video', 'Instalación en 24h'],
      badge: 'Exclusivo Web'
    },
    {
      id: 'man-movistar-1',
      operator: 'Movistar Fibra',
      logoColor: '#00d2ff',
      speed: '400 Mbps Simétricos',
      price: 75900,
      features: ['Router WiFi 6 Gratis', 'Pasa Gigas Móvil', 'Sin permanencia'],
      badge: 'Mejor Precio'
    }
  ];

  return (
    <section style={{ padding: '20px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <ShieldCheck size={18} color="#00f6ff" />
        <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: isDarkMode ? '#fff' : '#0f172a' }}>
          ⭐ Los Mejores del Mercado <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>(Verificados Manualmente)</span>
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        {mejoresPlanes.map((plan) => (
          <div
            key={plan.id}
            style={{
              background: isDarkMode ? 'rgba(15, 23, 42, 0.45)' : '#fff',
              border: `1px solid ${plan.logoColor}30`,
              borderRadius: '16px',
              padding: '18px',
              boxShadow: isDarkMode ? 'none' : '0 4px 12px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}
          >
            {plan.badge && (
              <span style={{ position: 'absolute', top: '12px', right: '12px', background: `${plan.logoColor}15`, color: plan.logoColor, fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px', border: `1px solid ${plan.logoColor}30` }}>
                {plan.badge}
              </span>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '8px', h: '8px', height: '8px', borderRadius: '50%', background: plan.logoColor }} />
                <span style={{ fontWeight: 700, fontSize: '13px', color: isDarkMode ? '#e2e8f0' : '#334155' }}>{plan.operator}</span>
              </div>
              <h4 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '12px' }}>{plan.speed}</h4>
              
              <ul style={{ padding: 0, margin: '0 0 16px 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {plan.features.map((f, idx) => (
                  <li key={idx} style={{ fontSize: '11px', color: isDarkMode ? '#94a3b8' : '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={10} color={plan.logoColor} /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: plan.logoColor }}>${plan.price.toLocaleString()}</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}> / mes</span>
              </div>
              <button
                onClick={() => addToCart({ id: plan.id, name: `${plan.operator} - ${plan.speed}`, price: plan.price, emoji: '⚡', color: plan.logoColor, qty: 1 })}
                style={{ width: '100%', background: plan.logoColor, color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 0', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
              >
                Solicitar Cobertura
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
