export default function StatCard({ title, value, subtitle, color = "primary" }) {
  return (
    <div className={`card shadow-sm border-0 bg-${color} text-white h-100`}>
      <div className="card-body">
        <div className="text-uppercase small opacity-75">{title}</div>
        <div className="display-6 fw-bold">{value}</div>
        {subtitle && <div className="small opacity-75">{subtitle}</div>}
      </div>
    </div>
  );
}