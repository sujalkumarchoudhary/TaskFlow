import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import TaskModal from '../components/TaskModal';
import { useAuth } from '../context/AuthContext';

const priorityBadge = (p) => {
  const map = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-success' };
  return map[p] || 'badge-muted';
};

const statusBadge = (s) => {
  const map = { done: 'badge-success', 'in-progress': 'badge-info', pending: 'badge-warning' };
  return map[s] || 'badge-muted';
};

const FILTERS = ['all', 'pending', 'in-progress', 'done'];

const Tasks = () => {
  const { user } = useAuth();
  const role = user?.role || 'developer';
  const canCreate  = ['lead', 'manager', 'super_manager'].includes(role);
  const canDelete  = ['manager', 'super_manager'].includes(role);
  const canEditAll = ['lead', 'manager', 'super_manager'].includes(role);

  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([api.get('/tasks'), api.get('/tasks/users')])
      .then(([tRes, uRes]) => {
        setTasks(tRes.data);
        setUsers(uRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (data) => {
    if (editTask) {
      const res = await api.put(`/tasks/${editTask._id}`, data);
      setTasks(prev => prev.map(t => t._id === editTask._id ? res.data : t));
    } else {
      const res = await api.post('/tasks', data);
      setTasks(prev => [res.data, ...prev]);
    }
    setModalOpen(false);
    setEditTask(null);
  };

  const handleDelete = async () => {
    await api.delete(`/tasks/${deleteId}`);
    setTasks(prev => prev.filter(t => t._id !== deleteId));
    setDeleteId(null);
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const now = new Date();

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Manage and track all project tasks</p>
        </div>
        <span className={`badge ${
          role === 'super_manager' ? 'badge-danger' :
          role === 'manager'      ? 'badge-success' :
          role === 'lead'         ? 'badge-info' : 'badge-muted'
        }`} style={{ marginTop: 6, fontSize: 13 }}>
          {role === 'super_manager' ? '⭐ Super Manager' :
           role === 'manager'       ? '🔑 Manager' :
           role === 'lead'          ? '👨‍🏫 Team Lead' : '👨‍💻 Developer'}
        </span>
      </div>

      {role === 'developer' && (
        <div className="alert-banner warning" style={{ marginBottom: 20 }}>
          ℹ️ <span>As a <strong>Developer</strong>, you can only update the status of tasks assigned to you. Contact a Lead, Manager, or Super Manager to create or fully edit tasks.</span>
        </div>
      )}

      <div className="toolbar">
        <div className="filter-group">
          {FILTERS.map(f => (
            <button
              key={f}
              id={`filter-${f}`}
              className={`filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{ marginLeft: 6, opacity: 0.7, fontSize: 12 }}>
                ({f === 'all' ? tasks.length : tasks.filter(t => t.status === f).length})
              </span>
            </button>
          ))}
        </div>
        {canCreate && (
          <button
            id="create-task-btn"
            className="btn btn-primary"
            onClick={() => { setEditTask(null); setModalOpen(true); }}
          >
            + New Task
          </button>
        )}
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">No {filter !== 'all' ? filter : ''} tasks found</div>
            <div className="empty-state-sub">Create a new task to get started</div>
          </div>
        ) : (
          <div className="tasks-table-wrap">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Deadline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(task => {
                  const isOverdue = task.deadline && new Date(task.deadline) < now && task.status !== 'done';
                  return (
                    <tr key={task._id}>
                      <td className="task-title-cell">{task.title}</td>
                      <td className="task-desc-cell">{task.description || '—'}</td>
                      <td>
                        <span className={`badge ${priorityBadge(task.priority)}`}>{task.priority}</span>
                      </td>
                      <td>
                        <span className={`badge ${statusBadge(task.status)}`}>{task.status}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                        {task.assignedTo?.name || '—'}
                      </td>
                      <td style={{ fontSize: 13, color: isOverdue ? 'var(--danger)' : 'var(--text-secondary)', fontWeight: isOverdue ? 600 : 400 }}>
                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}
                        {isOverdue && ' ⚠️'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {/* Lead/Manager: full edit; Developer: status-only on assigned tasks */}
                          {(canEditAll || task.assignedTo?._id === user?.id) && (
                            <button
                              id={`edit-task-${task._id}`}
                              className="btn btn-ghost btn-sm"
                              onClick={() => { setEditTask(task); setModalOpen(true); }}
                              title={!canEditAll ? 'Update status only' : 'Edit task'}
                            >
                              {canEditAll ? '✏️ Edit' : '🔄 Status'}
                            </button>
                          )}
                          {canDelete && (
                            <button
                              id={`delete-task-${task._id}`}
                              className="btn btn-danger btn-sm"
                              onClick={() => setDeleteId(task._id)}
                            >
                              🗑️
                            </button>
                          )}
                          {!canEditAll && task.assignedTo?._id !== user?.id && (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', padding: '6px 0' }}>No access</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <TaskModal
          task={editTask}
          users={users}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditTask(null); }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <span className="modal-title">🗑️ Delete Task</span>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button id="confirm-delete-btn" className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
