import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import RoleBadge from '../components/common/RoleBadge';
import EmptyState from '../components/common/EmptyState';

// Authenticated user's profile (protected route).
export default function Profile() {
  const { user, roles, logout } = useAuth();

  return (
    <Container className="py-4">
      <Row className="g-4">
        <Col lg={4}>
          <Card className="ah-card border-0 text-center">
            <Card.Body>
              <img
                src={user?.avatar || 'https://placehold.co/160x160?text=You'}
                alt={user?.displayName || 'You'}
                width={96}
                height={96}
                className="rounded-circle mb-3"
                style={{ objectFit: 'cover' }}
              />
              <h5 className="fw-bold mb-0">{user?.displayName || user?.username || 'Member'}</h5>
              <p className="ah-muted small">{user?.email}</p>
              <div className="d-flex flex-wrap gap-1 justify-content-center mb-3">
                {roles.length > 0 ? (
                  roles.map((r) => <RoleBadge key={r} role={r} />)
                ) : (
                  <RoleBadge role="MEMBER" />
                )}
              </div>
              <Button variant="outline-secondary" size="sm" onClick={logout}>
                Log out
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="ah-card border-0">
            <Card.Body>
              <h5 className="fw-bold">Your posts</h5>
              <EmptyState
                title="No posts yet"
                message="Posts you create will appear here."
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
