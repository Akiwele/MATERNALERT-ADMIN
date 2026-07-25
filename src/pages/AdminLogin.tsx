import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { AuthTextField } from '../components/auth/AuthTextField';
import { useApp } from '../context/AppContext';

export function AdminLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, authLoading, authError, signIn } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading && !isSubmitting) {
    return (
      <div className="auth-page">
        <div className="auth-page-content">
          <header className="auth-header">
            <img src="/maternalert-logo.png" alt="MaternAlert" className="auth-logo" />
            <p className="auth-eyebrow">MaternAlert Admin</p>
            <h1 className="auth-title">Checking Admin Session</h1>
            <p className="auth-subtitle">Please wait while we verify your access.</p>
          </header>
        </div>
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
    <div className="auth-page">
      <div className="auth-page-content">
        <header className="auth-header">
          <img src="/maternalert-logo.png" alt="MaternAlert" className="auth-logo" />
          <p className="auth-eyebrow">MaternAlert Admin</p>
          <h1 className="auth-title">Welcome Back</h1>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
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
    </div>
  );
}
