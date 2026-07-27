import { brand } from '../../theme/brand';
import { Button } from './Button';
import { Modal } from './Modal';

type DocumentViewerModalProps = {
  open: boolean;
  title: string;
  fileName: string;
  imageUrl?: string;
  loading?: boolean;
  errorMessage?: string;
  onClose: () => void;
};

export function DocumentViewerModal({
  open,
  title,
  fileName,
  imageUrl,
  loading = false,
  errorMessage,
  onClose,
}: DocumentViewerModalProps) {
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
            Protected Document Preview
          </div>
          <div
            style={{
              display: 'grid',
              placeItems: 'center',
              padding: '24px',
              minHeight: '280px',
            }}
          >
            {loading ? (
              <p role="status" style={{ margin: 0, color: brand.textSecondary }}>
                Loading licence document...
              </p>
            ) : errorMessage ? (
              <p role="alert" style={{ margin: 0, color: brand.danger }}>
                {errorMessage}
              </p>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                style={{
                  display: 'block',
                  width: '100%',
                  maxWidth: '720px',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />
            ) : (
              <p style={{ margin: 0, color: brand.textSecondary }}>
                The licence document is unavailable.
              </p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
