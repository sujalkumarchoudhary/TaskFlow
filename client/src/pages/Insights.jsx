import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import InsightCard from '../components/InsightCard';
import StatCard from '../components/StatCard';

const Insights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInsights = () => {
    setLoading(true);
    api.get('/insights')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load insights'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchInsights(); }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (error) return <div className="auth-error">{error}</div>;

  const { summary, workload, insights } = data;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">🧠 Smart Insights</h1>
          <p className="page-subtitle">AI-powered analysis of your project health</p>
        </div>
        <button className="btn btn-ghost" onClick={fetchInsights} id="refresh-insights-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <StatCard label="Total Tasks" value={summary.total} icon="📋" />
        <StatCard label="Completed" value={summary.completed} icon="✅" variant="success" />
        <StatCard label="Overdue" value={summary.overdue} icon="⏰" variant={summary.overdue > 0 ? 'danger' : ''} />
        <StatCard label="High Priority" value={summary.highPriorityPending} icon="🔥" variant={summary.highPriorityPending > 0 ? 'warning' : ''} />
      </div>

      {/* Workload distribution */}
      {Object.keys(workload).length > 0 && (
        <div className="card" style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>⚖️ Workload Distribution</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(workload)
              .sort((a, b) => b[1] - a[1])
              .map(([name, count]) => {
                const max = Math.max(...Object.values(workload));
                const pct = Math.round((count / max) * 100);
                return (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{name}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{count} task{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #6c63ff, #a78bfa)' }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Insight cards */}
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>💡 Recommendations</h2>
      {insights.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🤔</div>
          <div className="empty-state-text">No insights available</div>
          <div className="empty-state-sub">Add more tasks to generate insights</div>
        </div>
      ) : (
        <div className="insights-grid">
          {insights.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Insights;
