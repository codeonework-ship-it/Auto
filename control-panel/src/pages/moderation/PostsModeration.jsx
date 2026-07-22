import { useEffect, useState, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { FaCheck, FaBan } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import Can from '../../components/Can';
import moderationApi from '../../api/moderation';

// Moderation queue for reported car/bike posts and comments.
export default function PostsModeration() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState(null); // { row, type }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await moderationApi.listQueue('posts');
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

  const runAction = async () => {
    setBusy(true);
    const { row, type } = action;
    try {
      if (type === 'approve') await moderationApi.approve(row.id);
      else await moderationApi.takedown(row.id, 'Policy violation');
    } catch {
      /* scaffold */
    } finally {
      setRows((rs) =>
        rs.map((r) =>
          r.id === row.id
            ? { ...r, status: type === 'approve' ? 'approved' : 'takedown' }
            : r
        )
      );
      setBusy(false);
      setAction(null);
    }
  };

  const columns = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'title', header: 'Post', sortable: true },
    { key: 'author', header: 'Author', sortable: true },
    { key: 'reason', header: 'Report Reason' },
    { key: 'reports', header: 'Reports', sortable: true },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: '__actions',
      header: 'Actions',
      render: (r) =>
        r.status === 'pending' ? (
          <Can permission="post:moderate">
            <div className="d-flex gap-2">
              <Button size="sm" variant="outline-success" onClick={() => setAction({ row: r, type: 'approve' })}>
                <FaCheck />
              </Button>
              <Button size="sm" variant="outline-danger" onClick={() => setAction({ row: r, type: 'takedown' })}>
                <FaBan />
              </Button>
            </div>
          </Can>
        ) : (
          <span className="ah-muted">—</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="Posts Moderation" subtitle="Review reported posts and comments." />
      <DataTable columns={columns} data={rows} loading={loading} />
      <ConfirmModal
        show={!!action}
        title={action?.type === 'approve' ? 'Approve post' : 'Take down post'}
        body={action ? `${action.type === 'approve' ? 'Clear' : 'Take down'} “${action.row.title}”?` : ''}
        confirmLabel={action?.type === 'approve' ? 'Approve' : 'Take down'}
        variant={action?.type === 'approve' ? 'success' : 'danger'}
        busy={busy}
        onConfirm={runAction}
        onCancel={() => setAction(null)}
      />
    </div>
  );
}

const SAMPLE = [
  { id: 5521, title: '2024 Ducati Panigale review', author: 'rider@autohub.dev', reason: 'Spam', reports: 4, status: 'pending' },
  { id: 5530, title: 'Best budget EVs', author: 'eco@autohub.dev', reason: 'Misinformation', reports: 2, status: 'pending' },
  { id: 5544, title: 'Off-road build thread', author: 'jeep@autohub.dev', reason: 'Offensive', reports: 1, status: 'approved' },
];
