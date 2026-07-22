import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

// 404 page.
export default function NotFound() {
  return (
    <div className="text-center py-5">
      <h1 style={{ fontSize: '4rem', fontWeight: 800 }} className="ah-muted mb-0">
        404
      </h1>
      <p className="ah-muted mb-4">The page you are looking for does not exist.</p>
      <Button as={Link} to="/">
        Back to Dashboard
      </Button>
    </div>
  );
}
