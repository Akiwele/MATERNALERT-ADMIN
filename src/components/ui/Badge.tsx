import type { CSSProperties } from 'react';

import { brand } from '../../theme/brand';

type BadgeTone = 'pending' | 'approved' | 'rejected' | 'neutral';

const toneStyles: Record<BadgeTone, CSSProperties> = {
  pending: {
    backgroundColor: brand.warningLight,
    color: brand.warning,
  },
  approved: {
    backgroundColor: brand.successLight,
    color: brand.success,
  },
  rejected: {
    backgroundColor: brand.dangerLight,
    color: brand.danger,
  },
  neutral: {
    backgroundColor: brand.primaryMuted,
    color: brand.primaryDark,
  },
};

export function Badge({ tone, label }: { tone: BadgeTone; label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 600,
        ...toneStyles[tone],
      }}
    >
      {label}
    </span>
  );
}
