import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthTextField } from '../components/auth/AuthTextField';
import {
  activateClinicAccount,
  ClinicInvitationError,
  initializeClinicInvitation,
  type ClinicActivationContext,
  validateClinicPassword,
} from '../lib/clinicAuth';
import { supabase } from '../lib/supabase';

function getActivationErrorMessage(error: unknown): string {
  if (error instanceof ClinicInvitationError || error instanceof Error) {
    return error.message;
  }

  return 'Unable to activate the clinic account. Please try again.';
}

export function ClinicAccountActivation() {
  const navigate = useNavigate();
  const initializationPromise = useRef<Promise<ClinicActivationContext> | null>(null);
  const [clinic, setClinic] = useState<ClinicActivationContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [loadErrorAllowsClinicLogin, setLoadErrorAllowsClinicLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    if (!initializationPromise.current) {
      initializationPromise.current = initializeClinicInvitation();
    }

    const invitationInitialization = initializationPromise.current;
    let active = true;

    const initialize = async () => {
      try {
        const context = await invitationInitialization;
        if (!active) {
          return;
        }

        if (context.isActive || context.activationCompletedAt) {
          setLoadErrorAllowsClinicLogin(true);
          setLoadError(
            'This clinic account has already been activated. You can sign in from the Clinic Login page.',
          );
          return;
        }

        setClinic(context);
      } catch (error) {
        if (active) {
          setLoadError(getActivationErrorMessage(error));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void initialize();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextPasswordError = validateClinicPassword(password);
    const nextConfirmPasswordError = !confirmPassword
      ? 'Please confirm your password.'
      : password !== confirmPassword
        ? 'Passwords do not match.'
        : '';

    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmPasswordError);
    setSubmitError('');

    if (nextPasswordError || nextConfirmPasswordError || !clinic) {
      return;
    }

    setIsSubmitting(true);
    try {
      await activateClinicAccount(password);
      await supabase.auth.signOut();
      setPassword('');
      setConfirmPassword('');
      setIsActivated(true);
    } catch (error) {
      console.error('Clinic activation failed:', error);
      setSubmitError(getActivationErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="auth-page-content">
          <header className="auth-header">
            <img src="/maternalert-logo.png" alt="MaternAlert" className="auth-logo" />
            <p className="auth-eyebrow">MaternAlert Clinic</p>
            <h1 className="auth-title">Checking Your Invitation</h1>
            <p className="auth-subtitle">
              Please wait while we securely verify your clinic account.
            </p>
          </header>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="auth-page">
        <div className="auth-page-content">
          <header className="auth-header">
            <img src="/maternalert-logo.png" alt="MaternAlert" className="auth-logo" />
            <p className="auth-eyebrow">MaternAlert Clinic</p>
            <h1 className="auth-title">Unable to Open Invitation</h1>
            <p className="auth-form-error clinic-activation-page-error">{loadError}</p>
            {loadErrorAllowsClinicLogin ? (
              <button
                type="button"
                className="auth-primary-button"
                onClick={() => navigate('/clinic-login')}
              >
                Go to Clinic Login
              </button>
            ) : null}
          </header>
        </div>
      </div>
    );
  }

  if (isActivated) {
    return (
      <div className="auth-page">
        <div className="auth-page-content clinic-activation-success-page">
          <header className="auth-header">
            <img src="/maternalert-logo.png" alt="MaternAlert" className="auth-logo" />
            <p className="auth-eyebrow">MaternAlert Clinic</p>
          </header>

          <div className="clinic-activation-success-title-row">
            <h1 className="auth-title clinic-activation-success-title">
              Password Created Successfully
            </h1>
            <CheckCircle2
              className="clinic-activation-success-icon"
              size={28}
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>

          <div className="clinic-activation-success-message">
            <p>Your clinic account has been activated successfully and is ready to use.</p>
            <p>You can now sign in using your official clinic email and new password.</p>
          </div>

          <button
            type="button"
            className="auth-primary-button"
            onClick={() =>
              navigate('/clinic-login', {
                state: {
                  activationMessage:
                    'Your clinic account has been activated successfully. You can now sign in.',
                },
              })
            }
          >
            Go to Clinic Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-page-content">
        <header className="auth-header">
          <img src="/maternalert-logo.png" alt="MaternAlert" className="auth-logo" />
          <p className="auth-eyebrow">MaternAlert Clinic</p>
          <h1 className="auth-title">Activate Your Clinic Account</h1>
          <p className="auth-subtitle">
            Your clinic application has been approved. Create your password to activate your
            account.
          </p>
          <p className="clinic-activation-security-note">
            For security reasons, only approved clinics can activate their accounts.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-fields">
            <label className="auth-field">
              <span className="auth-field-label">Clinic Email</span>
              <input
                type="email"
                className="auth-input clinic-readonly-input"
                value={clinic?.officialEmail ?? ''}
                readOnly
                aria-readonly="true"
              />
            </label>

            <p className="clinic-activation-facility">{clinic?.clinicName}</p>

            <AuthTextField
              label="Create Password"
              placeholder="Enter a secure password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError('');
                setSubmitError('');
              }}
              isPassword
              autoComplete="new-password"
              error={passwordError}
              required
            />

            <AuthTextField
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setConfirmPasswordError('');
                setSubmitError('');
              }}
              isPassword
              autoComplete="new-password"
              error={confirmPasswordError}
              required
            />
          </div>

          <div className="auth-actions">
            {submitError ? <p className="auth-form-error">{submitError}</p> : null}
            <button type="submit" className="auth-primary-button" disabled={isSubmitting}>
              {isSubmitting ? 'Activating...' : 'Activate Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
