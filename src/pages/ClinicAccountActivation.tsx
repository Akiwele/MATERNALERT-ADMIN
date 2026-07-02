import { CheckCircle2 } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

import { AuthTextField } from '../components/auth/AuthTextField';
import {
  loadClinicActivationDemo,
  markClinicAccountActivated,
} from '../utils/clinic-activation-demo';

export function ClinicAccountActivation() {
  const activationDemo = useMemo(() => loadClinicActivationDemo(), []);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isActivated, setIsActivated] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();
    let hasError = false;

    if (!trimmedPassword) {
      setPasswordError('Please enter a password.');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (!trimmedConfirm) {
      setConfirmPasswordError('Please confirm your password.');
      hasError = true;
    } else if (trimmedPassword !== trimmedConfirm) {
      setConfirmPasswordError('Passwords do not match.');
      hasError = true;
    } else {
      setConfirmPasswordError('');
    }

    if (hasError) {
      return;
    }

    markClinicAccountActivated();
    setIsActivated(true);
  };

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
            <p>Your clinic account password has been created successfully.</p>
            <p>
              You can now sign in to the MaternAlert Clinic App using your official email address
              and the password you just created.
            </p>
            <p>
              If you experience any issues accessing your account, please contact the MaternAlert
              administrator.
            </p>
          </div>
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
                value={activationDemo.email}
                readOnly
                aria-readonly="true"
              />
            </label>

            <p className="clinic-activation-facility">{activationDemo.facilityName}</p>

            <AuthTextField
              label="Create Password"
              placeholder="Enter a secure password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              isPassword
              autoComplete="new-password"
              error={passwordError}
              required
            />

            <AuthTextField
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              isPassword
              autoComplete="new-password"
              error={confirmPasswordError}
              required
            />
          </div>

          <div className="auth-actions">
            <button type="submit" className="auth-primary-button">
              Activate Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
