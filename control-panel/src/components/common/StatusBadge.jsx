// Maps a status string to a colored pill. Extendable via the map below.
const VARIANT_MAP = {
  active: 'success',
  approved: 'success',
  published: 'success',
  verified: 'success',
  enabled: 'success',

  pending: 'warning',
  review: 'warning',
  in_review: 'warning',
  draft: 'warning',

  rejected: 'danger',
  suspended: 'danger',
  banned: 'danger',
  disabled: 'danger',
  takedown: 'danger',

  info: 'info',
  new: 'info',
};

export default function StatusBadge({ status, variant }) {
  const key = String(status ?? '').toLowerCase();
  const v = variant || VARIANT_MAP[key] || 'muted';
  return <span className={`ah-badge ah-badge--${v}`}>{status ?? '—'}</span>;
}
