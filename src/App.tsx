import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AdminShell } from './components/layout/AdminShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { AdminLogin } from './pages/AdminLogin';
import { ApprovedClinics } from './pages/ApprovedClinics';
import { ClinicAccountActivation } from './pages/ClinicAccountActivation';
import { ClinicLogin } from './pages/ClinicLogin';
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
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/apply" element={<HospitalApplicationForm />} />
        <Route path="/clinic/activate" element={<ClinicAccountActivation />} />
        <Route path="/clinic-login" element={<ClinicLogin />} />

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

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AppProvider>
  );
}
