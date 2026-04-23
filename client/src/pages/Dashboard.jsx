import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import StatCard from '../components/StatCard';

const priorityBadge = (p) => {
  const map = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-success' };
  return map[p] || 'badge-muted';
};

const statusBadge = (s) => {
  const map = { done: 'badge-success', 'in-progress': 'badge-info', pending: 'badge-warning' };
  return map[s] || 'badge-muted';
};

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks')
      .then(res => setTasks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < now && t.status !== 'done');
  const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'done');
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const recentTasks = [...tasks].slice(0, 5);

  if (loading) {
    return <div className="loading"><div className="spinner" /></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Project overview and key metrics</p>
      </div>

      {/* Alerts */}
      {overdue.length > 0 && (
        <div className="alert-banner danger">
          ⏰ <strong>{overdue.length} overdue task{overdue.length > 1 ? 's' : ''}!</strong>
          &nbsp;— {overdue.map(t => t.title).join(', ')}
        </div>
      )}
      {highPriority.length > 0 && (
        <div className="alert-banner warning">
          🔥 <strong>{highPriority.length} high-priority task{highPriority.length > 1 ? 's' : ''}</strong> still pending.
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <StatCard label="Total Tasks" value={total} icon="📋" desc="All tasks in the system" variant="accent" />
        <StatCard label="Completed" value={completed} icon="✅" desc="Finished tasks" variant="success" />
        <StatCard label="In Progress" value={inProgress} icon="🔄" desc="Actively worked on" variant="" />
        <StatCard label="Pending" value={pending} icon="⏳" desc="Not started yet" variant="warning" />
        <StatCard label="Overdue" value={overdue.length} icon="⚠️" desc="Past deadline" variant={overdue.length > 0 ? 'danger' : ''} />
      </div>

      {/* Completion rate */}
      {total > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>Completion Rate</span>
            <span style={{ color: 'var(--accent-light)', fontWeight: 700, fontSize: 18 }}>{completionRate}%</span>
          </div>
          <div className="progress-bar-wrap">
            <div className="progress-bar" style={{ width: `${completionRate}%` }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            {completed} of {total} tasks completed
          </div>
        </div>
      )}

      {/* Recent tasks */}
      <div className="card">
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18 }}>Recent Tasks</h2>
        {recentTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">No tasks yet</div>
            <div className="empty-state-sub">Go to Tasks to create your first one</div>
          </div>
        ) : (
          <div className="tasks-table-wrap">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map(task => (
                  <tr key={task._id}>
                    <td className="task-title-cell">{task.title}</td>
                    <td>
                      <span className={`badge ${priorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${statusBadge(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {task.assignedTo?.name || '—'}
                    </td>
                    <td style={{ color: task.deadline && new Date(task.deadline) < now && task.status !== 'done' ? 'var(--danger)' : 'var(--text-secondary)', fontSize: 13 }}>
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
