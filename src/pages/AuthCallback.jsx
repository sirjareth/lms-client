import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    api.completeGoogleLogin()
      .then((res) => {
        if (!res.access || !res.user) {
          throw new Error(res.message || 'Could not finish Google sign-in.');
        }

        if (!active) return;
        login(res.access, res.user);
        navigate(res.user.isAdmin ? '/admin' : '/dashboard', { replace: true });
      })
      .catch((err) => {
        console.error('Google sign-in callback failed:', err);
        if (active) setError('Google sign-in could not be completed. Please try again.');
      });

    return () => {
      active = false;
    };
  }, [login, navigate]);

  return (
    <main className="d-flex min-vh-100 justify-content-center align-items-center bg-white">
      <div className="text-center p-4">
        {error ? (
          <>
            <p className="text-danger mb-3">{error}</p>
            <button className="btn btn-outline-primary" onClick={() => navigate('/login', { replace: true })}>
              Back to login
            </button>
          </>
        ) : (
          <>
            <div className="spinner-border text-primary mb-3" role="status" />
            <p className="text-muted mb-0">Signing you in to CodeGo LMS...</p>
          </>
        )}
      </div>
    </main>
  );
}
