import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center flex-grow-1 py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Determine role safely
  const effectiveRole = user.role || (user.isAdmin ? 'admin' : 'trainee');

  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    // If not allowed, redirect to their proper dashboard instead of / to avoid loop
    const target = effectiveRole === 'trainee' ? '/dashboard' : '/trainer';
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}
