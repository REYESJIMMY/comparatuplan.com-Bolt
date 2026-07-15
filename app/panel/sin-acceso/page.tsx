import Link from "next/link";

/**
 * Página mostrada cuando el middleware bloquea el acceso:
 * - Usuario sin perfil o perfil.activo_asesor = false
 * - Rol insuficiente para la ruta solicitada (ej: asesor entrando a /panel/admin)
 */
export default function SinAccesoPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#0b1220", color: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 16, padding: 24, textAlign: "center",
    }}>
      <div style={{ fontSize: 52 }}>🚫</div>
      <h1 style={{ fontSize: 20, fontWeight: 800 }}>No tienes acceso a esta sección</h1>
      <p style={{ color: "#94a3b8", fontSize: 13, maxWidth: 360 }}>
        Tu cuenta no tiene el rol necesario para ver esta página, o tu acceso al
        panel de asesores está desactivado. Si crees que es un error, contacta
        a tu supervisor o al administrador.
      </p>
      <Link
        href="/panel"
        style={{
          background: "linear-gradient(135deg,#0070cc,#0050aa)",
          borderRadius: 10, padding: "10px 22px", color: "#fff",
          fontWeight: 700, fontSize: 13, textDecoration: "none",
        }}
      >
        Volver al dashboard
      </Link>
    </div>
  );
}
