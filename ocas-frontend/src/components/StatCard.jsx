export default function StatCard({ title, value, subtitle, right }) {
  return (
    <div className="surface-card h-100">
      <div className="p-3 p-xl-4 h-100 d-flex justify-content-between align-items-start gap-3">
        <div>
          <div className="metric-label mb-2">{title}</div>
          <div className="metric-value mb-1">{value}</div>
          {subtitle && <div className="section-subtitle">{subtitle}</div>}
        </div>
        {right ? right : null}
      </div>
    </div>
  );
}
