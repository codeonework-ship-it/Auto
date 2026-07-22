import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { FaUsers } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Community groups landing (placeholder data).
const GROUPS = [
  { id: 401, name: 'JDM Enthusiasts', members: 2340, tag: 'Cars' },
  { id: 402, name: 'Adventure Riders', members: 1875, tag: 'Bikes' },
  { id: 403, name: 'Classic & Vintage', members: 940, tag: 'Cars' },
  { id: 404, name: 'EV Owners India', members: 3120, tag: 'EV' },
];

export default function Community() {
  const { isAuthenticated } = useAuth();

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-0">Community</h2>
          <p className="ah-muted mb-0">Join groups and connect with fellow enthusiasts.</p>
        </div>
      </div>

      <Row className="g-4">
        {GROUPS.map((grp) => (
          <Col md={6} lg={3} key={grp.id}>
            <Card className="ah-card h-100 border-0 text-center">
              <Card.Body>
                <div className="ah-pillar-icon mx-auto mb-3">
                  <FaUsers />
                </div>
                <Card.Title className="fs-6 fw-bold">{grp.name}</Card.Title>
                <Badge bg="secondary" className="mb-2">{grp.tag}</Badge>
                <div className="ah-muted small mb-3">
                  {grp.members.toLocaleString()} members
                </div>
                <Button variant="outline-primary" size="sm" disabled={!isAuthenticated}>
                  {isAuthenticated ? 'Join group' : 'Log in to join'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
