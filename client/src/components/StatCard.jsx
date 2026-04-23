import React from 'react';

const StatCard = ({ label, value, icon, desc, variant = '' }) => (
  <div className={`stat-card ${variant}`}>
    <div className="stat-card-header">
      <span className="stat-card-label">{label}</span>
      <span className="stat-card-icon">{icon}</span>
    </div>
    <div className="stat-card-value">{value}</div>
    {desc && <div className="stat-card-desc">{desc}</div>}
  </div>
);

export default StatCard;
