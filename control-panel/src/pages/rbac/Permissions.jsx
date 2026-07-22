import { useEffect, useState, useCallback } from 'react';
import { Alert } from 'react-bootstrap';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { RbacTabs } from './Roles';
import permissionsApi from '../../api/permissions';

// Permissions are `resource:action` codes: [{ id, code, description }].
export default function Permissions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await permissionsApi.list();
      setRows(Array.isArray(data) ? data : data?.items ?? []);
    } catch (e) {
      setError(e.normalizedMessage || 'Could not load permissions.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    { key: 'code', header: 'Permission', sortable: true },
    {
      key: 'resource',
      header: 'Resource',
      sortable: true,
      accessor: (r) => String(r.code ?? '').split(':')[0] || '—',
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      accessor: (r) => String(r.code ?? '').split(':')[1] || '—',
    },
    { key: 'description', header: 'Description' },
  ];

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Fine-grained resource:action permissions."
      />
      <RbacTabs />
      {error && <Alert variant="info">{error}</Alert>}
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyMessage="No permissions found."
      />
    </div>
  );
}
