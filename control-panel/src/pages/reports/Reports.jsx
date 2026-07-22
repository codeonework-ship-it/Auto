import { Row, Col } from 'react-bootstrap';
import { FaFlag, FaCarSide, FaStore, FaComments } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';

// Reports dashboard — aggregate content-abuse reports by target type.
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

const SUMMARY = [
  { label: 'Post Reports', value: 19, icon: FaCarSide, color: '#1f6feb' },
  { label: 'Listing Reports', value: 7, icon: FaStore, color: '#f59e0b' },
  { label: 'Comment Reports', value: 24, icon: FaComments, color: '#0891b2' },
  { label: 'Total Open', value: 50, icon: FaFlag, color: '#dc2626' },
];

const REPORTS = [
  { id: 1, target: 'Post #5521', reason: 'Spam', count: 4, status: 'pending' },
  { id: 2, target: 'Comment #9931', reason: 'Harassment', count: 6, status: 'pending' },
  { id: 3, target: 'Listing #851', reason: 'Fraud', count: 3, status: 'review' },
  { id: 4, target: 'Post #5488', reason: 'Offensive', count: 2, status: 'resolved' },
];

export default function Reports() {
  const columns = [
    { key: 'target', header: 'Target', sortable: true },
    { key: 'reason', header: 'Reason', sortable: true },
    { key: 'count', header: 'Reports', sortable: true },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div>
      <PageHeader title="Reports" subtitle="Content abuse reports across the platform." />
      <Row className="g-3 mb-4">
        {SUMMARY.map((s) => (
          <Col key={s.label} xs={12} sm={6} lg={3}>
            <StatCard {...s} />
          </Col>
        ))}
      </Row>
      <DataTable columns={columns} data={REPORTS} pageSize={10} />
    </div>
  );
}
