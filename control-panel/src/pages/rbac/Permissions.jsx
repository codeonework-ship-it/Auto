import { useEffect, useState, useCallback } from 'react';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import { RbacTabs } from './Roles';
import permissionsApi from '../../api/permissions';

// Permissions are `resource:action` strings.
const SAMPLE = [
  { id: 1, name: 'user:manage', resource: 'user', action: 'manage' },
  { id: 2, name: 'role:manage', resource: 'role', action: 'manage' },
  { id: 3, name: 'master:manage', resource: 'master', action: 'manage' },
  { id: 4, name: 'kyc:review', resource: 'kyc', action: 'review' },
  { id: 5, name: 'post:create', resource: 'post', action: 'create' },
  { id: 6, name: 'post:moderate', resource: 'post', action: 'moderate' },
  { id: 7, name: 'listing:approve', resource: 'listing', action: 'approve' },
  { id: 8, name: 'report:view', resource: 'report', action: 'view' },
  { id: 9, name: 'audit:view', resource: 'audit', action: 'view' },
];

export default function Permissions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await permissionsApi.list();
      setRows(Array.isArray(data) ? data : data?.items ?? []);
    } catch {
      setRows(SAMPLE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns = [
    { key: 'name', header: 'Permission', sortable: true },
    { key: 'resource', header: 'Resource', sortable: true },
    { key: 'action', header: 'Action', sortable: true },
  ];

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Fine-grained resource:action permissions."
      />
      <RbacTabs />
      <DataTable columns={columns} data={rows} loading={loading} />
    </div>
  );
}
