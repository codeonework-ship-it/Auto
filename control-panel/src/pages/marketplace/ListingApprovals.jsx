import { useEffect, useState, useCallback } from 'react';
import { Button, Form, InputGroup, Alert, Modal, Row, Col } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import Can from '../../components/Can';
import postsApi from '../../api/posts';

// Marketplace listing approvals.
// LIMITATION: the backend exposes no "list pending" endpoint — GET /marketplace/listings
// returns ACTIVE listings only. Admins approve/reject a specific listing by id (the id can be
// pasted below, or picked from the active list to reject one already published).
export default function ListingApprovals() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [manualId, setManualId] = useState('');
  const [approveTarget, setApproveTarget] = useState(null); // { id, title }
  const [rejectTarget, setRejectTarget] = useState(null); // { id, title }
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postsApi.listListings();
      setRows(Array.isArray(data) ? data : data?.items ?? []);
    } catch (e) {
      setError(e.normalizedMessage || 'Could not load listings.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const doApprove = async () => {
    setBusy(true);
    setNotice(null);
    try {
      await postsApi.approveListing(approveTarget.id);
      setNotice(`Listing ${shortId(approveTarget.id)} approved.`);
      setApproveTarget(null);
      setManualId('');
      await load();
    } catch (e) {
      setError(e.normalizedMessage || 'Approve failed.');
      setApproveTarget(null);
    } finally {
      setBusy(false);
    }
  };

  const doReject = async () => {
    setBusy(true);
    setNotice(null);
    try {
      await postsApi.rejectListing(rejectTarget.id, reason);
      setNotice(`Listing ${shortId(rejectTarget.id)} rejected.`);
      setRejectTarget(null);
      setReason('');
      setManualId('');
      await load();
    } catch (e) {
      setError(e.normalizedMessage || 'Reject failed.');
      setRejectTarget(null);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'id', header: 'ID', render: (r) => shortId(r.id) },
    { key: 'title', header: 'Listing', sortable: true },
    { key: 'sellerId', header: 'Seller', render: (r) => shortId(r.sellerId) },
    {
      key: 'priceAmount',
      header: 'Price',
      sortable: true,
      render: (r) => `${r.currency ?? ''} ${num(r.priceAmount)}`.trim(),
    },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'updatedAt', header: 'Updated', sortable: true, render: (r) => fmt(r.updatedAt) },
    {
      key: '__actions',
      header: 'Actions',
      render: (r) => (
        <Can permission="listing:approve">
          <div className="d-flex gap-2">
            <Button
              size="sm"
              variant="outline-success"
              title="Approve"
              onClick={() => setApproveTarget({ id: r.id, title: r.title })}
            >
              <FaCheck />
            </Button>
            <Button
              size="sm"
              variant="outline-danger"
              title="Reject"
              onClick={() => {
                setReason('');
                setRejectTarget({ id: r.id, title: r.title });
              }}
            >
              <FaTimes />
            </Button>
          </div>
        </Can>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Marketplace" subtitle="Approve or reject buy/sell listings." />

      <Alert variant="warning">
        <strong>Note:</strong> there is no “pending listings” endpoint. The table below shows{' '}
        <strong>active</strong> listings only. To act on a listing awaiting review, paste its id
        and choose an action.
      </Alert>

      {error && <Alert variant="info">{error}</Alert>}
      {notice && (
        <Alert variant="success" onClose={() => setNotice(null)} dismissible>
          {notice}
        </Alert>
      )}

      {/* Act on a specific listing by id */}
      <Can permission="listing:approve">
        <div className="ah-card p-3 mb-4">
          <Row className="g-2 align-items-end">
            <Col md={8}>
              <Form.Label className="ah-muted">Listing id</Form.Label>
              <InputGroup>
                <Form.Control
                  placeholder="Paste a listing id (UUID)…"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                />
                <Button
                  variant="outline-success"
                  disabled={!manualId.trim()}
                  onClick={() => setApproveTarget({ id: manualId.trim(), title: manualId.trim() })}
                >
                  <FaCheck className="me-1" /> Approve
                </Button>
                <Button
                  variant="outline-danger"
                  disabled={!manualId.trim()}
                  onClick={() => {
                    setReason('');
                    setRejectTarget({ id: manualId.trim(), title: manualId.trim() });
                  }}
                >
                  <FaTimes className="me-1" /> Reject
                </Button>
              </InputGroup>
            </Col>
          </Row>
        </div>
      </Can>

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyMessage="No active listings."
      />

      {/* Approve */}
      <ConfirmModal
        show={!!approveTarget}
        title="Approve listing"
        body={approveTarget ? `Approve listing “${approveTarget.title}”?` : ''}
        confirmLabel="Approve"
        variant="success"
        busy={busy}
        onConfirm={doApprove}
        onCancel={() => setApproveTarget(null)}
      />

      {/* Reject with reason */}
      <Modal show={!!rejectTarget} onHide={() => setRejectTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject listing</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="ah-muted">
            Reject listing <strong>{rejectTarget?.title}</strong>.
          </p>
          <Form.Group>
            <Form.Label>Reason (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this listing being rejected?"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setRejectTarget(null)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={doReject} disabled={busy}>
            {busy ? 'Working…' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

function shortId(id) {
  const s = String(id ?? '');
  return s.length > 10 ? `${s.slice(0, 8)}…` : s || '—';
}

function num(v) {
  if (v == null) return '';
  const n = Number(v);
  return Number.isNaN(n) ? String(v) : n.toLocaleString();
}

function fmt(v) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
}
