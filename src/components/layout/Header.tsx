import { useApp } from '../../context/AppContext';
import { brand } from '../../theme/brand';
import { Button } from '../ui/Button';

type HeaderProps = {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
};

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { logout } = useApp();

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '20px 24px',
        backgroundColor: brand.white,
        borderBottom: `1px solid ${brand.border}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            style={{
              display: 'none',
              border: `1px solid ${brand.border}`,
              backgroundColor: brand.white,
              borderRadius: '8px',
              padding: '8px 10px',
              cursor: 'pointer',
            }}
            className="mobile-menu-button"
          >
            ☰
          </button>
        ) : null}
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', color: brand.text }}>{title}</h2>
          {subtitle ? (
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: brand.textSecondary }}>
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <Button variant="secondary" onClick={logout}>
        Logout
      </Button>
    </header>
  );
}
