import React from 'react';

const InsightCard = ({ insight }) => (
  <div className={`insight-card ${insight.type}`}>
    <div className="insight-card-header">
      <span className="insight-icon">{insight.icon}</span>
      <span className="insight-title">{insight.title}</span>
    </div>
    <p className="insight-message">{insight.message}</p>
  </div>
);

export default InsightCard;
