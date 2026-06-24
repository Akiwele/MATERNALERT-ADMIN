import type { ReactNode } from 'react';

import { brand } from '../../theme/brand';
import { Button } from './Button';

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="dialog-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="dialog-card"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          overflow: 'auto',
          backgroundColor: brand.white,
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.18)',
          padding: 0,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: `1px solid ${brand.border}`,
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', color: brand.text }}>{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close modal">
            ✕
          </Button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
        {footer ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '16px 24px 24px',
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
