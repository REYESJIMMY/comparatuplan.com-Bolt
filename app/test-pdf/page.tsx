"use client";
import { useState } from "react";

export default function TestPdf() {
  const [resultado, setResultado] = useState<any>(null);
  const [cargando, setCargando] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCargando(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/extract-pdf", { method: "POST", body: form });
    const data = await res.json();
    setResultado(data);
    setCargando(false);
  };

  return (
    <div style={{ padding: 40, color: "#fff" }}>
      <h1>Prueba extract-pdf</h1>
      <input type="file" accept="application/pdf" onChange={handleUpload} />
      {cargando && <p>Procesando...</p>}
      {resultado && <pre>{JSON.stringify(resultado, null, 2)}</pre>}
    </div>
  );
}
