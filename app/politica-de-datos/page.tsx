export default function PoliticaDatos() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "100px 24px 60px", color: "#fff", fontFamily: "Inter, system-ui", lineHeight: 1.8 }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: 8, background: "linear-gradient(90deg,#00d4ff,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Política de Tratamiento de Datos Personales
      </h1>
      <p style={{ color: "rgba(180,190,220,0.6)", marginBottom: 40, fontSize: 13 }}>
        Conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013 — Colombia
      </p>

      {[
        {
          titulo: "1. Responsable del Tratamiento",
          texto: "ComparaTuPlan.com es el responsable del tratamiento de los datos personales recolectados a través de esta plataforma. Contacto: contacto@comparatuplan.com · WhatsApp: +57 305 787 6992"
        },
        {
          titulo: "2. Datos que recolectamos",
          texto: "Recolectamos nombre, correo electrónico, número de teléfono, ciudad, estrato socioeconómico y dirección, únicamente cuando el usuario los suministra voluntariamente al registrarse o consultar cobertura."
        },
        {
          titulo: "3. Finalidad del tratamiento",
          texto: "Los datos son usados para: (a) Personalizar la experiencia de comparación de planes de telecomunicaciones. (b) Enviar notificaciones sobre cambios de precio de planes de interés. (c) Conectar al usuario con operadores de telecomunicaciones. (d) Generar estadísticas anónimas de uso de la plataforma. (e) Desarrollar campañas de comunicación relacionadas con el servicio."
        },
        {
          titulo: "4. Derechos del titular",
          texto: "El titular de los datos tiene derecho a: Conocer, actualizar y rectificar sus datos. Solicitar prueba de la autorización otorgada. Ser informado sobre el uso de sus datos. Presentar quejas ante la Superintendencia de Industria y Comercio. Revocar la autorización y solicitar la supresión de sus datos."
        },
        {
          titulo: "5. Transferencia de datos",
          texto: "Los datos podrán ser compartidos con los operadores de telecomunicaciones (Claro, Movistar, ETB, Tigo y otros) únicamente para gestionar la solicitud de información o contratación de planes iniciada por el usuario."
        },
        {
          titulo: "6. Tiempo de conservación",
          texto: "Los datos se conservarán durante el tiempo en que el usuario mantenga una cuenta activa en la plataforma, y hasta por 2 años después de su última interacción, salvo que el titular solicite su eliminación antes."
        },
        {
          titulo: "7. Seguridad",
          texto: "ComparaTuPlan.com utiliza Supabase como proveedor de base de datos con cifrado en tránsito y en reposo, autenticación segura y políticas de acceso por fila (RLS) para proteger la información personal."
        },
        {
          titulo: "8. Contacto y solicitudes",
          texto: "Para ejercer sus derechos o revocar la autorización, escríbanos a: contacto@comparatuplan.com o al WhatsApp +57 305 787 6992. Atenderemos su solicitud en un máximo de 10 días hábiles."
        },
      ].map((s) => (
        <div key={s.titulo} style={{ marginBottom: 32, background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: 12, padding: "20px 24px" }}>
          <h2 style={{ color: "#00d4ff", fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{s.titulo}</h2>
          <p style={{ color: "rgba(180,195,230,0.8)", fontSize: 14 }}>{s.texto}</p>
        </div>
      ))}

      <div style={{ textAlign: "center", marginTop: 40, color: "rgba(180,190,220,0.4)", fontSize: 12 }}>
        Última actualización: Abril 2026 · ComparaTuPlan.com
      </div>
    </div>
  );
}
