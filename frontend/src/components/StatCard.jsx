/**
 * StatCard Component
 * 
 * A simple card that displays a metric (e.g., "Total Payments: 42")
 * Used on all dashboard pages.
 */
const StatCard = ({ title, value, icon = '📊', color = '#4f46e5' }) => {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
      </div>
    </div>
  );
};

export default StatCard;
