import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';

// Immutable audit trail of admin actions (adminops context).
const LOGS = [
  { id: 1, actor: 'admin@autohub.dev', action: 'user.suspend', target: 'cara@autohub.dev', result: 'success', at: '2026-07-22 09:14' },
  { id: 2, actor: 'moderator@autohub.dev', action: 'post.takedown', target: 'Post #5521', result: 'success', at: '2026-07-22 08:51' },
  { id: 3, actor: 'admin@autohub.dev', action: 'master.update', target: 'Fuel Types', result: 'success', at: '2026-07-22 08:20' },
  { id: 4, actor: 'system', action: 'kyc.received', target: 'Submission #102', result: 'info', at: '2026-07-21 22:07' },
  { id: 5, actor: 'admin@autohub.dev', action: 'role.assign', target: 'ben@autohub.dev → SELLER', result: 'success', at: '2026-07-21 18:33' },
];

export default function AuditLog() {
  const columns = [
    { key: 'at', header: 'Timestamp', sortable: true },
    { key: 'actor', header: 'Actor', sortable: true },
    { key: 'action', header: 'Action', sortable: true },
    { key: 'target', header: 'Target' },
    { key: 'result', header: 'Result', render: (r) => <StatusBadge status={r.result} /> },
  ];

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Chronological record of administrative actions." />
      <DataTable columns={columns} data={LOGS} pageSize={15} />
    </div>
  );
}
