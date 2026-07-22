import { useEffect, useMemo, useState, useCallback } from 'react';
import { Row, Col, Button, Form, Alert } from 'react-bootstrap';
import { FaFlag, FaCarSide, FaStore, FaComments } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmModal from '../../components/common/ConfirmModal';
import Can from '../../components/Can';
import moderationApi from '../../api/moderation';

const REPORT_STATES = ['OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED'];

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="ah-card ah-kpi d-flex align-items-center justify-content-between">
      <div>
        <div className="ah-kpi__label">{label}</div>
        <div className="ah-kpi__value">{value}</div>
      </div>
      <span className="ah-kpi__icon" style={{ background: color }}>
        <Icon />
      </span>
    </div>
  );
}

// Reports queue — triage abuse reports and (for comment/review subjects) hide the content.
export default function Reports() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('OPEN');

  const [triage, setTriage] = useState(null); // { row, status }
  const [hideTarget, setHideTarget] = useState(null); // { row }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = status ? { status } : {};
      const data = await moderationApi.listReports(params);
      setRows(Array.isArray(data) ? data : data?.items ?? []);
    } catch (e) {
      setError(e.normalizedMessage || 'Could not load reports.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => {
    const count = (t) =>
      rows.filter((r) => String(r.subjectType).toUpperCase() === t).length;
    return [
      { label: 'Post Reports', value: count('POST'), icon: FaCarSide, color: '#1f6feb' },
      { label: 'Listing Reports', value: count('LISTING'), icon: FaStore, color: '#f59e0b' },
      { label: 'Comment Reports', value: count('COMMENT'), icon: FaComments, color: '#0891b2' },
      { label: `Total (${status || 'all'})`, value: rows.length, icon: FaFlag, color: '#dc2626' },
    ];
  }, [rows, status]);

  const runTriage = async () => {
    setBusy(true);
    try {
      await moderationApi.setReportStatus(triage.row.id, triage.status);
      setTriage(null);
      await load();
    } catch (e) {
      setError(e.normalizedMessage || 'Triage failed.');
      setTriage(null);
    } finally {
      setBusy(false);
    }
  };

  const runHide = async () => {
    setBusy(true);
    const { row } = hideTarget;
    const type = String(row.subjectType).toUpperCase();
    try {
      if (type === 'COMMENT') await moderationApi.setCommentStatus(row.subjectId, 'HIDDEN');
      else if (type === 'REVIEW') await moderationApi.setReviewStatus(row.subjectId, 'HIDDEN');
      // After hiding, resolve the report.
      await moderationApi.setReportStatus(row.id, 'RESOLVED');
      setHideTarget(null);
      await load();
    } catch (e) {
      setError(e.normalizedMessage || 'Hide failed.');
      setHideTarget(null);
    } finally {
      setBusy(false);
    }
  };

  const columns = [
    { key: 'subjectType', header: 'Type', sortable: true },
    { key: 'subjectId', header: 'Subject', render: (r) => shortId(r.subjectId) },
    { key: 'details', header: 'Details', render: (r) => r.details || '—' },
    { key: 'reporterId', header: 'Reporter', render: (r) => shortId(r.reporterId) },
    { key: 'createdAt', header: 'Reported', sortable: true, render: (r) => fmt(r.createdAt) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: '__actions',
      header: 'Actions',
      render: (r) => {
        const type = String(r.subjectType).toUpperCase();
        const canHide = type === 'COMMENT' || type === 'REVIEW';
        return (
          <div className="d-flex gap-2 flex-wrap">
            <Can permission="report:review">
              <Button
                size="sm"
                variant="outline-warning"
                title="Mark reviewing"
                onClick={() => setTriage({ row: r, status: 'REVIEWING' })}
              >
                Review
              </Button>
              <Button
                size="sm"
                variant="outline-success"
                title="Resolve"
                onClick={() => setTriage({ row: r, status: 'RESOLVED' })}
              >
                Resolve
              </Button>
              <Button
                size="sm"
                variant="light"
                title="Dismiss"
                onClick={() => setTriage({ row: r, status: 'DISMISSED' })}
              >
                Dismiss
              </Button>
            </Can>
            {canHide && (
              <Can permission="comment:moderate">
                <Button
                  size="sm"
                  variant="outline-danger"
                  title="Hide reported content"
                  onClick={() => setHideTarget({ row: r })}
                >
                  Hide
                </Button>
              </Can>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Content abuse reports across the platform."
        actions={
          <Form.Select
            size="sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: 170 }}
          >
            <option value="">All statuses</option>
            {REPORT_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Form.Select>
        }
      />

      <Row className="g-3 mb-4">
        {summary.map((s) => (
          <Col key={s.label} xs={12} sm={6} lg={3}>
            <StatCard {...s} />
          </Col>
        ))}
      </Row>

      {error && <Alert variant="info">{error}</Alert>}
      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        pageSize={10}
        emptyMessage="No reports for this status."
      />

      <ConfirmModal
        show={!!triage}
        title="Update report"
        body={triage ? `Set report status to ${triage.status}?` : ''}
        confirmLabel="Confirm"
        variant={triage?.status === 'DISMISSED' ? 'secondary' : 'primary'}
        busy={busy}
        onConfirm={runTriage}
        onCancel={() => setTriage(null)}
      />

      <ConfirmModal
        show={!!hideTarget}
        title="Hide content"
        body={
          hideTarget
            ? `Hide the reported ${String(hideTarget.row.subjectType).toLowerCase()} and resolve this report?`
            : ''
        }
        confirmLabel="Hide"
        variant="danger"
        busy={busy}
        onConfirm={runHide}
        onCancel={() => setHideTarget(null)}
      />
    </div>
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
