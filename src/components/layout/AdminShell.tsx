import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { brand } from '../../theme/brand';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

const pageMeta: Record<string, { title: string; subtitle?: string }> = {
  '/admin/dashboard': {
    title: 'Dashboard',
  },
  '/admin/pending': {
    title: 'Pending Clinic Applications',
    
  },
  '/admin/approved': {
    title: 'Approved Clinics',
    
  },
  '/admin/rejected': {
    title: 'Rejected Clinics',
    
  },
  '/admin/logs': {
    title: 'System Logs',
    
  },
};

export function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const meta = pageMeta[pathname] ?? { title: 'Admin Portal' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: brand.background }}>
      <div className={`sidebar-desktop ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div style={{ flex: 1, minWidth: 0 }}>
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main style={{ padding: '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
