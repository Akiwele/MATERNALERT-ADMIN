/**
 * MaternAlert brand colors for the Admin Portal.
 */
export const brand = {
  /** Primary teal */
  primary: '#0D9488',
  primaryDark: '#0F766E',
  /** Light teal */
  primaryLight: '#CCFBF1',
  primaryMuted: '#F0FDFA',
  white: '#FFFFFF',
  background: '#F8FAFC',
  /** Dark text */
  text: '#1F2937',
  /** Muted text */
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  success: '#059669',
  successLight: '#ECFDF5',
  warning: '#D97706',
  warningLight: '#FFFBEB',
} as const;

export type Brand = typeof brand;
