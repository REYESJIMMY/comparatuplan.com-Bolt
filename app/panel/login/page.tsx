"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/layout/AuthModal";
import { useRouter } from "next/navigation";

export default function PanelLoginPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [closed, setClosed] = useState(false);

  if (user && !closed) router.replace("/panel");

  return (
    <div style={{ minHeight: "100vh", background: "#0b1220", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <AuthModal mode="login" onClose={() => setClosed(true)} />
    </div>
  );
}
