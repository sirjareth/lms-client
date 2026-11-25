import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.assign(api.googleLoginUrl);
  };

  return (
    <main className="codego-login-page">
      <section className="codego-login-content" aria-labelledby="login-title">
        <h1 id="login-title" className="codego-login-title">CodeGo</h1>
        <p className="visually-hidden">Sign in to CodeGo LMS with your Google account.</p>
        {searchParams.get('error') === 'google' && (
          <p className="text-danger small mb-2" role="alert">Google sign-in was cancelled or could not be completed. Please try again.</p>
        )}
        <button
          type="button"
          className="codego-google-button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          ) : (
            <>
              <i className="bi bi-google" aria-hidden="true" />
              <span className="codego-google-divider" aria-hidden="true" />
              <span>Login with Google</span>
            </>
          )}
        </button>
      </section>
    </main>
  );
}
