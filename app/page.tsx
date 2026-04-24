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
import {
  Hero, OfertasHotSection, FeaturedPlans, Companies,
  ReferieGanaSection, Offers, SocialSection, Blog, Sidebar, QuizFlow,
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

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSearchOpen(false); setAuthMode(null); }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true); }
    };
    const navFn = (e: CustomEvent) => {
      if (e.detail === "game")      setView("game");
      if (e.detail === "quiz")      setView("quiz");
      if (e.detail === "movil")     setView("movil");
      if (e.detail === "cobertura") setView("cobertura");
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
    if (a === "game")      setView("game");
    if (a === "quiz")      setView("quiz");
    if (a === "movil")     setView("movil");
    if (a === "cobertura") setView("cobertura");
    if (a === "login")     setAuthMode("login");
    if (a === "register")  setAuthMode("register");
  };

  const handleUbicacion = (data: UbicacionData) => {
    setUbicacion(data);
    setView("segment");
  };

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh", color: "var(--text-body)", overflowX: "hidden" }}>

      <Header
        onSearch={() => setSearchOpen(true)}
        onOpenAuth={setAuthMode}
        cartCount={cartCount}
        onCart={() => setCartOpen(true)}
        onAction={handleAction}
      />
      <Chatbot />
      <SearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />
      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />}
      <CartDrawer cart={cart} setCart={setCart} open={cartOpen} onClose={() => setCartOpen(false)} />

      <div style={{ height: 95 }} />
      <OpsSlider />

      {/* Formulario de cobertura */}
      {view === "cobertura" && (
        <CoberturaForm onContinuar={handleUbicacion} onCancel={() => setView("landing")} />
      )}

      {/* Selector Hogar / Móvil */}
      {view === "segment" && ubicacion && (
        <SegmentSelector
          ubicacion={ubicacion}
          onHogar={() => setView("game")}
          onMovil={() => setView("movil")}
          onBack={() => setView("cobertura")}
          onCancel={() => setView("landing")}
        />
      )}

      {/* GameFlow Hogar */}
      {view === "game" && <GameFlow onBack={() => setView("landing")} />}

      {/* MovilFlow */}
      {view === "movil" && <MovilFlow onBack={() => setView("landing")} />}

      {/* QuizFlow */}
      {view === "quiz" && (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px 60px" }}>
          <QuizFlow onBack={() => setView("landing")} />
        </div>
      )}

      {/* Landing — orden del body */}
      {view === "landing" && (
        <div className="page-wrap">
          <div className="content-grid">
            <main className="main-col">
              {/* 1. Hero */}
              <Hero
                onGame={() => setView("game")}
                onMovil={() => setView("movil")}
                onSegment={() => setView("cobertura")}
                addToCart={addToCart}
              />
              {/* 2. Ofertas Hot — dinámicas, solo aparece si hay ofertas activas */}
              <OfertasHotSection />
              {/* 3. Planes destacados — estructurales */}
              <FeaturedPlans onSegment={() => setView("cobertura")} addToCart={addToCart} />
              {/* 4. Empresas */}
              <Companies />
              {/* 5. Refiere & Gana — con link a Apprecio */}
              <ReferieGanaSection />
              {/* 6. Equipos tech */}
              <Offers addToCart={addToCart} />
              {/* 7. ETB Social — al final */}
              <SocialSection />
              {/* 8. Blog */}
              <Blog />
            </main>
            <Sidebar
              onSearch={() => setSearchOpen(true)}
              onGame={() => setView("game")}
              onMovil={() => setView("movil")}
              onSegment={() => setView("cobertura")}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
