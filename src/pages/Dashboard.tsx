import { Link } from 'react-router-dom';

import { formatDate } from '../components/ApplicationDetails';
import { DataTable } from '../components/ui/DataTable';
import { StatsCard } from '../components/ui/StatsCard';
import { useApp } from '../context/AppContext';
import { brand } from '../theme/brand';

export function Dashboard() {
  const { applications, logs } = useApp();

  const pendingCount = applications.filter((item) => item.status === 'pending').length;
  const approvedCount = applications.filter((item) => item.status === 'approved').length;
  const rejectedCount = applications.filter((item) => item.status === 'rejected').length;

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
        }}
      >
        <StatsCard label="Pending Applications" value={pendingCount} />
        <StatsCard label="Approved Clinics" value={approvedCount} />
        <StatsCard label="Rejected Clinics" value={rejectedCount} />
        <StatsCard label="System Log Entries" value={logs.length} />
      </section>

      <section style={{ display: 'grid', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: brand.text }}>Recent Applications</h3>
          <Link to="/admin/pending" style={{ color: brand.primary, fontWeight: 600, fontSize: '14px' }}>
            View all pending
          </Link>
        </div>
        <DataTable
          rows={recentApplications}
          emptyMessage="No applications yet."
          columns={[
            { key: 'facility', header: 'Facility', render: (row) => row.facilityName },
            { key: 'region', header: 'Region', render: (row) => row.region },
            { key: 'status', header: 'Status', render: (row) => row.status },
            { key: 'submitted', header: 'Submitted', render: (row) => formatDate(row.submittedAt) },
          ]}
        />
      </section>
    </div>
  );
}
