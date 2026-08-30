import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { MaternAlertBrand } from '../components/MaternAlertBrand';
import { useClinicAuth } from '../context/ClinicAuthContext';

export function ClinicHome() {
  const navigate = useNavigate();
  const { clinic, signOut } = useClinicAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      navigate('/clinic-login', { replace: true });
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-page-content clinic-activation-success-page">
        <header className="auth-header">
          <MaternAlertBrand layout="stacked" size="lg" badge="Clinic" />
          <h1 className="auth-title">{clinic?.clinicName}</h1>
          <p className="auth-subtitle">
            You are securely signed in to your active clinic account.
          </p>
        </header>

        <button
          type="button"
          className="auth-primary-button"
          onClick={() => void handleSignOut()}
          disabled={isSigningOut}
        >
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </main>
    </div>
  );
}
