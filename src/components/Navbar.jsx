import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-danger';
      case 'trainer':
        return 'bg-warning text-dark';
      case 'trainee':
      default:
        return 'bg-info text-dark';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg bg-kodigo-navy navbar-dark shadow-sm py-3 px-4">
      <div className="container-fluid">
        <Link className="navbar-brand navbar-brand-kodigo d-flex align-items-center gap-2" to="/">
          <i className="bi bi-code-square text-kodigo-blue fs-4"></i>
          <span><strong className="text-white">KODIGO</strong> <span className="text-white-50 fs-6">LMS</span></span>
        </Link>

        {user && (
          <div className="d-flex align-items-center gap-3">
            <div className="d-none d-md-flex flex-column text-end">
              <span className="text-white fw-medium small">{user.name || user.email}</span>
              <span className="text-white-50" style={{ fontSize: '0.75rem' }}>
                <span className={`badge ${getRoleBadgeClass(user.role || (user.isAdmin ? 'admin' : 'trainee'))} text-uppercase`}>
                  {user.role || (user.isAdmin ? 'admin' : 'trainee')}
                </span>
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-outline-light btn-sm d-flex align-items-center gap-1"
              title="Logout"
            >
              <i className="bi bi-box-arrow-right"></i>
              <span className="d-none d-sm-inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
