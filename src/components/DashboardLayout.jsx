import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [showProfile, setShowProfile] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#f8fafc' }}>
      {/* Sidebar on the Left */}
      <Sidebar />

      {/* Main Content Area on the Right */}
      <div className="flex-grow-1 d-flex flex-column overflow-auto">
        <header className="d-flex justify-content-end align-items-center gap-2 px-4 pt-3">
          <div className="position-relative">
            <button className="btn btn-outline-primary" onClick={() => setShowProfile((visible) => !visible)}>
              Profile
            </button>
            {showProfile && (
              <div className="position-absolute end-0 mt-2 p-3 bg-white border rounded shadow-sm" style={{ zIndex: 10, minWidth: '240px' }}>
                <div className="fw-semibold">{user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User'}</div>
                <div className="small text-muted">{user?.email}</div>
                <div className="small text-uppercase text-muted mt-1">{user?.role || (user?.isAdmin ? 'admin' : 'trainee')}</div>
              </div>
            )}
          </div>
          <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
