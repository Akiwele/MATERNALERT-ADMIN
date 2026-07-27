import { Navigate, Outlet } from 'react-router-dom';

import { useClinicAuth } from '../context/ClinicAuthContext';
import { brand } from '../theme/brand';

export function ClinicProtectedRoute() {
  const { clinic, authLoading } = useClinicAuth();

  if (authLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'grid',
          minHeight: '100vh',
          placeItems: 'center',
          padding: '24px',
          color: brand.textSecondary,
          backgroundColor: brand.background,
        }}
      >
        Checking clinic access...
      </div>
    );
  }

  if (!clinic) {
    return <Navigate to="/clinic-login" replace />;
  }

  return <Outlet />;
}
