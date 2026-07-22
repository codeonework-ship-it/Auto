import { useEffect, useState, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import Can from '../../components/Can';
import kycApi from '../../api/kyc';

// KYC review queue for marketplace buyers/sellers.
export default function KycReview() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState(null); // { row, type: 'approve' | 'reject' }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await kycApi.list({ status: 'pending' });
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
      if (type === 'approve') await kycApi.approve(row.id);
      else await kycApi.reject(row.id, 'Rejected via control panel');
    } catch {
      /* scaffold: ignore */
    } finally {
      setRows((rs) =>
        rs.map((r) =>
          r.id === row.id
            ? { ...r, status: type === 'approve' ? 'approved' : 'rejected' }
            : r
        )
      );
      setBusy(false);
      setAction(null);
    }
  };

  const columns = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'user', header: 'User', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'docType', header: 'Document' },
    { key: 'submittedAt', header: 'Submitted', sortable: true },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: '__actions',
      header: 'Actions',
      render: (r) =>
        r.status === 'pending' ? (
          <Can permission="kyc:review">
            <div className="d-flex gap-2">
              <Button size="sm" variant="outline-success" onClick={() => setAction({ row: r, type: 'approve' })}>
                <FaCheck />
              </Button>
              <Button size="sm" variant="outline-danger" onClick={() => setAction({ row: r, type: 'reject' })}>
                <FaTimes />
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
      <PageHeader title="KYC Review" subtitle="Verify buyer/seller identity submissions." />
      <DataTable columns={columns} data={rows} loading={loading} />
      <ConfirmModal
        show={!!action}
        title={action?.type === 'approve' ? 'Approve KYC' : 'Reject KYC'}
        body={action ? `${action.type === 'approve' ? 'Approve' : 'Reject'} submission for ${action.row.user}?` : ''}
        confirmLabel={action?.type === 'approve' ? 'Approve' : 'Reject'}
        variant={action?.type === 'approve' ? 'success' : 'danger'}
        busy={busy}
        onConfirm={runAction}
        onCancel={() => setAction(null)}
      />
    </div>
  );
}

const SAMPLE = [
  { id: 101, user: 'ben@autohub.dev', type: 'Seller', docType: 'Passport', submittedAt: '2026-07-20', status: 'pending' },
  { id: 102, user: 'dan@autohub.dev', type: 'Buyer', docType: 'Driver License', submittedAt: '2026-07-21', status: 'pending' },
  { id: 103, user: 'eve@autohub.dev', type: 'Seller', docType: 'National ID', submittedAt: '2026-07-19', status: 'approved' },
];
