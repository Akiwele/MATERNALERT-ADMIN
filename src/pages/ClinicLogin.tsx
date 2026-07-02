import { useMemo, useState, type FormEvent } from 'react';

import { AuthTextField } from '../components/auth/AuthTextField';
import {
  isClinicAccountActivatedDemo,
  loadClinicActivationDemo,
} from '../utils/clinic-activation-demo';

export function ClinicLogin() {
  const activationDemo = useMemo(() => loadClinicActivationDemo(), []);
  const [email, setEmail] = useState(activationDemo.email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMessage] = useState(() =>
    isClinicAccountActivatedDemo()
      ? 'Your clinic account has been activated successfully. You can now sign in.'
      : '',
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please enter your official email and password.');
      return;
    }

    setError('');
  };

  return (
    <div className="auth-page">
      <div className="auth-page-content">
        <header className="auth-header">
          <img src="/maternalert-logo.png" alt="MaternAlert" className="auth-logo" />
          <p className="auth-eyebrow">MaternAlert Clinic</p>
          <h1 className="auth-title">Clinic Login</h1>
          <p className="auth-subtitle">
            Sign in to access your verified clinic dashboard and patient records.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-fields">
            <AuthTextField
              label="Official Email"
              type="email"
              placeholder="clinic@example.com"
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
            {infoMessage ? <p className="clinic-login-info">{infoMessage}</p> : null}
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
