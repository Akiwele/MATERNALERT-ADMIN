import { brand } from '../../theme/brand';

type StatsCardProps = {
  label: string;
  value: number | string;
  hint?: string;
};

export function StatsCard({ label, value, hint }: StatsCardProps) {
  return (
    <div
      style={{
        backgroundColor: brand.white,
        border: `1px solid ${brand.border}`,
        borderRadius: '14px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
      }}
    >
      <p style={{ margin: 0, fontSize: '14px', color: brand.textSecondary }}>{label}</p>
      <p style={{ margin: '8px 0 0', fontSize: '32px', fontWeight: 700, color: brand.text }}>
        {value}
      </p>
      {hint ? (
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: brand.textSecondary }}>{hint}</p>
      ) : null}
    </div>
  );
}
