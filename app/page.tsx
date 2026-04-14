"use client";
import { useState, useEffect } from "react";

import { Header }      from "@/components/layout/Header";
import { OpsSlider }   from "@/components/layout/OpsSlider";
import { Footer }      from "@/components/layout/Footer";
import { AuthModal }   from "@/components/layout/AuthModal";
import { SearchBar, CartDrawer, Chatbot } from "@/components/layout/Overlays";
import { GameFlow }    from "@/components/game/GameFlow";
import {
  Hero, FeaturedPlans, Companies, Offers, SocialSection, Blog, Sidebar, QuizFlow,
} from "@/components/sections";

type View = "landing" | "game" | "quiz";

interface CartItem {
  id: string; name: string; price: number; emoji: string; color: string; qty: number;
}

export default function Home() {
  const [view,       setView]       = useState<View>("landing");
  const [searchOpen, setSearchOpen] = useState(false);
  const [authMode,   setAuthMode]   = useState<string | null>(null);
  const [cartOpen,   setCartOpen]   = useState(false);
  const [cart,       setCart]       = useState<CartItem[]>([]);

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
  };

  return (
    <div style={{ background: "#04040f", minHeight: "100vh", color: "#fff", overflowX: "hidden" }}>

      {/* ── Overlays ──────────────────────────────────────────── */}
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

      {/* ── Fixed header spacer ───────────────────────────────── */}
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
            <main className="main-col">
              <Hero
                onGame={() => setView("game")}
                onQuiz={() => setView("quiz")}
                addToCart={addToCart}
              />
              <FeaturedPlans onQuiz={() => setView("quiz")} addToCart={addToCart} />
              <Companies />
              <Offers addToCart={addToCart} />
              <SocialSection />
              <Blog />
            </main>
            <Sidebar
              onSearch={() => setSearchOpen(true)}
              onGame={() => setView("game")}
              onQuiz={() => setView("quiz")}
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
