export default async function PlanPage({ params }: { params: Promise<{ id_crc: string }> }) {
  const { id_crc } = await params;
  return (
    <div style={{ color: "#fff", padding: 100, background: "#04040f", minHeight: "100vh" }}>
      <h1>Plan ID: {id_crc}</h1>
    </div>
  );
}
