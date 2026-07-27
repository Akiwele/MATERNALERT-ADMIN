import { useRef, useState } from 'react';

import { PendingApplicationDetails, formatDate } from '../components/ApplicationDetails';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable } from '../components/ui/DataTable';
import { DocumentViewerModal } from '../components/ui/DocumentViewerModal';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  approveClinicApplication,
  getClinicLicenseDocumentUrl,
  rejectClinicApplication,
} from '../lib/clinicApplications';
import { brand } from '../theme/brand';
import type { ClinicApplication } from '../types';

export function PendingApplications() {
  const {
    applications,
    applicationsLoading,
    applicationsError,
    refreshApplications,
  } = useApp();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<ClinicApplication | null>(null);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(
    null,
  );
  const actionInFlight = useRef(false);
  const [documentView, setDocumentView] = useState<{
    fileName: string;
    imageUrl?: string;
    loading: boolean;
    errorMessage?: string;
  } | null>(null);

  const pending = applications.filter((item) => item.status === 'pending');
  const isProcessing = processingAction !== null;

  const handleViewDocument = async () => {
    if (!selected?.licenceDocumentPath) {
      return;
    }

    setDocumentView({
      fileName: selected.hefraDocumentName,
      loading: true,
    });

    try {
      const imageUrl = await getClinicLicenseDocumentUrl(selected.id);
      setDocumentView((current) =>
        current ? { ...current, imageUrl, loading: false } : current,
      );
    } catch (error) {
      setDocumentView((current) =>
        current
          ? {
              ...current,
              loading: false,
              errorMessage:
                error instanceof Error
                  ? error.message
                  : 'Unable to open the licence document. Please try again.',
            }
          : current,
      );
    }
  };

  const handleConfirmApprove = async () => {
    if (!selected || actionInFlight.current) {
      return;
    }

    actionInFlight.current = true;
    setProcessingAction('approve');

    try {
      const result = await approveClinicApplication(selected.id);
      await refreshApplications();
      setApproveConfirmOpen(false);
      setSelected(null);
      showToast(
        result.provisioningState === 'already_provisioned'
          ? 'This clinic was already approved and provisioned.'
          : result.invitationSent
            ? 'Clinic approved, provisioned, and invited successfully.'
            : 'Clinic provisioning resumed and completed successfully.',
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Unable to approve this clinic application.',
        'error',
      );
    } finally {
      actionInFlight.current = false;
      setProcessingAction(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!selected || actionInFlight.current) {
      return;
    }

    const trimmedReason = rejectionReason.trim();
    if (!trimmedReason) {
      setRejectionError('A rejection reason is required.');
      return;
    }

    actionInFlight.current = true;
    setRejectionError('');
    setProcessingAction('reject');

    try {
      await rejectClinicApplication(selected.id, trimmedReason);
      await refreshApplications();
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelected(null);
      showToast('Clinic application rejected successfully.');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Unable to reject this clinic application.',
        'error',
      );
    } finally {
      actionInFlight.current = false;
      setProcessingAction(null);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <DataTable
        rows={pending}
        loading={applicationsLoading}
        errorMessage={applicationsError}
        onRetry={refreshApplications}
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
        onClose={() => {
          if (!isProcessing) {
            setSelected(null);
          }
        }}
        footer={
          selected ? (
            <>
              <Button
                variant="danger"
                disabled={isProcessing}
                onClick={() => {
                  setRejectionReason('');
                  setRejectionError('');
                  setRejectDialogOpen(true);
                }}
              >
                Reject Application
              </Button>
              <Button
                disabled={isProcessing}
                onClick={() => setApproveConfirmOpen(true)}
              >
                Approve Clinic
              </Button>
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
        confirmLabel={processingAction === 'approve' ? 'Approving...' : 'Approve Clinic'}
        isProcessing={processingAction === 'approve'}
        onConfirm={handleConfirmApprove}
        onCancel={() => {
          if (!isProcessing) {
            setApproveConfirmOpen(false);
          }
        }}
      />

      <ConfirmDialog
        open={rejectDialogOpen}
        title="Reject Application"
        message="Provide a reason for rejecting this clinic application."
        confirmLabel={processingAction === 'reject' ? 'Rejecting...' : 'Confirm Rejection'}
        confirmVariant="danger"
        isProcessing={processingAction === 'reject'}
        onConfirm={handleConfirmReject}
        onCancel={() => {
          if (isProcessing) {
            return;
          }
          setRejectDialogOpen(false);
          setRejectionReason('');
          setRejectionError('');
        }}
      >
        <label style={{ display: 'grid', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: brand.text }}>
            Rejection Reason
          </span>
          <textarea
            value={rejectionReason}
            onChange={(event) => {
              setRejectionReason(event.target.value);
              setRejectionError('');
            }}
            disabled={processingAction === 'reject'}
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
          {rejectionError ? (
            <span role="alert" style={{ fontSize: '13px', color: brand.danger }}>
              {rejectionError}
            </span>
          ) : null}
        </label>
      </ConfirmDialog>

      <DocumentViewerModal
        open={Boolean(documentView)}
        title="HeFRA Licence Document"
        fileName={documentView?.fileName ?? ''}
        imageUrl={documentView?.imageUrl}
        loading={documentView?.loading}
        errorMessage={documentView?.errorMessage}
        onClose={() => setDocumentView(null)}
      />
    </div>
  );
}
