import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNo: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.mobileNo.length !== 11) {
      setError('Mobile number must be exactly 11 digits.');
      return;
    }

    if (formData.password.length < 7) {
      setError('Password must be at least 7 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.register(formData);
      if (res.result || res.message?.includes('successfully')) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center flex-grow-1 py-5 bg-kodigo-navy-dark">
      <div className="row w-100 justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card kodigo-card p-4 shadow-lg border-0">
            <div className="text-center mb-4">
              <h2 className="fw-bold text-kodigo-navy">Create Account</h2>
              <p className="text-muted small">Join Kodigo LMS as a trainee</p>
            </div>

            {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}
            {success && <div className="alert alert-success py-2 small" role="alert">{success}</div>}

            <form onSubmit={handleRegister}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold text-muted">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-control"
                    placeholder="Juan"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold text-muted">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-control"
                    placeholder="Dela Cruz"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Email address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="trainee@joysis.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Mobile Number (11 digits)</label>
                <input
                  type="text"
                  name="mobileNo"
                  className="form-control"
                  placeholder="09123456789"
                  maxLength={11}
                  value={formData.mobileNo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted">Password (min 7 chars)</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="•••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-kodigo-primary w-100 py-2 mb-3 fw-semibold shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Registering...
                  </>
                ) : (
                  'Register Trainee Account'
                )}
              </button>

              <div className="text-center">
                <p className="small text-muted">
                  Already have an account? <Link to="/login" className="text-kodigo-blue text-decoration-none fw-semibold">Sign in</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
