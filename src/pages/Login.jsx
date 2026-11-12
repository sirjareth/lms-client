import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.login({ email, password });
      if (res.access) {
        login(res.access);
        // Fetch profile to know role
        const profileRes = await api.getProfile();
        const userObj = profileRes.user || profileRes;

        if (userObj.role === 'trainer' || userObj.role === 'admin' || userObj.isAdmin) {
          navigate('/trainer');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.message || 'Invalid email or password.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center flex-grow-1 py-5 bg-kodigo-navy-dark">
      <div className="row w-100 justify-content-center">
        <div className="col-md-5 col-lg-4">
          <div className="card kodigo-card p-4 shadow-lg border-0">
            <div className="text-center mb-4">
              <div className="bg-kodigo-navy text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '64px', height: '64px' }}>
                <i className="bi bi-code-slash fs-2 text-kodigo-blue"></i>
              </div>
              <h2 className="fw-bold text-kodigo-navy">Kodigo LMS</h2>
              <p className="text-muted small">Sign in to your training portal</p>
            </div>

            {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Email address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><i className="bi bi-envelope text-muted"></i></span>
                  <input
                    type="email"
                    className="form-control border-start-0"
                    placeholder="trainee@joysis.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><i class="bi bi-lock text-muted"></i></span>
                  <input
                    type="password"
                    className="form-control border-start-0"
                    placeholder="•••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-kodigo-primary w-100 py-2 mb-3 fw-semibold shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="text-center">
                <p className="small text-muted">
                  Don't have an account? <Link to="/register" className="text-kodigo-blue text-decoration-none fw-semibold">Register here</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
