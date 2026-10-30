export default function MetricCard({ title, value, subtitle }) {
  return (
    <article className="metric-card">
      <p className="metric-title">{title}</p>
      <h2>{value}</h2>
      <p className="metric-subtitle">{subtitle}</p>
    </article>
  );
}
