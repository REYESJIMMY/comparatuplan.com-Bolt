"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/layout/AuthModal";
import { useRouter } from "next/navigation";

/**
 * Login del panel — reutiliza el AuthModal existente en vez de
 * duplicar lógica de auth. La redirección post-login se hace en
 * un useEffect (nunca directo en el render) para evitar loops
 * y warnings de React.
 */
export default function PanelLoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/panel");
  }, [loading, user, router]);

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {!closed && <AuthModal mode="login" onClose={() => setClosed(true)} />}
    </div>
  );
}
