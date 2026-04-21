export default function PlanPage({ params }: { params: { id_crc: string } }) {
  return (
    <div style={{ color: "#fff", padding: 100, background: "#04040f", minHeight: "100vh" }}>
      <h1>Plan ID: {params.id_crc}</h1>
    </div>
  );
}
