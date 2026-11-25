import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [showProfile, setShowProfile] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const userName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'CodeGo user';
  const dashboardPath = user?.isAdmin || user?.role === 'admin' ? '/admin' : '/dashboard';

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setShowProfile(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setShowProfile(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.logoutGoogleSession();
    } catch (err) {
      console.error('Could not end the Google session:', err);
    } finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar />

      <div className="flex-grow-1 d-flex flex-column overflow-auto">
        <header className="d-flex justify-content-end align-items-center px-4 pt-3">
          <div className="position-relative" ref={menuRef}>
            <button
              type="button"
              className="codego-avatar-button"
              aria-label="Open account menu"
              aria-haspopup="menu"
              aria-expanded={showProfile}
              onClick={() => setShowProfile((visible) => !visible)}
            >
              {user?.picture ? (
                <img src={user.picture} alt="" className="codego-avatar" referrerPolicy="no-referrer" />
              ) : (
                <span className="codego-avatar-fallback"><i className="bi bi-person-fill" /></span>
              )}
            </button>

            {showProfile && (
              <nav className="codego-account-menu" aria-label="Account navigation" role="menu">
                <div className="codego-account-identity">
                  {user?.picture ? (
                    <img src={user.picture} alt="" className="codego-avatar codego-avatar-large" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="codego-avatar-fallback codego-avatar-large"><i className="bi bi-person-fill" /></span>
                  )}
                  <div className="text-truncate">
                    <div className="fw-semibold text-truncate">{userName}</div>
                    <div className="small text-muted text-truncate">{user?.email}</div>
                  </div>
                </div>
                <div className="codego-menu-divider" />
                <button
                  type="button"
                  role="menuitem"
                  className="codego-menu-item"
                  onClick={() => { setShowProfile(false); navigate(dashboardPath); }}
                >
                  <i className="bi bi-journal-text" /> My dashboard
                </button>
                <div className="codego-menu-divider" />
                <button type="button" role="menuitem" className="codego-menu-item codego-menu-logout" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right" /> Sign out
                </button>
              </nav>
            )}
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
