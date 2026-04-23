import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TaskModal = ({ task, users, onSave, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'developer';
  // Developers get a status-only modal when editing assigned tasks
  const statusOnly = role === 'developer' && !!task;

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    deadline: '',
    assignedTo: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
      });
    }
  }, [task]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!statusOnly && !form.title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    try {
      // If developer (status-only), only send the status field
      const payload = statusOnly
        ? { status: form.status }
        : { ...form, assignedTo: form.assignedTo || null, deadline: form.deadline || null };
      await onSave(payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">
            {statusOnly ? '🔄 Update Status' : task ? '✏️ Edit Task' : '➕ New Task'}
          </span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {statusOnly && (
          <div className="alert-banner warning" style={{ marginBottom: 16 }}>
            👨‍💻 <span>As a <strong>Developer</strong>, you can only update the task status.</span>
          </div>
        )}

        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Full form — hidden for developers in status-only mode */}
          {!statusOnly && (
            <>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  id="task-title-input"
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="Enter task title..."
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  id="task-desc-input"
                  name="description"
                  className="form-textarea"
                  placeholder="Describe the task..."
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select id="task-priority" name="priority" className="form-select" value={form.priority} onChange={handleChange}>
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select id="task-status" name="status" className="form-select" value={form.status} onChange={handleChange}>
                    <option value="pending">⏳ Pending</option>
                    <option value="in-progress">🔄 In Progress</option>
                    <option value="done">✅ Done</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select id="task-assignee" name="assignedTo" className="form-select" value={form.assignedTo} onChange={handleChange}>
                  <option value="">— Unassigned —</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input
                  id="task-deadline"
                  type="date"
                  name="deadline"
                  className="form-input"
                  value={form.deadline}
                  onChange={handleChange}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </>
          )}

          {/* Status-only form for developers */}
          {statusOnly && (
            <div className="form-group">
              <label className="form-label">Task: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{form.title}</span></label>
              <label className="form-label" style={{ marginTop: 16 }}>New Status</label>
              <select id="task-status" name="status" className="form-select" value={form.status} onChange={handleChange}>
                <option value="pending">⏳ Pending</option>
                <option value="in-progress">🔄 In Progress</option>
                <option value="done">✅ Done</option>
              </select>
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="save-task-btn" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : statusOnly ? 'Update Status' : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
