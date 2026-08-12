"use client";
import { useState } from "react";

export default function TestPdf() {
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCargando(true);
    setError(null);
    setResultado(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/ofertas/extract-pdf", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(`Error ${res.status}: ${data.error ?? "desconocido"}`);
      } else {
        setResultado(data);
      }
    } catch (err: any) {
      setError(`Error de red/timeout: ${err.message}`);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: 40, color: "#fff" }}>
      <h1>Prueba extract-pdf</h1>
      <input type="file" accept="application/pdf" onChange={handleUpload} />
      {cargando && <p>Procesando...</p>}
      {error && <p style={{ color: "#f87171" }}>{error}</p>}
      {resultado && <pre>{JSON.stringify(resultado, null, 2)}</pre>}
    </div>
  );
}
