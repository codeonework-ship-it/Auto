import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FaLock } from 'react-icons/fa';

// 403 page — shown when a user lacks the required role/permission.
export default function Forbidden() {
  return (
    <div className="text-center py-5">
      <FaLock size={48} className="ah-muted mb-3" />
      <h1 className="h3">403 — Access Denied</h1>
      <p className="ah-muted mb-4">
        You do not have permission to view this page.
      </p>
      <Button as={Link} to="/">
        Back to Dashboard
      </Button>
    </div>
  );
}
