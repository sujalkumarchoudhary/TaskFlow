import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isManager = user?.role === 'manager' || user?.role === 'super_manager';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">📋</div>
        <div>
          <div className="sidebar-logo-text">TaskFlow</div>
          <div className="sidebar-logo-sub">Project Hub</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="nav-icon">🏠</span> Dashboard
        </NavLink>
        <NavLink to="/tasks" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="nav-icon">✅</span> Tasks
        </NavLink>
        <NavLink to="/insights" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="nav-icon">🧠</span> Smart Insights
        </NavLink>

        {/* Team management — Managers only */}
        {isManager && (
          <NavLink to="/team" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">👥</span> Team
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-role">{user?.role || 'developer'}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout} id="logout-btn">
          🚪 Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
