import { useRef, useState } from 'react';

import { ApprovedClinicDetails, formatDate } from '../components/ApplicationDetails';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  canShowActivationResend,
  getActivationResendCooldownMs,
  resendClinicInvitation,
} from '../lib/clinicApplications';
import type { ClinicApplication } from '../types';

export function ApprovedClinics() {
  const {
    applications,
    applicationsLoading,
    applicationsError,
    refreshApplications,
  } = useApp();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<ClinicApplication | null>(null);
  const [resendConfirmOpen, setResendConfirmOpen] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const resendInFlight = useRef(false);
  const approved = applications.filter((item) => item.status === 'approved');
  const canResend = selected ? canShowActivationResend(selected) : false;
  const cooldownMs = selected ? getActivationResendCooldownMs(selected.lastInvitationSentAt) : 0;
  const cooldownMinutes = Math.ceil(cooldownMs / 60000);

  return (
    <div>
      <DataTable
        rows={approved}
        loading={applicationsLoading}
        errorMessage={applicationsError}
        onRetry={refreshApplications}
        emptyMessage="No approved clinics yet."
        columns={[
          { key: 'facility', header: 'Facility Name', render: (row) => row.facilityName },
          { key: 'licence', header: 'HeFRA Licence', render: (row) => row.hefraLicenceNumber },
          { key: 'email', header: 'Official Email', render: (row) => row.officialEmail },
          { key: 'region', header: 'Region', render: (row) => row.region },
          { key: 'approved', header: 'Date Approved', render: (row) => formatDate(row.reviewedAt) },
          {
            key: 'status',
            header: 'Account Status',
            render: (row) => row.accountStatus ?? 'Pending Activation',
          },
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
        title="Approved Clinic Details"
        onClose={() => {
          if (!isResending) {
            setSelected(null);
          }
        }}
        footer={
          selected ? (
            <>
              {canResend ? (
                <Button
                  disabled={isResending || cooldownMs > 0}
                  onClick={() => setResendConfirmOpen(true)}
                >
                  {cooldownMs > 0
                    ? `Resend available in ${cooldownMinutes} min`
                    : 'Resend Activation Link'}
                </Button>
              ) : null}
              <Button
                variant="secondary"
                disabled={isResending}
                onClick={() => setSelected(null)}
              >
                Close
              </Button>
            </>
          ) : null
        }
      >
        {selected ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            <Badge tone="approved" label="Approved" />
            <ApprovedClinicDetails application={selected} />
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={resendConfirmOpen}
        title="Resend Activation Link"
        message={
          selected
            ? `Send a new activation link to ${selected.officialEmail}?`
            : 'Send a new activation link?'
        }
        confirmLabel={isResending ? 'Sending...' : 'Send Link'}
        isProcessing={isResending}
        onConfirm={async () => {
          if (!selected || resendInFlight.current) {
            return;
          }

          resendInFlight.current = true;
          setIsResending(true);

          try {
            const result = await resendClinicInvitation(selected.id);
            await refreshApplications();
            setSelected((current) =>
              current
                ? { ...current, lastInvitationSentAt: new Date().toISOString() }
                : current,
            );
            setResendConfirmOpen(false);
            showToast(result.message);
          } catch (error) {
            showToast(
              error instanceof Error
                ? error.message
                : 'Unable to resend the clinic activation link.',
              'error',
            );
          } finally {
            resendInFlight.current = false;
            setIsResending(false);
          }
        }}
        onCancel={() => {
          if (!isResending) {
            setResendConfirmOpen(false);
          }
        }}
      />
    </div>
  );
}
