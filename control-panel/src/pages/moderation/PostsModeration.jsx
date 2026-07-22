import { useEffect, useState, useCallback } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import Can from '../../components/Can';
import postsApi from '../../api/posts';

// Posts moderation — lists published catalog posts and lets a moderator take one down
// (DELETE /posts/{id}, requires post:moderate). No dedicated report queue exists for posts,
// so this lists the live catalog. Reported items are triaged on the Reports screen.
export default function PostsModeration() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postsApi.list();
      setRows(Array.isArray(data) ? data : data?.items ?? []);
    } catch (e) {
      setError(e.normalizedMessage || 'Could not load posts.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await postsApi.remove(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setError(e.normalizedMessage || 'Take-down failed.');
      setDeleteTarget(null);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'kind', header: 'Kind', sortable: true },
    { key: 'title', header: 'Post', sortable: true },
    { key: 'slug', header: 'Slug' },
    { key: 'authorId', header: 'Author', render: (r) => shortId(r.authorId) },
    { key: 'imageCount', header: 'Images', sortable: true },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: '__actions',
      header: 'Actions',
      render: (r) => (
        <Can permission="post:moderate">
          <Button
            size="sm"
            variant="outline-danger"
            title="Take down"
            onClick={() => setDeleteTarget(r)}
          >
            <FaTrash />
          </Button>
        </Can>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Posts Moderation" subtitle="Review and take down catalog posts." />
      {error && <Alert variant="info">{error}</Alert>}
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyMessage="No posts found."
      />
      <ConfirmModal
        show={!!deleteTarget}
        title="Take down post"
        body={deleteTarget ? `Permanently remove “${deleteTarget.title}”? This cannot be undone.` : ''}
        confirmLabel="Take down"
        variant="danger"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function shortId(id) {
  const s = String(id ?? '');
  return s.length > 10 ? `${s.slice(0, 8)}…` : s || '—';
}
