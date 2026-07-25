import { useState } from 'react';

import { ApprovedClinicDetails, formatDate } from '../components/ApplicationDetails';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import type { ClinicApplication } from '../types';

export function ApprovedClinics() {
  const {
    applications,
    applicationsLoading,
    applicationsError,
    refreshApplications,
  } = useApp();
  const [selected, setSelected] = useState<ClinicApplication | null>(null);
  const approved = applications.filter((item) => item.status === 'approved');

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
        onClose={() => setSelected(null)}
        footer={
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Close
          </Button>
        }
      >
        {selected ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            <Badge tone="approved" label="Approved" />
            <ApprovedClinicDetails application={selected} />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
