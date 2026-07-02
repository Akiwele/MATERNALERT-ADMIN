import { NavLink } from 'react-router-dom';

import { brand } from '../../theme/brand';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/pending', label: 'Pending Applications' },
  { to: '/admin/approved', label: 'Approved Clinics' },
  { to: '/admin/rejected', label: 'Rejected Clinics' },
  { to: '/admin/logs', label: 'System Logs' },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside
      style={{
        width: '260px',
        minHeight: '100vh',
        backgroundColor: brand.white,
        borderRight: `1px solid ${brand.border}`,
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <div>
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: brand.primary,
          }}
        >
          MaternAlert
        </p>
        <h1 style={{ margin: '6px 0 0', fontSize: '22px', color: brand.text }}>Admin Portal</h1>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            style={({ isActive }) => ({
              display: 'block',
              padding: '12px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              color: isActive ? brand.primaryDark : brand.textSecondary,
              backgroundColor: isActive ? brand.primaryMuted : 'transparent',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
