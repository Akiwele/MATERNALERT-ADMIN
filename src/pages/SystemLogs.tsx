import { formatDate } from '../components/ApplicationDetails';
import { DataTable } from '../components/ui/DataTable';
import { useApp } from '../context/AppContext';

export function SystemLogs() {
  const { logs } = useApp();

  return (
    <DataTable
      rows={logs}
      emptyMessage="No system logs available."
      columns={[
        { key: 'action', header: 'Action', render: (row) => row.action },
        { key: 'details', header: 'Details', render: (row) => row.details },
        { key: 'timestamp', header: 'Timestamp', render: (row) => formatDate(row.timestamp) },
      ]}
    />
  );
}
