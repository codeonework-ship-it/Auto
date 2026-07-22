import { useEffect, useState, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { FaUserSlash, FaUserCheck } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import Can from '../../components/Can';
import usersApi from '../../api/users';

// User management — list, view roles, toggle account status.
export default function UserManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersApi.list();
      setRows(Array.isArray(data) ? data : data?.items ?? []);
    } catch {
      // Placeholder data when API is unavailable.
      setRows(SAMPLE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async () => {
    setBusy(true);
    const next = target.status === 'active' ? 'suspended' : 'active';
    try {
      await usersApi.setStatus(target.id, next);
    } catch {
      // optimistic fallback for scaffold
      setRows((rs) =>
        rs.map((r) => (r.id === target.id ? { ...r, status: next } : r))
      );
    } finally {
      setBusy(false);
      setTarget(null);
    }
  };

  const columns = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'roles', header: 'Roles', render: (r) => (r.roles || []).join(', ') || '—' },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    { key: 'createdAt', header: 'Joined', sortable: true },
    {
      key: '__actions',
      header: 'Actions',
      render: (r) => (
        <Can permission="user:manage">
          <Button
            size="sm"
            variant={r.status === 'active' ? 'outline-danger' : 'outline-success'}
            onClick={() => setTarget(r)}
          >
            {r.status === 'active' ? <FaUserSlash /> : <FaUserCheck />}
          </Button>
        </Can>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage accounts, roles and access." />
      <DataTable columns={columns} data={rows} loading={loading} />
      <ConfirmModal
        show={!!target}
        title="Change account status"
        body={
          target
            ? `${target.status === 'active' ? 'Suspend' : 'Reactivate'} ${target.email}?`
            : ''
        }
        confirmLabel={target?.status === 'active' ? 'Suspend' : 'Reactivate'}
        variant={target?.status === 'active' ? 'danger' : 'success'}
        busy={busy}
        onConfirm={toggleStatus}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}

const SAMPLE = [
  { id: 1, name: 'Ava Turner', email: 'ava@autohub.dev', roles: ['ADMIN'], status: 'active', createdAt: '2026-01-12' },
  { id: 2, name: 'Ben Cole', email: 'ben@autohub.dev', roles: ['SELLER'], status: 'active', createdAt: '2026-02-03' },
  { id: 3, name: 'Cara Diaz', email: 'cara@autohub.dev', roles: ['MODERATOR'], status: 'suspended', createdAt: '2026-03-21' },
  { id: 4, name: 'Dan Ellis', email: 'dan@autohub.dev', roles: ['BUYER'], status: 'active', createdAt: '2026-04-09' },
];
