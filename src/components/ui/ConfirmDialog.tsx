import type { ReactNode } from 'react';

import { brand } from '../../theme/brand';
import { Button } from './Button';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        className="dialog-card"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: brand.text }}>{title}</h3>
        <p style={{ margin: '0 0 16px', fontSize: '14px', color: brand.textSecondary, lineHeight: 1.6 }}>
          {message}
        </p>
        {children}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
