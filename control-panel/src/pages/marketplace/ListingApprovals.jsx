import { useEffect, useState, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import Can from '../../components/Can';
import postsApi from '../../api/posts';

// Marketplace listing approvals (buy/sell).
export default function ListingApprovals() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await postsApi.listListings({ status: 'pending' });
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
      if (type === 'approve') await postsApi.approveListing(row.id);
      else await postsApi.rejectListing(row.id, 'Does not meet listing policy');
    } catch {
      /* scaffold */
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
    { key: 'title', header: 'Listing', sortable: true },
    { key: 'seller', header: 'Seller', sortable: true },
    { key: 'price', header: 'Price', sortable: true, render: (r) => `${r.currency} ${r.price?.toLocaleString?.() ?? r.price}` },
    { key: 'kyc', header: 'Seller KYC', render: (r) => <StatusBadge status={r.kyc} /> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: '__actions',
      header: 'Actions',
      render: (r) =>
        r.status === 'pending' ? (
          <Can permission="listing:approve">
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
      <PageHeader title="Marketplace" subtitle="Approve or reject buy/sell listings." />
      <DataTable columns={columns} data={rows} loading={loading} />
      <ConfirmModal
        show={!!action}
        title={action?.type === 'approve' ? 'Approve listing' : 'Reject listing'}
        body={action ? `${action.type === 'approve' ? 'Approve' : 'Reject'} “${action.row.title}”?` : ''}
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
  { id: 842, title: '2019 Toyota Supra', seller: 'ben@autohub.dev', price: 48000, currency: 'USD', kyc: 'verified', status: 'pending' },
  { id: 851, title: '2021 Royal Enfield 650', seller: 'moto@autohub.dev', price: 5200, currency: 'USD', kyc: 'pending', status: 'pending' },
  { id: 860, title: '2018 Tesla Model 3', seller: 'eco@autohub.dev', price: 27000, currency: 'USD', kyc: 'verified', status: 'approved' },
];
