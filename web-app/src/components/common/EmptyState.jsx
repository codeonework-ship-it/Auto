import { FaRegFolderOpen } from 'react-icons/fa';

// Friendly placeholder shown when a list/collection has no items.
export default function EmptyState({
  icon,
  title = 'Nothing here yet',
  message = 'Once there is content, it will show up here.',
  action = null,
}) {
  return (
    <div className="text-center py-5">
      <div className="ah-pillar-icon mx-auto mb-3">{icon || <FaRegFolderOpen />}</div>
      <h5 className="mb-1">{title}</h5>
      <p className="ah-muted mb-3">{message}</p>
      {action}
    </div>
  );
}
