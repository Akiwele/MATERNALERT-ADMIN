import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { AuthTextField } from '../components/auth/AuthTextField';
import { useApp } from '../context/AppContext';

export function AdminLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useApp();
  const [email, setEmail] = useState('admin@maternalert.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = login(email, password);
    if (success) {
      navigate('/admin/dashboard');
      return;
    }
    setError('Invalid email or password.');
  };

  return (
    <div className="auth-page">
      <div className="auth-page-content">
        <header className="auth-header">
          <img src="/maternalert-logo.png" alt="MaternAlert" className="auth-logo" />
          <p className="auth-eyebrow">MaternAlert Admin</p>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to access the clinic application review portal.
          </p>
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
            {error ? <p className="auth-form-error">{error}</p> : null}

            <button type="submit" className="auth-primary-button">
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
