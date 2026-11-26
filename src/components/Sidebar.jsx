import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user } = useAuth();
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
        <img className="codego-brand-logo me-2" src="/codego-logo.png" alt="" />
        <h4 className="codego-brand-name mb-0">CodeGo</h4>
      </div>

      {/* Navigation Section */}
      <div className="mb-3 px-2 text-uppercase text-secondary fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
        Navigation
      </div>
      <ul className="nav nav-pills flex-column mb-auto gap-1">
        {(user?.role === 'admin' || user?.isAdmin) && (
          <li className="nav-item">
            <Link to="/admin" className="nav-link text-white py-2">
              <i className="bi bi-people me-2"></i> Enrollment
            </Link>
          </li>
        )}
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

    </div>
  );
}
