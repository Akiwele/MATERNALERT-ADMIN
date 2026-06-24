import { brand } from '../../theme/brand';
import { Button } from './Button';
import { Modal } from './Modal';

type DocumentViewerModalProps = {
  open: boolean;
  title: string;
  fileName: string;
  onClose: () => void;
};

export function DocumentViewerModal({ open, title, fileName, onClose }: DocumentViewerModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div style={{ display: 'grid', gap: '16px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: brand.textSecondary }}>
          File: <strong style={{ color: brand.text }}>{fileName}</strong>
        </p>
        <div
          style={{
            border: `1px solid ${brand.border}`,
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: brand.background,
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: brand.primaryMuted,
              borderBottom: `1px solid ${brand.border}`,
              fontSize: '13px',
              fontWeight: 600,
              color: brand.primaryDark,
            }}
          >
            Mock Document Preview
          </div>
          <div style={{ padding: '24px', minHeight: '280px' }}>
            <div
              style={{
                width: '100%',
                maxWidth: '420px',
                margin: '0 auto',
                backgroundColor: brand.white,
                border: `1px solid ${brand.border}`,
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
              }}
            >
              <p style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 700, color: brand.text }}>
                {title}
              </p>
              <p style={{ margin: '0 0 8px', fontSize: '13px', color: brand.textSecondary }}>
                MaternAlert — Official Document Placeholder
              </p>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.7, color: brand.text }}>
                This is a mock PDF preview for demonstration purposes. When Firebase storage is
                connected, the uploaded document will open here for admin review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
