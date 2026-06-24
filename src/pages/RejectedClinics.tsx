import { useState } from 'react';

import { RejectedClinicDetails, formatDate } from '../components/ApplicationDetails';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DataTable } from '../components/ui/DataTable';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../context/AppContext';
import type { ClinicApplication } from '../types';

export function RejectedClinics() {
  const { applications } = useApp();
  const [selected, setSelected] = useState<ClinicApplication | null>(null);
  const rejected = applications.filter((item) => item.status === 'rejected');

  return (
    <div>
      <DataTable
        rows={rejected}
        emptyMessage="No rejected applications."
        columns={[
          { key: 'facility', header: 'Facility Name', render: (row) => row.facilityName },
          { key: 'licence', header: 'HeFRA Licence', render: (row) => row.hefraLicenceNumber },
          { key: 'email', header: 'Official Email', render: (row) => row.officialEmail },
          { key: 'region', header: 'Region', render: (row) => row.region },
          { key: 'rejected', header: 'Date Rejected', render: (row) => formatDate(row.reviewedAt) },
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
        onClose={() => setSelected(null)}
        footer={
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Close
          </Button>
        }
      >
        {selected ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            <Badge tone="rejected" label="Rejected" />
            <RejectedClinicDetails application={selected} />
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
