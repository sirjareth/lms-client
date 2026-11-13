import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ batch }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className="d-flex flex-column p-3 text-white"
      style={{
        width: '280px',
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        borderRight: '1px solid #1e293b'
      }}
    >
      {/* Brand / Logo */}
      <div className="d-flex align-items-center mb-4 px-2 pt-2">
        <h4 className="fw-bold mb-0 text-white" style={{ letterSpacing: '0.5px' }}>Kodigo</h4>
      </div>

      {/* Batch Header info (Dynamic) */}
      <div className="mb-4 px-2 pb-3 border-bottom border-secondary">
        <h3 className="fw-bold fs-4 mb-1 text-white">{batch?.name || 'Classroom'}</h3>
        <p className="text-uppercase small mb-2" style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.5px' }}>
          {batch?.programTitle || 'Java Backend Development'}
        </p>
        <p className="small mb-1 text-white-50" style={{ fontSize: '0.85rem' }}>
          {batch?.mode || 'Online Class'}
        </p>
        <p className="small mb-0 text-white-50" style={{ fontSize: '0.85rem' }}>
          Instructors <br />
          <strong className="text-white">Jareth Ronquillo</strong>
        </p>
      </div>

      {/* Navigation Section */}
      <div className="mb-3 px-2 text-uppercase text-secondary fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
        Navigation
      </div>
      <ul className="nav nav-pills flex-column mb-auto gap-1">
        <li className="nav-item">
          <Link to={user?.role === 'trainer' || user?.isAdmin ? '/trainer' : '/dashboard'} className="nav-link text-white active bg-kodigo-blue py-2">
            <i className="bi bi-journal-text me-2"></i> Sessions
          </Link>
        </li>
        <li>
          <a href="#notes" className="nav-link text-white-50 py-2" onClick={(e) => e.preventDefault()}>
            <i className="bi bi-journal me-2"></i> Notes
          </a>
        </li>
        <li>
          <a href="#recordings" className="nav-link text-white-50 py-2" onClick={(e) => e.preventDefault()}>
            <i className="bi bi-camera-video me-2"></i> Recordings
          </a>
        </li>
        <li>
          <a href="#requirements" className="nav-link text-white-50 py-2" onClick={(e) => e.preventDefault()}>
            <i className="bi bi-check2-square me-2"></i> Requirements
          </a>
        </li>
      </ul>

      {/* User Footer */}
      <div className="mt-auto pt-3 border-top border-secondary d-flex justify-content-between align-items-center px-2">
        <div className="small text-truncate" style={{ maxWidth: '170px' }}>
          <div className="fw-bold text-white">{user?.name || user?.firstName || 'User'}</div>
          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.email || ''}</div>
        </div>
        <button className="btn btn-sm btn-outline-light" onClick={handleLogout} title="Logout">
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}
