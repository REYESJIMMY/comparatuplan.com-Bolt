"use client";
import { useState, useEffect } from "react";

import { Header }      from "@/components/layout/Header";
import { OpsSlider }   from "@/components/layout/OpsSlider";
import { Footer }      from "@/components/layout/Footer";
import { AuthModal }   from "@/components/layout/AuthModal";
import { SearchBar, CartDrawer, Chatbot } from "@/components/layout/Overlays";
import { GameFlow }    from "@/components/game/GameFlow";
import { MovilFlow }   from "@/components/game/MovilFlow";
import { CoberturaForm, type UbicacionData } from "@/components/game/CoberturaForm";
import { SegmentSelector } from "@/components/game/SegmentSelector";
import ParallaxSection from '@/components/ParallaxSection';
import { BentoOffers } from '@/components/BentoOffers'; 
import { ManualPlans } from '@/components/ManualPlans'; // 📦 IMPORTACIÓN COMPONENTE MANUAL
import {
  Hero, FeaturedPlans, Companies, Offers, SocialSection, Blog, Sidebar, QuizFlow,
} from "@/components/sections"; 

type View = "landing" | "cobertura" | "segment" | "game" | "movil" | "quiz";

interface CartItem {
  id: string; name: string; price: number; emoji: string; color: string; qty: number;
}

export default function Home() {
  const [view,       setView]       = useState<View>("landing");
  const [ubicacion,  setUbicacion]  = useState<UbicacionData | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authMode,   setAuthMode]   = useState<string | null>(null);
  const [cartOpen,   setCartOpen]   = useState(false);
  const [cart,       setCart]       = useState<CartItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  

  /* Global keyboard shortcuts */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSearchOpen(false); setAuthMode(null); }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    const navFn = (e: CustomEvent) => {
      if (e.detail === "game") setView("game");
      if (e.detail === "quiz") setView("quiz");
    };
    window.addEventListener("keydown", fn);
    document.addEventListener("navAction", navFn as EventListener);
    return () => {
      window.removeEventListener("keydown", fn);
      document.removeEventListener("navAction", navFn as EventListener);
    };
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (item: CartItem) => {
    setCart((p) => {
      const idx = p.findIndex((x) => x.id === item.id);
      if (idx !== -1) { const n = [...p]; n[idx] = { ...n[idx], qty: n[idx].qty + 1 }; return n; }
      return [...p, { ...item, qty: 1 }];
    });
    setCartOpen(true);
  };

  const handleAction = (a: string) => {
    if (a === "game") setView("game");
    if (a === "quiz") setView("quiz");
    if (a === "login")    setAuthMode("login");
    if (a === "register") setAuthMode("register");
    if (a === "toggleTheme") setIsDarkMode(!isDarkMode);
  };

  return (
    <div 
      style={{ 
        background: isDarkMode ? "#04040f" : "#f8fafc", 
        minHeight: "100vh", 
        color: isDarkMode ? "#fff" : "#0f172a", 
        overflowX: "hidden",
        transition: "background 0.3s ease, color 0.3s ease"
      }}
    >

      {/* ── Overlays ──────────────────────────────────────────── */}
      <Header
        onSearch={() => setSearchOpen(true)}
        onOpenAuth={setAuthMode}
        cartCount={cartCount}
        onCart={() => setCartOpen(true)}
        onAction={handleAction}
        isDarkMode={isDarkMode}
      />
      <Chatbot />
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />}
      <CartDrawer cart={cart} setCart={setCart} open={cartOpen} onClose={() => setCartOpen(false)} />

      <div style={{ height: 95 }} />
      <OpsSlider />

      {/* ── Views ─────────────────────────────────────────────── */}
      {view === "game" && (
        <GameFlow onBack={() => setView("landing")} />
      )}

      {view === "quiz" && (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px 60px", animation: "fadeUp .45s ease-out" }}>
          <QuizFlow onBack={() => setView("landing")} />
        </div>
      )}

      {view === "landing" && (
        <div className="page-wrap">
          <div className="content-grid">
            
            {/* COLUMNA PRINCIPAL DE CONTENIDO */}
            <main className="main-col">
              <Hero
                onGame={() => setView("game")}
                onQuiz={() => setView("quiz")}
                addToCart={addToCart}
              />
              
              {/* 🌟 1. UBICACIÓN REQUERIDA: Arriba de los planes destacados cargamos las inyecciones manuales fuera de la CRC */}
              <ManualPlans addToCart={addToCart} isDarkMode={isDarkMode} />

              <FeaturedPlans onQuiz={() => setView("quiz")} addToCart={addToCart} />
              
              <ParallaxSection 
                imageSrc="https://unsplash.com"
                imageAlt="Internet Hogar"
                tag="Conectividad de Fibra"
                title="Lleva tu hogar al siguiente nivel con WiFi 6"
                description="Compara planes de Internet Hogar en tiempo real con estabilidad garantizada."
                buttonText="Optimizar Mi Internet"
              />

              <BentoOffers addToCart={addToCart} />

              <ParallaxSection 
                imageSrc="https://unsplash.com"
                imageAlt="Planes Móviles"
                tag="Datos Ilimitados"
                title="Navega sin límites estés donde estés"
                description="Encuentra combos móviles postpago con la mejor cobertura del país."
                buttonText="Comparar Planes Móviles"
                reverse={true}
              />

              <SocialSection />
              <Blog />
            </main>

            {/* COLUMNA LATERAL (BARRA LATERAL) */}
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Sidebar
                onSearch={() => setSearchOpen(true)}
                onGame={() => setView("game")}
                onQuiz={() => setView("quiz")}
                isDarkMode={isDarkMode}
              />
              
              {/* 🔥 2. UBICACIÓN REQUERIDA: Bloque dedicado debajo del Sidebar para Promociones Hot del Admin */}
              <div 
                style={{ 
                  background: isDarkMode ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(4,4,15,0.8))' : '#fff',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '13px',
                  padding: '16px',
                  boxShadow: isDarkMode ? 'none' : '0 4px 12px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 900, background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>HOT OFFER</span>
                  <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700, animation: 'blink 1.5s infinite' }}>⚡ ¡LIQUIDACIÓN!</span>
                </div>
                <h5 style={{ fontWeight: 800, fontSize: '12px', margin: '0 0 4px 0' }}>Router Mesh Extender</h5>
                <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 12px 0', lineHeight: '1.4' }}>Tu panel administrativo reporta un inventario bajo. Adquiérelo antes de que se agote.</p>
                <button 
                  onClick={() => addToCart({ id: 'hot-sidebar', name: 'Router Mesh Extender Admin', price: 45000, emoji: '🔥', color: '#ef4444', qty: 1 })}
                  style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', padding: '6px 0', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Garantizar Oferta Mini
                </button>
              </div>
            </aside>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
