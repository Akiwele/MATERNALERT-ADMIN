import { LoaderCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { AuthTextField } from '../components/auth/AuthTextField';
import { MaternAlertBrand } from '../components/MaternAlertBrand';
import { useClinicAuth } from '../context/ClinicAuthContext';

type ClinicLoginLocationState = {
  activationMessage?: string;
};

export function ClinicLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clinic, activationIncomplete, authLoading, signIn } = useClinicAuth();
  const activationMessage = (location.state as ClinicLoginLocationState | null)
    ?.activationMessage;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState(activationMessage ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="auth-page-content" role="status" aria-live="polite">
          <header className="auth-header">
            <MaternAlertBrand layout="stacked" size="lg" badge="Clinic" />
            <h1 className="auth-title">Checking Clinic Session</h1>
            <p className="auth-subtitle">Please wait while we verify your access.</p>
          </header>
        </div>
      </div>
    );
  }

  if (clinic) {
    return <Navigate to="/clinic" replace />;
  }

  if (activationIncomplete) {
    return <Navigate to="/clinic/resume-activation" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!email.trim() || !password) {
      setError('Please enter your official email and password.');
      return;
    }

    setError('');
    setInfoMessage('');
    setIsSubmitting(true);

    try {
      const result = await signIn(email, password);
      setPassword('');
      navigate(result.status === 'activation_incomplete' ? '/clinic/resume-activation' : '/clinic', {
        replace: true,
        state: result.status === 'active' ? { clinic: result.clinic } : undefined,
      });
    } catch (signInError) {
      setError(
        signInError instanceof Error
          ? signInError.message
          : 'Unable to sign in. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page-content">
        <header className="auth-header">
          <MaternAlertBrand layout="stacked" size="lg" badge="Clinic" />
          <h1 className="auth-title">Clinic Login</h1>
          <p className="auth-subtitle">
            Sign in to access your verified clinic account.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-fields">
            <AuthTextField
              label="Official Clinic Email"
              type="email"
              placeholder="clinic@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError('');
              }}
              autoComplete="email"
              disabled={isSubmitting}
              required
            />

            <AuthTextField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              isPassword
              autoComplete="current-password"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="auth-actions">
            {infoMessage ? <p className="clinic-login-info">{infoMessage}</p> : null}
            {error ? <p className="auth-form-error">{error}</p> : null}

            <button type="submit" className="auth-primary-button" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="auth-button-content">
                  <LoaderCircle
                    className="auth-button-spinner"
                    size={18}
                    aria-hidden="true"
                  />
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
