import { useEffect, useState, useCallback } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import rolesApi from '../../api/roles';

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

// Canonical roles from the spec (used as fallback data).
const SAMPLE = [
  { id: 1, name: 'SUPER_ADMIN', description: 'Full unrestricted access', users: 2 },
  { id: 2, name: 'ADMIN', description: 'Administrative access', users: 6 },
  { id: 3, name: 'MODERATOR', description: 'Content moderation', users: 14 },
  { id: 4, name: 'SELLER', description: 'Marketplace seller', users: 320 },
  { id: 5, name: 'BUYER', description: 'Marketplace buyer', users: 4100 },
  { id: 6, name: 'AUTHOR', description: 'Travel/blog author', users: 88 },
  { id: 7, name: 'MEMBER', description: 'Community member', users: 7900 },
  { id: 8, name: 'GUEST', description: 'Unauthenticated visitor', users: 0 },
];

export default function Roles() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await rolesApi.list();
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
    { key: 'name', header: 'Role', sortable: true, render: (r) => <StatusBadge status={r.name} variant="info" /> },
    { key: 'description', header: 'Description' },
    { key: 'users', header: 'Users', sortable: true },
  ];

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="RBAC roles that gate access across the platform."
      />
      <RbacTabs />
      <DataTable columns={columns} data={rows} loading={loading} />
    </div>
  );
}
