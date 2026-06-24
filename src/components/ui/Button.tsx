import type { ButtonHTMLAttributes, ReactNode } from 'react';

import type { CSSProperties } from 'react';

import { brand } from '../../theme/brand';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: brand.primary,
    color: brand.white,
    border: `1px solid ${brand.primary}`,
  },
  secondary: {
    backgroundColor: brand.white,
    color: brand.primaryDark,
    border: `1px solid ${brand.border}`,
  },
  danger: {
    backgroundColor: brand.danger,
    color: brand.white,
    border: `1px solid ${brand.danger}`,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: brand.textSecondary,
    border: '1px solid transparent',
  },
};

export function Button({
  variant = 'primary',
  children,
  style,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 16px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.6 : 1,
        transition: 'opacity 0.15s ease',
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
