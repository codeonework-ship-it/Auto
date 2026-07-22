import { useEffect, useState, useCallback } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import { FaUserSlash, FaUserCheck, FaUserShield } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import Can from '../../components/Can';
import usersApi from '../../api/users';
import rolesApi from '../../api/roles';

// User management — list accounts, toggle status (ACTIVE <-> SUSPENDED), assign roles.
export default function UserManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [target, setTarget] = useState(null); // status-toggle target
  const [busy, setBusy] = useState(false);

  // Role assignment.
  const [roleCatalog, setRoleCatalog] = useState([]); // [{ code, name }]
  const [roleTarget, setRoleTarget] = useState(null); // user being edited
  const [selectedRoles, setSelectedRoles] = useState([]); // role codes

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.list();
      setRows(Array.isArray(data) ? data : data?.items ?? []);
    } catch (e) {
      setError(e.normalizedMessage || 'Could not load users.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Load the role catalog once so the assignment modal has options.
  useEffect(() => {
    rolesApi
      .list()
      .then((data) => setRoleCatalog(Array.isArray(data) ? data : data?.items ?? []))
      .catch(() => setRoleCatalog([]));
  }, []);

  const isActive = (s) => String(s ?? '').toUpperCase() === 'ACTIVE';

  const toggleStatus = async () => {
    setBusy(true);
    const next = isActive(target.status) ? 'SUSPENDED' : 'ACTIVE';
    try {
      const updated = await usersApi.setStatus(target.id, next);
      setRows((rs) =>
        rs.map((r) => (r.id === target.id ? { ...r, ...(updated || { status: next }) } : r))
      );
    } catch (e) {
      setError(e.normalizedMessage || 'Failed to change status.');
    } finally {
      setBusy(false);
      setTarget(null);
    }
  };

  const openRoles = (user) => {
    setRoleTarget(user);
    setSelectedRoles(Array.isArray(user.roles) ? [...user.roles] : []);
  };

  const toggleRole = (code) =>
    setSelectedRoles((cur) =>
      cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code]
    );

  const saveRoles = async () => {
    setBusy(true);
    try {
      const updated = await usersApi.setRoles(roleTarget.id, selectedRoles);
      setRows((rs) =>
        rs.map((r) =>
          r.id === roleTarget.id ? { ...r, ...(updated || { roles: selectedRoles }) } : r
        )
      );
      setRoleTarget(null);
    } catch (e) {
      setError(e.normalizedMessage || 'Failed to assign roles.');
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'email', header: 'Email', sortable: true },
    { key: 'username', header: 'Username', sortable: true },
    {
      key: 'roles',
      header: 'Roles',
      render: (r) => (Array.isArray(r.roles) ? r.roles.join(', ') : '') || '—',
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: '__actions',
      header: 'Actions',
      render: (r) => (
        <Can permission="user:manage">
          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant={isActive(r.status) ? 'outline-danger' : 'outline-success'}
              title={isActive(r.status) ? 'Suspend' : 'Reactivate'}
              onClick={() => setTarget(r)}
            >
              {isActive(r.status) ? <FaUserSlash /> : <FaUserCheck />}
            </Button>
            <Button size="sm" variant="light" title="Assign roles" onClick={() => openRoles(r)}>
              <FaUserShield />
            </Button>
          </div>
        </Can>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage accounts, roles and access." />
      {error && <Alert variant="info">{error}</Alert>}
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyMessage="No users found."
      />

      {/* Status toggle */}
      <ConfirmModal
        show={!!target}
        title="Change account status"
        body={
          target
            ? `${isActive(target.status) ? 'Suspend' : 'Reactivate'} ${target.email}?`
            : ''
        }
        confirmLabel={target && isActive(target.status) ? 'Suspend' : 'Reactivate'}
        variant={target && isActive(target.status) ? 'danger' : 'success'}
        busy={busy}
        onConfirm={toggleStatus}
        onCancel={() => setTarget(null)}
      />

      {/* Role assignment */}
      <Modal show={!!roleTarget} onHide={() => setRoleTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Assign roles</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {roleTarget && (
            <p className="ah-muted mb-3">
              Roles for <strong>{roleTarget.email}</strong>
            </p>
          )}
          {roleCatalog.length === 0 ? (
            <Alert variant="info" className="mb-0">
              No roles available.
            </Alert>
          ) : (
            roleCatalog.map((role) => (
              <Form.Check
                key={role.code}
                type="checkbox"
                id={`role-${role.code}`}
                label={`${role.code}${role.name ? ` — ${role.name}` : ''}`}
                checked={selectedRoles.includes(role.code)}
                onChange={() => toggleRole(role.code)}
                className="mb-2"
              />
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setRoleTarget(null)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={saveRoles} disabled={busy || roleCatalog.length === 0}>
            {busy ? 'Saving…' : 'Save roles'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
