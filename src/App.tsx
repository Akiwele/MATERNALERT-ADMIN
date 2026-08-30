import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { AdminShell } from './components/layout/AdminShell';
import { ClinicProtectedRoute } from './components/ClinicProtectedRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppProvider } from './context/AppContext';
import { ClinicAuthProvider } from './context/ClinicAuthContext';
import { ToastProvider } from './context/ToastContext';
import { AdminLogin } from './pages/AdminLogin';
import { ApprovedClinics } from './pages/ApprovedClinics';
import { ClinicAccountActivation } from './pages/ClinicAccountActivation';
import { ClinicHome } from './pages/ClinicHome';
import { ClinicLogin } from './pages/ClinicLogin';
import { ClinicResumeActivation } from './pages/ClinicResumeActivation';
import { Dashboard } from './pages/Dashboard';
import { HospitalApplicationForm } from './pages/HospitalApplicationForm';
import { PendingApplications } from './pages/PendingApplications';
import { RejectedClinics } from './pages/RejectedClinics';
import { SystemLogs } from './pages/SystemLogs';

function AppContent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/apply" element={<HospitalApplicationForm />} />
        <Route path="/clinic/activate" element={<ClinicAccountActivation />} />

        <Route element={<ClinicProviders />}>
          <Route path="/clinic-login" element={<ClinicLogin />} />
          <Route path="/clinic/resume-activation" element={<ClinicResumeActivation />} />
          <Route element={<ClinicProtectedRoute />}>
            <Route path="/clinic" element={<ClinicHome />} />
          </Route>
        </Route>

        <Route element={<AdminProviders />}>
          <Route path="/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="pending" element={<PendingApplications />} />
              <Route path="approved" element={<ApprovedClinics />} />
              <Route path="rejected" element={<RejectedClinics />} />
              <Route path="logs" element={<SystemLogs />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function AdminProviders() {
  return (
    <AppProvider>
      <ToastProvider>
        <Outlet />
      </ToastProvider>
    </AppProvider>
  );
}

function ClinicProviders() {
  return (
    <ClinicAuthProvider>
      <Outlet />
    </ClinicAuthProvider>
  );
}

export default function App() {
  return <AppContent />;
}
