import { useRef, useState } from 'react';

import { RejectedClinicDetails, formatDate } from '../components/ApplicationDetails';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  getRejectionEmailStatusLabel,
  retryClinicRejectionEmail,
} from '../lib/clinicApplications';
import type { ClinicApplication } from '../types';

export function RejectedClinics() {
  const {
    applications,
    applicationsLoading,
    applicationsError,
    refreshApplications,
  } = useApp();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<ClinicApplication | null>(null);
  const [isRetryingEmail, setIsRetryingEmail] = useState(false);
  const retryInFlight = useRef(false);
  const rejected = applications.filter((item) => item.status === 'rejected');
  const canRetryEmail = selected?.rejectionEmailStatus !== 'sent';

  return (
    <div>
      <DataTable
        rows={rejected}
        loading={applicationsLoading}
        errorMessage={applicationsError}
        onRetry={refreshApplications}
        emptyMessage="No rejected applications."
        columns={[
          { key: 'facility', header: 'Facility Name', render: (row) => row.facilityName },
          { key: 'licence', header: 'HeFRA Licence', render: (row) => row.hefraLicenceNumber },
          { key: 'email', header: 'Official Email', render: (row) => row.officialEmail },
          { key: 'region', header: 'Region', render: (row) => row.region },
          { key: 'rejected', header: 'Date Rejected', render: (row) => formatDate(row.reviewedAt) },
          {
            key: 'emailStatus',
            header: 'Email Status',
            render: (row) => getRejectionEmailStatusLabel(row.rejectionEmailStatus),
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
        title="Rejected Application Details"
        onClose={() => {
          if (!isRetryingEmail) {
            setSelected(null);
          }
        }}
        footer={
          selected ? (
            <>
              {canRetryEmail ? (
                <Button
                  disabled={isRetryingEmail}
                  onClick={async () => {
                    if (retryInFlight.current) {
                      return;
                    }

                    retryInFlight.current = true;
                    setIsRetryingEmail(true);

                    try {
                      const result = await retryClinicRejectionEmail(selected.id);
                      await refreshApplications();
                      setSelected((current) =>
                        current
                          ? {
                              ...current,
                              rejectionEmailStatus: result.emailSent ? 'sent' : 'failed',
                            }
                          : current,
                      );
                      showToast(result.message, result.emailSent ? 'success' : 'error');
                    } catch (error) {
                      showToast(
                        error instanceof Error
                          ? error.message
                          : 'Unable to send the rejection email.',
                        'error',
                      );
                    } finally {
                      retryInFlight.current = false;
                      setIsRetryingEmail(false);
                    }
                  }}
                >
                  {isRetryingEmail ? 'Sending...' : 'Retry Rejection Email'}
                </Button>
              ) : null}
              <Button
                variant="secondary"
                disabled={isRetryingEmail}
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
            <Badge tone="rejected" label="Rejected" />
            <Badge
              tone={selected.rejectionEmailStatus === 'sent' ? 'approved' : 'rejected'}
              label={getRejectionEmailStatusLabel(selected.rejectionEmailStatus)}
            />
            <RejectedClinicDetails application={selected} />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
