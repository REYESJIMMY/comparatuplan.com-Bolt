'use client';

interface OfferItem {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  discount?: string;
  bgGradient: string;
  emoji: string;
}

interface OffersProps {
  addToCart: (item: any) => void;
}

export function Offers({ addToCart }: OffersProps) {
  // Datos simulados estructurados para la Bento Grid
  const offersData: OfferItem[] = [
    {
      id: 'off-1',
      title: 'Router Rompemuros WiFi 6',
      subtitle: 'Ideal para casas de 2 o más pisos. Adiós a las zonas muertas.',
      badge: 'Más Vendido',
      discount: '-34% HOY',
      bgGradient: 'from-cyan-950/40 to-blue-950/30',
      emoji: '⚡'
    },
    {
      id: 'off-2',
      title: 'Plan Gamer Pro',
      subtitle: 'Fibra simétrica con ping ultra bajo.',
      badge: 'Premium',
      bgGradient: 'from-purple-950/40 to-indigo-950/30',
      emoji: '🎮'
    },
    {
      id: 'off-3',
      title: 'Dupla Entretenimiento',
      subtitle: 'Internet + Licencia de Max incluida.',
      bgGradient: 'from-emerald-950/40 to-teal-950/30',
      emoji: '📺'
    }
  ];

  return (
    <section className="py-12 px-2">
      <h3 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
        <span className="text-cyan-400">❖</span> Ofertas Destacadas en Tecnología
      </h3>
      
      {/* Estructura Bento Grid de 3 Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[220px]">
        {offersData.map((item, index) => (
          <div
            key={item.id}
            // El primer elemento (index 0) ocupa 2 columnas de ancho en escritorio
            className={`relative rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-br ${item.bgGradient} transition-all duration-300 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 group backdrop-blur-sm ${
              index === 0 ? 'md:col-span-2' : ''
            }`}
          >
            {/* Decoración de fondo */}
            <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 select-none group-hover:scale-110 transition-transform duration-300">
              {item.emoji}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{item.emoji}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {item.badge}
                  </span>
                )}
                {item.discount && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                    {item.discount}
                  </span>
                )}
              </div>
              <h4 className="text-xl font-bold text-white tracking-tight">{item.title}</h4>
              <p className="text-sm text-slate-400 mt-1 max-w-md balance">{item.subtitle}</p>
            </div>

            <button
              onClick={() => addToCart({ id: item.id, name: item.title, price: 0, emoji: item.emoji, color: 'cyan', qty: 1 })}
              className="self-start mt-4 bg-slate-900/80 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700/60 hover:border-cyan-400 transition-all duration-300"
            >
              Adquirir beneficio
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
