import { useEffect, useState, useCallback } from 'react';
import { Button, Form, Modal, Alert } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import Can from '../../components/Can';
import kycApi from '../../api/kyc';

const STATUSES = ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DRAFT'];
const ACTIONABLE = new Set(['SUBMITTED', 'UNDER_REVIEW']);

// KYC review queue for marketplace buyers/sellers.
export default function KycReview() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('SUBMITTED');

  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [notes, setNotes] = useState('');
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = status ? { status } : {};
      const data = await kycApi.list(params);
      setRows(Array.isArray(data) ? data : data?.items ?? []);
    } catch (e) {
      setError(e.normalizedMessage || 'Could not load KYC submissions.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const doApprove = async () => {
    setBusy(true);
    try {
      await kycApi.approve(approveTarget.id);
      setApproveTarget(null);
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
    try {
      await kycApi.reject(rejectTarget.id, notes);
      setRejectTarget(null);
      setNotes('');
      await load();
    } catch (e) {
      setError(e.normalizedMessage || 'Reject failed.');
      setRejectTarget(null);
    } finally {
      setBusy(false);
    }
  };

  const openDetail = async (row) => {
    setDetail(row); // show what we have immediately
    try {
      const full = await kycApi.get(row.id);
      if (full) setDetail(full);
    } catch {
      /* keep the summary row */
    }
  };

  const columns = [
    { key: 'kycType', header: 'Type', sortable: true },
    { key: 'legalName', header: 'Legal Name', sortable: true },
    { key: 'documentType', header: 'Document' },
    { key: 'userId', header: 'User', render: (r) => shortId(r.userId) },
    { key: 'submittedAt', header: 'Submitted', sortable: true, render: (r) => fmt(r.submittedAt) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: '__actions',
      header: 'Actions',
      render: (r) => (
        <div className="d-flex gap-2">
          <Button size="sm" variant="light" title="View" onClick={() => openDetail(r)}>
            <FaEye />
          </Button>
          {ACTIONABLE.has(String(r.status).toUpperCase()) && (
            <Can permission="kyc:review">
              <Button
                size="sm"
                variant="outline-success"
                title="Approve"
                onClick={() => setApproveTarget(r)}
              >
                <FaCheck />
              </Button>
              <Button
                size="sm"
                variant="outline-danger"
                title="Reject"
                onClick={() => {
                  setNotes('');
                  setRejectTarget(r);
                }}
              >
                <FaTimes />
              </Button>
            </Can>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="KYC Review"
        subtitle="Verify buyer/seller identity submissions."
        actions={
          <Form.Select
            size="sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: 180 }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Form.Select>
        }
      />
      {error && <Alert variant="info">{error}</Alert>}
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        emptyMessage="No submissions for this status."
      />

      {/* Approve */}
      <ConfirmModal
        show={!!approveTarget}
        title="Approve KYC"
        body={approveTarget ? `Approve submission for ${approveTarget.legalName}?` : ''}
        confirmLabel="Approve"
        variant="success"
        busy={busy}
        onConfirm={doApprove}
        onCancel={() => setApproveTarget(null)}
      />

      {/* Reject with notes */}
      <Modal show={!!rejectTarget} onHide={() => setRejectTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject KYC</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="ah-muted">
            Reject submission for <strong>{rejectTarget?.legalName}</strong>.
          </p>
          <Form.Group>
            <Form.Label>Reviewer notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason shared with the applicant…"
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

      {/* Detail */}
      <Modal show={!!detail} onHide={() => setDetail(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>KYC Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detail && (
            <dl className="row mb-0">
              <Field label="Type" value={detail.kycType} />
              <Field label="Status" value={detail.status} />
              <Field label="Legal Name" value={detail.legalName} />
              <Field label="Document" value={`${detail.documentType || '—'} ${detail.documentNumber || ''}`} />
              <Field label="Phone" value={detail.phone} />
              <Field label="Address" value={detail.addressLine} />
              <Field label="City" value={detail.city} />
              <Field label="Country" value={detail.country} />
              <Field label="User" value={detail.userId} />
              <Field label="Submitted" value={fmt(detail.submittedAt)} />
              {detail.reviewNotes && <Field label="Review Notes" value={detail.reviewNotes} />}
            </dl>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setDetail(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <>
      <dt className="col-sm-4 ah-muted">{label}</dt>
      <dd className="col-sm-8">{value || '—'}</dd>
    </>
  );
}

function shortId(id) {
  const s = String(id ?? '');
  return s.length > 10 ? `${s.slice(0, 8)}…` : s || '—';
}

function fmt(v) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString();
}
