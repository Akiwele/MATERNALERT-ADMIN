import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { MaternAlertBrand } from '../components/MaternAlertBrand';
import { useClinicAuth } from '../context/ClinicAuthContext';

export function ClinicResumeActivation() {
  const navigate = useNavigate();
  const {
    clinic,
    activationIncomplete,
    authLoading,
    completeResumedActivation,
    signOut,
  } = useClinicAuth();
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState('');

  if (authLoading) {
    return (
      <div className="auth-page">
        <div className="auth-page-content" role="status" aria-live="polite">
          <header className="auth-header">
            <MaternAlertBrand layout="stacked" size="lg" badge="Clinic" />
            <h1 className="auth-title">Checking Clinic Activation</h1>
            <p className="auth-subtitle">Please wait while we verify your clinic account.</p>
          </header>
        </div>
      </div>
    );
  }

  if (clinic) {
    return <Navigate to="/clinic" replace />;
  }

  if (!activationIncomplete) {
    return <Navigate to="/clinic-login" replace />;
  }

  const handleComplete = async () => {
    if (isCompleting) {
      return;
    }

    setIsCompleting(true);
    setError('');

    try {
      await completeResumedActivation();
      navigate('/clinic', { replace: true });
    } catch (completionError) {
      setError(
        completionError instanceof Error
          ? completionError.message
          : 'Unable to complete clinic activation. Please try again.',
      );
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page-content">
        <header className="auth-header">
          <MaternAlertBrand layout="stacked" size="lg" badge="Clinic" />
          <h1 className="auth-title">Complete Clinic Activation</h1>
          <p className="auth-subtitle">
            Your login for {activationIncomplete.officialEmail} works. Finish activating{' '}
            {activationIncomplete.clinicName} to open the clinic workspace.
          </p>
        </header>

        {error ? <p className="auth-form-error">{error}</p> : null}

        <div className="auth-actions">
          <button
            type="button"
            className="auth-primary-button"
            onClick={() => void handleComplete()}
            disabled={isCompleting}
          >
            {isCompleting ? 'Completing Activation...' : 'Complete Activation'}
          </button>
          <button
            type="button"
            className="auth-text-button"
            onClick={() => {
              void signOut().then(() => navigate('/clinic-login', { replace: true }));
            }}
            disabled={isCompleting}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
