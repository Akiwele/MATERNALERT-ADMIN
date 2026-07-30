import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { AuthTextField } from '../components/auth/AuthTextField';
import { useApp } from '../context/AppContext';

function AdminLoginBrandPanel() {
  return (
    <aside className="admin-login-brand-panel" aria-label="MaternAlert Admin">
      <div className="admin-login-brand-shape admin-login-brand-shape-one" aria-hidden="true" />
      <div className="admin-login-brand-shape admin-login-brand-shape-two" aria-hidden="true" />
      <div className="admin-login-brand-glow" aria-hidden="true" />

      <div className="admin-login-brand-content">
        <img
          src="/maternalert-logo.png"
          alt="MaternAlert"
          className="admin-login-brand-logo"
        />
        <div>
          <h2 className="admin-login-brand-title">Welcome to MaternAlert Admin</h2>
          <p className="admin-login-brand-copy">
            Manage clinic applications, approvals, and platform administration securely.
          </p>
        </div>
      </div>

    </aside>
  );
}

export function AdminLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, authLoading, authError, signIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading && !isSubmitting) {
    return (
      <div className="admin-login-page">
        <AdminLoginBrandPanel />
        <main className="admin-login-form-panel">
          <div
            className="admin-login-form-shell admin-login-loading-shell"
            role="status"
            aria-live="polite"
          >
            <h1 className="admin-login-form-title">Checking Admin Session</h1>
            <p className="admin-login-form-subtitle">
              Please wait while we verify your access.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await signIn(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/admin/dashboard');
      return;
    }

    setError(result.error ?? 'Unable to sign in. Please try again.');
  };

  return (
    <div className="admin-login-page">
      <AdminLoginBrandPanel />

      <main className="admin-login-form-panel">
        <div className="admin-login-form-shell">
          <header className="admin-login-form-header">
            <h1 className="admin-login-form-title">Login</h1>
          </header>

          <form onSubmit={handleSubmit} className="auth-form admin-login-form">
            <div className="auth-fields">
              <AuthTextField
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />

              <div className="auth-password-block">
                <AuthTextField
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  isPassword
                  autoComplete="current-password"
                  required
                />
                <button type="button" className="auth-forgot-link">
                  Forgot Password?
                </button>
              </div>
            </div>

            <div className="auth-actions">
              {error || authError ? (
                <p className="auth-form-error">{error || authError}</p>
              ) : null}

              <button
                type="submit"
                className="auth-primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Login'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
