"use client";
import { useState } from "react";
import { X, LogIn, UserPlus, Mail, Phone, Eye, EyeOff, ArrowLeft, Loader } from "lucide-react";
import { C } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

/* ── small helpers ───────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#EA4335" d="M5.27 9.77A7.2 7.2 0 0 1 12 4.8c1.73 0 3.29.63 4.51 1.66l3.37-3.37A12 12 0 0 0 0 12c0 1.99.49 3.86 1.35 5.51l4-3.1a7.2 7.2 0 0 1-.08-.64Z"/>
    <path fill="#FBBC05" d="M12 19.2c-2.34 0-4.41-.94-5.95-2.46l-4 3.1A12 12 0 0 0 12 24c3.26 0 6.21-1.3 8.39-3.39l-3.8-2.94A7.17 7.17 0 0 1 12 19.2Z"/>
    <path fill="#4285F4" d="M23.76 12.27c0-.8-.07-1.57-.2-2.31H12v4.37h6.6a5.64 5.64 0 0 1-2.44 3.7l3.8 2.94C21.98 18.97 23.76 15.87 23.76 12.27Z"/>
    <path fill="#34A853" d="M6.05 16.74A7.16 7.16 0 0 1 4.8 12c0-1.67.57-3.2 1.52-4.42l-4-3.1A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.35l4.8-3.71Z"/>
  </svg>
);

const Input = ({ icon: Icon, ...props }: any) => (
  <div style={{ position: "relative" }}>
    {Icon && <Icon size={14} color={C.muted} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />}
    <input
      {...props}
      style={{
        width: "100%", background: "rgba(255,255,255,0.04)", border: `1px solid ${C.borderSoft}`,
        borderRadius: 10, padding: Icon ? "10px 13px 10px 36px" : "10px 13px",
        color: "#fff", fontSize: 13, outline: "none", transition: "border-color .18s",
        ...(props.style ?? {}),
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = C.neon; }}
      onBlur={(e)  => { e.currentTarget.style.borderColor = C.borderSoft; }}
    />
  </div>
);

const Btn = ({ children, loading: isLoading, variant = "primary", onClick, disabled, style = {} }: any) => (
  <button
    onClick={onClick}
    disabled={disabled || isLoading}
    style={{
      width: "100%", padding: "11px 0", borderRadius: 10,
      background: variant === "primary" ? "linear-gradient(135deg,#0070cc,#0050aa)"
                : variant === "google"  ? "rgba(255,255,255,0.06)"
                : "transparent",
      border: variant === "outline" ? `1px solid ${C.borderSoft}` : "none",
      color: "#fff", fontWeight: 700, fontSize: 13, cursor: isLoading || disabled ? "default" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      opacity: disabled ? 0.5 : 1, transition: "opacity .2s",
      boxShadow: variant === "primary" ? `0 0 18px rgba(0,112,204,0.4)` : "none",
      ...style,
    }}
  >
    {isLoading ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : children}
  </button>
);

const Err = ({ msg }: { msg: string }) => (
  <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#fca5a5" }}>
    {msg}
  </div>
);

const Divider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ flex: 1, height: 1, background: C.borderSoft }} />
    <span style={{ color: C.muted, fontSize: 11 }}>o continúa con</span>
    <div style={{ flex: 1, height: 1, background: C.borderSoft }} />
  </div>
);

/* ── Tab types ───────────────────────────────────────────────── */
type Tab    = "login" | "register" | "phone";
type PhStep = "input" | "otp";

