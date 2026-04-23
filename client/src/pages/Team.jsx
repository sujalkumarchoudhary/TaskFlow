import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ROLES = ['developer', 'lead', 'manager', 'super_manager'];

// Roles a manager can assign to others (cannot touch manager or super_manager)
const MANAGER_ASSIGNABLE_ROLES = ['developer', 'lead'];

const roleIcon  = { super_manager: '⭐', manager: '🔑', lead: '👨‍🏫', developer: '👨‍💻' };
const roleBadge = { super_manager: 'badge-danger', manager: 'badge-success', lead: 'badge-info', developer: 'badge-muted' };

const Team = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [deleteId, setDeleteId]     = useState(null);
  const [promoteTarget, setPromoteTarget] = useState(null); // { id, name, role }
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'developer' });
  const [formError, setFormError]   = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Redirect if not at least a manager
  useEffect(() => {
    if (user && user.role !== 'manager' && user.role !== 'super_manager') navigate('/', { replace: true });
  }, [user, navigate]);

  const isSuperManager = user?.role === 'super_manager';

  const fetchUsers = () => {
    api.get('/tasks/users')
      .then(res => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  // Create user
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (form.password.length < 6) { setFormError('Password must be at least 6 characters'); return; }
    setFormLoading(true);
    try {
      await api.post('/auth/create-user', form);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'developer' });
      fetchUsers();
      flash(`✅ User "${form.name}" created successfully!`);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  // Promote / change role
  const handlePromote = async (userId, newRole) => {
    try {
      await api.put(`/auth/promote/${userId}`, { role: newRole });
      fetchUsers();
      flash(`✅ Role updated to ${newRole}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
    setPromoteTarget(null);
  };

  // Delete user
  const handleDelete = async () => {
    try {
      await api.delete(`/auth/users/${deleteId}`);
      fetchUsers();
      flash('✅ User deleted');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
    setDeleteId(null);
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">👥 Team Management</h1>
          <p className="page-subtitle">Create accounts and manage roles for your team</p>
        </div>
        <button id="create-user-btn" className="btn btn-primary" onClick={() => { setShowModal(true); setFormError(''); }}>
          + Add Member
        </button>
      </div>

      {successMsg && (
        <div className="alert-banner" style={{ background: 'var(--success-bg)', borderColor: 'rgba(34,197,94,0.3)', color: 'var(--success)', marginBottom: 20 }}>
          {successMsg}
        </div>
      )}

      <div className="card">
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👤</div>
            <div className="empty-state-text">No team members yet</div>
            <div className="empty-state-sub">Click "+ Add Member" to create the first account</div>
          </div>
        ) : (
          <div className="tasks-table-wrap">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Change Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0
                        }}>
                          {u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        {u.name}
                        {u._id === user?.id && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>(you)</span>}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.email}</td>
                    <td>
                      <span className={`badge ${roleBadge[u.role]}`}>
                        {roleIcon[u.role]} {u.role}
                      </span>
                    </td>
                    <td>
                      {u._id !== user?.id ? (
                        <select
                          className="form-select"
                          style={{ padding: '5px 10px', fontSize: 13, width: 'auto' }}
                          value={u.role}
                          onChange={(e) => handlePromote(u._id, e.target.value)}
                        >
                          {/* super_manager can set any role; manager can only set developer/lead */}
                          {(isSuperManager ? ROLES : MANAGER_ASSIGNABLE_ROLES).map(r => (
                            <option key={r} value={r}>{roleIcon[r]} {r.replace('_', ' ')}</option>
                          ))}
                        </select>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      {/* Only Super Manager can delete accounts */}
                      {isSuperManager && u._id !== user?.id ? (
                        <button
                          id={`delete-user-${u._id}`}
                          className="btn btn-danger btn-sm"
                          onClick={() => setDeleteId(u._id)}
                        >
                          🗑️ Remove
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">➕ Add Team Member</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div style={{
              background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)',
              borderRadius: 10, padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)',
              marginBottom: 20, display: 'flex', gap: 10
            }}>
              🔑 You are setting the credentials this person will use to log in.
              Share the email and password with them securely.
            </div>

            {formError && <div className="auth-error" style={{ marginBottom: 16 }}>{formError}</div>}

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  id="new-user-name"
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email (Login ID)</label>
                <input
                  id="new-user-email"
                  type="email"
                  className="form-input"
                  placeholder="john@company.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    id="new-user-password"
                    type="text"
                    className="form-input"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  {isSuperManager ? (
                    // Super Manager can create any role
                    <select
                      id="new-user-role"
                      className="form-select"
                      value={form.role}
                      onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                    >
                      <option value="developer">👨‍💻 Developer</option>
                      <option value="lead">👨‍🏫 Team Lead</option>
                      <option value="manager">🔑 Manager</option>
                      <option value="super_manager">⭐ Super Manager</option>
                    </select>
                  ) : (
                    // Manager can only create developers
                    <div className="form-input" style={{ opacity: 0.6, cursor: 'not-allowed', userSelect: 'none' }}>
                      👨‍💻 Developer (fixed)
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button id="save-user-btn" type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Creating...' : '✅ Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <span className="modal-title">🗑️ Remove Member</span>
              <button className="modal-close" onClick={() => setDeleteId(null)}>×</button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              Are you sure you want to remove this team member? They will no longer be able to log in.
            </p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
              <button id="confirm-delete-user-btn" className="btn btn-danger" onClick={handleDelete}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
