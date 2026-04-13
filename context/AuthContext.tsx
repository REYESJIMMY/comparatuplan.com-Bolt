"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/* ── Types ───────────────────────────────────────────────────── */
export interface Perfil {
  id:             string;
  nombre:         string | null;
  telefono:       string | null;
  ciudad:         string | null;
  estrato:        number | null;
  avatar_tipo:    string | null;
  mbps_necesarios:number | null;
  tipo_plan_rec:  string | null;
  acepta_habeas:  boolean;
  created_at:     string;
  updated_at:     string;
}

export interface Favorito {
  id:        string;
  id_crc:    string;
  operador:  string | null;
  nombre:    string | null;
  precio:    number | null;
  tipo:      string | null;
  created_at:string;
}

interface AuthCtxValue {
  user:           User | null;
  session:        Session | null;
  perfil:         Perfil | null;
  favoritos:      Favorito[];
  loading:        boolean;
  // Auth actions
  signInGoogle:   () => Promise<void>;
  signInEmail:    (email: string, password: string) => Promise<{ error: string | null }>;
  signUpEmail:    (email: string, password: string, nombre: string) => Promise<{ error: string | null }>;
  signInPhone:    (phone: string) => Promise<{ error: string | null }>;
  verifyOtp:      (phone: string, token: string) => Promise<{ error: string | null }>;
  signOut:        () => Promise<void>;
  // Perfil actions
  updatePerfil:   (data: Partial<Perfil>) => Promise<void>;
  // Favoritos actions
  toggleFavorito: (plan: { id_crc: string; operador: string; nombre: string; precio: number; tipo: string }) => Promise<void>;
  isFavorito:     (id_crc: string) => boolean;
  // Historial
  guardarAnalisis:(data: {
    avatar_tipo: string; dispositivos: any[]; mbps_base: number;
    mbps_rec: number; tipo_plan_rec: string; planes_vistos: string[];
  }) => Promise<void>;
}

const AuthCtx = createContext<AuthCtxValue | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};

/* ── Provider ────────────────────────────────────────────────── */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null);
  const [session,   setSession]   = useState<Session | null>(null);
  const [perfil,    setPerfil]    = useState<Perfil | null>(null);
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading,   setLoading]   = useState(true);

  /* ── Cargar perfil + favoritos ───────────────────────────── */
  const cargarPerfil = useCallback(async (uid: string) => {
    const [{ data: p }, { data: f }] = await Promise.all([
      supabase.from("perfiles").select("*").eq("id", uid).single(),
      supabase.from("favoritos").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    ]);
    if (p) setPerfil(p as Perfil);
    if (f) setFavoritos(f as Favorito[]);
  }, []);

  /* ── Session listener ────────────────────────────────────── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) cargarPerfil(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        cargarPerfil(session.user.id);
      } else {
        setPerfil(null);
        setFavoritos([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [cargarPerfil]);

  /* ── Auth actions ────────────────────────────────────────── */
  const signInGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options:  { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signInEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUpEmail = async (email: string, password: string, nombre: string) => {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: nombre } },
    });
    return { error: error?.message ?? null };
  };

  const signInPhone = async (phone: string) => {
    // Normaliza: agrega +57 si no tiene código de país
    const normalized = phone.startsWith("+") ? phone : `+57${phone.replace(/\s/g, "")}`;
    const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
    return { error: error?.message ?? null };
  };

  const verifyOtp = async (phone: string, token: string) => {
    const normalized = phone.startsWith("+") ? phone : `+57${phone.replace(/\s/g, "")}`;
    const { error } = await supabase.auth.verifyOtp({ phone: normalized, token, type: "sms" });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setPerfil(null);
    setFavoritos([]);
  };

  /* ── Perfil actions ──────────────────────────────────────── */
  const updatePerfil = async (data: Partial<Perfil>) => {
    if (!user) return;
    const { data: updated, error } = await supabase
      .from("perfiles")
      .upsert({ id: user.id, ...data })
      .select()
      .single();
    if (!error && updated) setPerfil(updated as Perfil);
  };

  /* ── Favoritos actions ───────────────────────────────────── */
  const toggleFavorito = async (plan: { id_crc: string; operador: string; nombre: string; precio: number; tipo: string }) => {
    if (!user) return;
    const existe = favoritos.some((f) => f.id_crc === plan.id_crc);
    if (existe) {
      await supabase.from("favoritos").delete().eq("user_id", user.id).eq("id_crc", plan.id_crc);
      setFavoritos((p) => p.filter((f) => f.id_crc !== plan.id_crc));
    } else {
      const { data } = await supabase
        .from("favoritos")
        .insert({ user_id: user.id, ...plan })
        .select()
        .single();
      if (data) setFavoritos((p) => [data as Favorito, ...p]);
    }
  };

  const isFavorito = (id_crc: string) => favoritos.some((f) => f.id_crc === id_crc);

  /* ── Historial ───────────────────────────────────────────── */
  const guardarAnalisis = async (data: {
    avatar_tipo: string; dispositivos: any[]; mbps_base: number;
    mbps_rec: number; tipo_plan_rec: string; planes_vistos: string[];
  }) => {
    if (!user) return;
    await supabase.from("historial_busquedas").insert({ user_id: user.id, ...data });
  };

  return (
    <AuthCtx.Provider value={{
      user, session, perfil, favoritos, loading,
      signInGoogle, signInEmail, signUpEmail, signInPhone, verifyOtp, signOut,
      updatePerfil, toggleFavorito, isFavorito, guardarAnalisis,
    }}>
      {children}
    </AuthCtx.Provider>
  );
}
