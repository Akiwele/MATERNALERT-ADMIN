import { useState } from 'react';

import { PendingApplicationDetails, formatDate } from '../components/ApplicationDetails';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable } from '../components/ui/DataTable';
import { DocumentViewerModal } from '../components/ui/DocumentViewerModal';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { brand } from '../theme/brand';
import type { ClinicApplication, DocumentType } from '../types';

export function PendingApplications() {
  const { applications, approveApplication, rejectApplication } = useApp();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<ClinicApplication | null>(null);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [documentView, setDocumentView] = useState<{
    type: DocumentType;
    fileName: string;
  } | null>(null);

  const pending = applications.filter((item) => item.status === 'pending');

  const handleViewDocument = () => {
    if (!selected) {
      return;
    }

    setDocumentView({
      type: 'hefra',
      fileName: selected.hefraDocumentName,
    });
  };

  const handleConfirmApprove = () => {
    if (!selected) {
      return;
    }

    const result = approveApplication(selected.id);
    setApproveConfirmOpen(false);
    setSelected(null);

    if (result) {
      showToast('Clinic approved successfully. Activation link sent to official email.');
    }
  };

  const handleConfirmReject = () => {
    if (!selected) {
      return;
    }

    rejectApplication(selected.id, rejectionReason);
    setRejectDialogOpen(false);
    setRejectionReason('');
    setSelected(null);
    showToast('Clinic application rejected.');
  };

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <DataTable
        rows={pending}
        emptyMessage="No pending clinic applications."
        columns={[
          { key: 'facility', header: 'Facility Name', render: (row) => row.facilityName },
          { key: 'licence', header: 'HeFRA Licence', render: (row) => row.hefraLicenceNumber },
          { key: 'region', header: 'Region', render: (row) => row.region },
          { key: 'email', header: 'Official Email', render: (row) => row.officialEmail },
          { key: 'submitted', header: 'Submitted', render: (row) => formatDate(row.submittedAt) },
          {
            key: 'actions',
            header: 'Actions',
            render: (row) => (
              <Button variant="secondary" onClick={() => setSelected(row)}>
                View
              </Button>
            ),
          },
        ]}
      />

      <Modal
        open={Boolean(selected)}
        title="Pending Application Details"
        onClose={() => setSelected(null)}
        footer={
          selected ? (
            <>
              <Button variant="danger" onClick={() => setRejectDialogOpen(true)}>
                Reject Application
              </Button>
              <Button onClick={() => setApproveConfirmOpen(true)}>Approve Clinic</Button>
            </>
          ) : null
        }
      >
        {selected ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            <Badge tone="pending" label="Pending Review" />
            <PendingApplicationDetails
              application={selected}
              onViewDocument={handleViewDocument}
            />
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={approveConfirmOpen}
        title="Approve Clinic"
        message="Are you sure you want to approve this clinic?"
        confirmLabel="Approve Clinic"
        onConfirm={handleConfirmApprove}
        onCancel={() => setApproveConfirmOpen(false)}
      />

      <ConfirmDialog
        open={rejectDialogOpen}
        title="Reject Application"
        message="Optionally provide a reason for rejecting this clinic application."
        confirmLabel="Confirm Rejection"
        confirmVariant="danger"
        onConfirm={handleConfirmReject}
        onCancel={() => {
          setRejectDialogOpen(false);
          setRejectionReason('');
        }}
      >
        <label style={{ display: 'grid', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: brand.text }}>
            Rejection Reason (optional)
          </span>
          <textarea
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            rows={4}
            placeholder="Enter reason for rejection..."
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '10px',
              border: `1px solid ${brand.border}`,
              resize: 'vertical',
              fontSize: '14px',
              lineHeight: 1.5,
            }}
          />
        </label>
      </ConfirmDialog>

      <DocumentViewerModal
        open={Boolean(documentView)}
        title="HeFRA Licence Document"
        fileName={documentView?.fileName ?? ''}
        onClose={() => setDocumentView(null)}
      />
    </div>
  );
}
