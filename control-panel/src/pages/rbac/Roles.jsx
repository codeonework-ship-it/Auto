import { useEffect, useState, useCallback } from 'react';
import { Nav, Button, Modal, Form, Alert } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaKey } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Can from '../../components/Can';
import rolesApi from '../../api/roles';
import permissionsApi from '../../api/permissions';

// Sub-navigation shared between Roles and Permissions screens.
export function RbacTabs() {
  const { pathname } = useLocation();
  return (
    <Nav variant="tabs" className="mb-3">
      <Nav.Item>
        <Nav.Link as={Link} to="/roles" active={pathname === '/roles'}>
          Roles
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/permissions" active={pathname === '/permissions'}>
          Permissions
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
}

export default function Roles() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Permission editor.
  const [permCatalog, setPermCatalog] = useState([]); // [{ code, description }]
  const [editing, setEditing] = useState(null); // role being edited
  const [selected, setSelected] = useState([]); // permission codes
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rolesApi.list();
      setRows(Array.isArray(data) ? data : data?.items ?? []);
    } catch (e) {
      setError(e.normalizedMessage || 'Could not load roles.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    permissionsApi
      .list()
      .then((data) => setPermCatalog(Array.isArray(data) ? data : data?.items ?? []))
      .catch(() => setPermCatalog([]));
  }, []);

  const openEditor = (role) => {
    setEditing(role);
    setSelected(Array.isArray(role.permissions) ? [...role.permissions] : []);
  };

  const togglePerm = (code) =>
    setSelected((cur) =>
      cur.includes(code) ? cur.filter((c) => c !== code) : [...cur, code]
    );

  const save = async () => {
    setBusy(true);
    try {
      const updated = await rolesApi.setPermissions(editing.id, selected);
      setRows((rs) =>
        rs.map((r) =>
          r.id === editing.id ? { ...r, ...(updated || { permissions: selected }) } : r
        )
      );
      setEditing(null);
    } catch (e) {
      setError(e.normalizedMessage || 'Failed to save permissions.');
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    {
      key: 'code',
      header: 'Role',
      sortable: true,
      render: (r) => <StatusBadge status={r.code} variant="info" />,
    },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'description', header: 'Description' },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (r) => (Array.isArray(r.permissions) ? r.permissions.length : 0),
    },
    {
      key: '__actions',
      header: 'Actions',
      render: (r) => (
        <Can permission="role:manage">
          <Button size="sm" variant="light" title="Edit permissions" onClick={() => openEditor(r)}>
            <FaKey />
          </Button>
        </Can>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="RBAC roles that gate access across the platform."
      />
      <RbacTabs />
      {error && <Alert variant="info">{error}</Alert>}
      <DataTable columns={columns} data={rows} loading={loading} emptyMessage="No roles found." />

      <Modal show={!!editing} onHide={() => setEditing(null)} centered scrollable>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? `Permissions — ${editing.code}` : 'Permissions'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {permCatalog.length === 0 ? (
            <Alert variant="info" className="mb-0">
              No permissions available.
            </Alert>
          ) : (
            permCatalog.map((p) => (
              <Form.Check
                key={p.code}
                type="checkbox"
                id={`perm-${p.code}`}
                label={
                  <span>
                    <code>{p.code}</code>
                    {p.description ? <span className="ah-muted"> — {p.description}</span> : null}
                  </span>
                }
                checked={selected.includes(p.code)}
                onChange={() => togglePerm(p.code)}
                className="mb-2"
              />
            ))
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setEditing(null)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={save} disabled={busy || permCatalog.length === 0}>
            {busy ? 'Saving…' : 'Save permissions'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