/* ── Main modal ──────────────────────────────────────────────── */
export const AuthModal = ({ mode = "login", onClose }: { mode?: string; onClose: () => void }) => {
  const { signInGoogle, signInEmail, signUpEmail, signInPhone, verifyOtp } = useAuth();

  const [tab,    setTab]    = useState<Tab>(mode as Tab);
  const [phStep, setPhStep] = useState<PhStep>("input");
  const [busy,   setBusy]   = useState(false);
  const [err,    setErr]    = useState("");
  const [ok,     setOk]     = useState("");
  const [showPw, setShowPw] = useState(false);

  // Email/pass
  const [nombre,  setNombre]  = useState("");
  const [email,   setEmail]   = useState("");
  const [pw,      setPw]      = useState("");
  // Phone
  const [phone,   setPhone]   = useState("");
  const [otp,     setOtp]     = useState("");

  const reset = (t: Tab) => { setTab(t); setErr(""); setOk(""); setPhStep("input"); };

  /* ── Handlers ────────────────────────────────────────────── */
  const handleGoogle = async () => {
    setBusy(true); setErr("");
    await signInGoogle();
    setBusy(false);
  };

  const handleEmail = async () => {
    if (!email || !pw) { setErr("Completa todos los campos"); return; }
    setBusy(true); setErr("");
    const res = tab === "login"
      ? await signInEmail(email, pw)
      : await signUpEmail(email, pw, nombre);
    setBusy(false);
    if (res.error) { setErr(res.error); return; }
    if (tab === "register") setOk("¡Cuenta creada! Revisa tu correo para confirmar.");
    else onClose();
  };

  const handlePhone = async () => {
    if (!phone) { setErr("Ingresa tu número"); return; }
    setBusy(true); setErr("");
    const res = await signInPhone(phone);
    setBusy(false);
    if (res.error) { setErr(res.error); return; }
    setPhStep("otp");
    setOk("Código enviado por SMS 📱");
  };

  const handleOtp = async () => {
    if (otp.length < 6) { setErr("El código tiene 6 dígitos"); return; }
    setBusy(true); setErr("");
    const res = await verifyOtp(phone, otp);
    setBusy(false);
    if (res.error) { setErr(res.error); return; }
    onClose();
  };

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(4,4,15,0.92)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(8,6,24,0.99)", border: `1px solid ${C.border}`,
          borderRadius: 20, padding: 28, maxWidth: 380, width: "100%",
          boxShadow: `0 0 80px rgba(0,112,204,0.15)`, position: "relative",
          maxHeight: "90vh", overflowY: "auto",
        }}
      >
        {/* Close */}
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={13} />
        </button>

        {/* Logo mark */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#0070cc,#0050aa)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", boxShadow: "0 0 20px rgba(0,112,204,0.4)" }}>
            {tab === "register" ? <UserPlus size={20} color="#fff" /> : <LogIn size={20} color="#fff" />}
          </div>
          <div style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>
            {tab === "login"    && "¡Bienvenido de nuevo!"}
            {tab === "register" && "Crea tu cuenta gratis"}
            {tab === "phone"    && (phStep === "input" ? "Ingresa con WhatsApp" : "Confirma tu número")}
          </div>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>
            {tab === "login"    && "Compara, guarda y ahorra más"}
            {tab === "register" && "Guarda tus planes favoritos"}
            {tab === "phone"    && (phStep === "input" ? "Te enviamos un código por SMS" : `Código enviado a +57 ${phone}`)}
          </div>
        </div>

        {/* Tab switcher — only for login/register */}
        {tab !== "phone" && (
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 3, marginBottom: 18 }}>
            {(["login", "register"] as Tab[]).map((t) => (
              <button key={t} onClick={() => reset(t)} style={{
                flex: 1, padding: "7px 0", borderRadius: 8, border: "none",
                background: tab === t ? "linear-gradient(135deg,#0070cc,#0050aa)" : "transparent",
                color: tab === t ? "#fff" : C.muted, fontWeight: 700, fontSize: 12, cursor: "pointer",
              }}>
                {t === "login" ? "Iniciar sesión" : "Registrarse"}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* ── Phone flow ─────────────────────────────────── */}
          {tab === "phone" && phStep === "input" && (
            <>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${C.borderSoft}`, borderRadius: 10, padding: "10px 12px", fontSize: 13, color: C.muted, flexShrink: 0 }}>🇨🇴 +57</div>
                <Input placeholder="300 000 0000" value={phone} onChange={(e: any) => setPhone(e.target.value)} type="tel" icon={Phone} style={{ flex: 1 }} />
              </div>
              {err && <Err msg={err} />}
              {ok  && <div style={{ color: C.green, fontSize: 12 }}>{ok}</div>}
              <Btn onClick={handlePhone} loading={busy}>Enviar código SMS</Btn>
              <button onClick={() => reset("login")} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <ArrowLeft size={12} />Volver
              </button>
            </>
          )}

          {tab === "phone" && phStep === "otp" && (
            <>
              <div style={{ color: C.green, fontSize: 12, textAlign: "center" }}>✓ {ok}</div>
              <Input
                placeholder="123456"
                value={otp}
                onChange={(e: any) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                type="text"
                inputMode="numeric"
                maxLength={6}
                style={{ textAlign: "center", fontSize: 22, letterSpacing: 8, fontWeight: 700 }}
              />
              {err && <Err msg={err} />}
              <Btn onClick={handleOtp} loading={busy}>Verificar código</Btn>
              <button onClick={() => { setPhStep("input"); setOtp(""); setErr(""); setOk(""); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                <ArrowLeft size={12} />Reenviar código
              </button>
            </>
          )}

          {/* ── Email flows ────────────────────────────────── */}
          {tab !== "phone" && (
            <>
              {/* Google */}
              <Btn variant="google" onClick={handleGoogle} loading={busy}>
                <GoogleIcon />Continuar con Google
              </Btn>

              <Divider />

              {/* Register extra field */}
              {tab === "register" && (
                <Input placeholder="Nombre completo" value={nombre} onChange={(e: any) => setNombre(e.target.value)} icon={UserPlus} />
              )}

              <Input placeholder="Correo electrónico" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} icon={Mail} />

              {/* Password with show/hide */}
              <div style={{ position: "relative" }}>
                <Input
                  placeholder="Contraseña"
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e: any) => setPw(e.target.value)}
                  onKeyDown={(e: any) => e.key === "Enter" && handleEmail()}
                  style={{ paddingRight: 40 }}
                />
                <button
                  onClick={() => setShowPw((p) => !p)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.muted, display: "flex" }}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {err && <Err msg={err} />}
              {ok  && <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#6ee7b7" }}>{ok}</div>}

              <Btn onClick={handleEmail} loading={busy} disabled={!email || !pw}>
                {tab === "login" ? "Entrar" : "Crear cuenta"}
              </Btn>

              {/* Phone option */}
              <Divider />
              <Btn variant="outline" onClick={() => reset("phone")}>
                <Phone size={14} />Ingresar con número celular
              </Btn>

              {tab === "login" && (
                <button style={{ background: "none", border: "none", color: C.muted, fontSize: 11, cursor: "pointer", textAlign: "center" }}>
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </>
          )}
        </div>

        {/* Terms note */}
        <p style={{ color: "rgba(180,190,220,0.3)", fontSize: 10, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
          Al continuar aceptas nuestros{" "}
          <a href="/legal/terminos" style={{ color: C.neon }}>Términos</a>{" "}
          y{" "}
          <a href="/legal/privacidad" style={{ color: C.neon }}>Política de Privacidad</a>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
