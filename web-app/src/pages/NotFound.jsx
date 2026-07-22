import { Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';

// 404 fallback page.
export default function NotFound() {
  return (
    <Container className="py-5 text-center">
      <div className="display-1 fw-bold text-warning">404</div>
      <h3 className="fw-bold">Page not found</h3>
      <p className="ah-muted">The page you are looking for took a wrong turn.</p>
      <Button as={Link} to="/" variant="primary">
        Back to home
      </Button>
    </Container>
  );
}
