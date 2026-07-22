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
import usersApi from '../api/users';
import postsApi from '../api/posts';
import kycApi from '../api/kyc';
import moderationApi from '../api/moderation';

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

const len = (data) => (Array.isArray(data) ? data.length : data?.items?.length ?? 0);

export default function Dashboard() {
  // Each KPI is fetched independently and falls back to '—' on error.
  const [kpis, setKpis] = useState({
    users: '—',
    posts: '—',
    listings: '—',
    kyc: '—',
    reports: '—',
  });

  useEffect(() => {
    let alive = true;
    const set = (key, value) => alive && setKpis((k) => ({ ...k, [key]: value }));

    usersApi.list().then((d) => set('users', len(d))).catch(() => set('users', '—'));
    postsApi.list().then((d) => set('posts', len(d))).catch(() => set('posts', '—'));
    postsApi.listListings().then((d) => set('listings', len(d))).catch(() => set('listings', '—'));
    kycApi.list({ status: 'SUBMITTED' }).then((d) => set('kyc', len(d))).catch(() => set('kyc', '—'));
    moderationApi
      .listReports({ status: 'OPEN' })
      .then((d) => set('reports', len(d)))
      .catch(() => set('reports', '—'));

    return () => {
      alive = false;
    };
  }, []);

  const cards = [
    { label: 'Total Users', value: kpis.users, icon: FaUsers, color: '#1f6feb' },
    { label: 'Active Posts', value: kpis.posts, icon: FaCarSide, color: '#16a34a' },
    { label: 'Active Listings', value: kpis.listings, icon: FaStore, color: '#f59e0b' },
    { label: 'Pending KYC', value: kpis.kyc, icon: FaIdCard, color: '#0891b2' },
    { label: 'Open Reports', value: kpis.reports, icon: FaFlag, color: '#dc2626' },
    { label: 'MoM Growth', value: '—', icon: FaChartLine, color: '#7c3aed' },
  ];

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
        {cards.map((k) => (
          <Col key={k.label} xs={12} sm={6} lg={4} xxl={2}>
            <Kpi {...k} />
          </Col>
        ))}
      </Row>

      <h2 className="h6 mb-3">Recent Activity</h2>
      <DataTable
        columns={columns}
        data={[]}
        pageSize={5}
        searchable={false}
        emptyMessage="Activity feed pending (audit API not yet wired)."
      />
    </div>
  );
}
