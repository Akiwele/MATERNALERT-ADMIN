import { Navigate, Outlet } from 'react-router-dom';

import { useApp } from '../context/AppContext';
import { brand } from '../theme/brand';

export function ProtectedRoute() {
  const { isAuthenticated, authLoading } = useApp();

  if (authLoading) {
    return (
      <div
        role="status"
        style={{
          display: 'grid',
          minHeight: '100vh',
          placeItems: 'center',
          padding: '24px',
          color: brand.textSecondary,
          backgroundColor: brand.background,
        }}
      >
        Checking admin access...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
