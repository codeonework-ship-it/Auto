import { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import {
  FaUsers,
  FaCarSide,
  FaStore,
  FaIdCard,
  FaFlag,
  FaChartLine,
} from 'react-icons/fa';
import PageHeader from '../components/common/PageHeader';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';

// KPI card.
function Kpi({ label, value, icon: Icon, color }) {
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

// Placeholder KPI + recent-activity data (would come from API stubs).
const KPIS = [
  { label: 'Total Users', value: '12,480', icon: FaUsers, color: '#1f6feb' },
  { label: 'Active Posts', value: '3,921', icon: FaCarSide, color: '#16a34a' },
  { label: 'Listings', value: '842', icon: FaStore, color: '#f59e0b' },
  { label: 'Pending KYC', value: '37', icon: FaIdCard, color: '#0891b2' },
  { label: 'Open Reports', value: '19', icon: FaFlag, color: '#dc2626' },
  { label: 'MoM Growth', value: '+8.4%', icon: FaChartLine, color: '#7c3aed' },
];

export default function Dashboard() {
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    // Placeholder — replace with an audit/activity API call.
    setActivity([
      { id: 1, actor: 'moderator@autohub.dev', action: 'Approved listing #842', status: 'approved', at: '2 min ago' },
      { id: 2, actor: 'admin@autohub.dev', action: 'Updated master: Fuel Types', status: 'active', at: '18 min ago' },
      { id: 3, actor: 'system', action: 'KYC submission received', status: 'pending', at: '32 min ago' },
      { id: 4, actor: 'moderator@autohub.dev', action: 'Rejected post #5521', status: 'rejected', at: '1 hr ago' },
    ]);
  }, []);

  const columns = [
    { key: 'actor', header: 'Actor', sortable: true },
    { key: 'action', header: 'Action' },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'at', header: 'When' },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Operational overview of the AutoHub platform."
      />

      <Row className="g-3 mb-4">
        {KPIS.map((k) => (
          <Col key={k.label} xs={12} sm={6} lg={4} xxl={2}>
            <Kpi {...k} />
          </Col>
        ))}
      </Row>

      <h2 className="h6 mb-3">Recent Activity</h2>
      <DataTable columns={columns} data={activity} pageSize={5} searchable={false} />
    </div>
  );
}
