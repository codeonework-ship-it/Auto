import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import travelApi from '../api/travel';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const PLACEHOLDER_GUIDES = [
  {
    id: 301,
    name: 'Tenzin D.',
    region: 'Ladakh',
    rating: 4.9,
    trips: 120,
    tags: ['High-altitude', 'Motorcycle tours'],
    avatar: 'https://placehold.co/160x160?text=Guide',
  },
  {
    id: 302,
    name: 'Priya N.',
    region: 'Western Ghats',
    rating: 4.7,
    trips: 84,
    tags: ['Weekend drives', 'Waterfalls'],
    avatar: 'https://placehold.co/160x160?text=Guide',
  },
];

export default function TourGuide() {
  const [guides, setGuides] = useState(null);

  useEffect(() => {
    let active = true;
    travelApi
      .listGuides()
      .then((data) => active && setGuides(Array.isArray(data) ? data : data?.items || []))
      .catch(() => active && setGuides(PLACEHOLDER_GUIDES));
    return () => {
      active = false;
    };
  }, []);

  if (guides === null) return <Loader label="Loading tour guides…" />;

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-0">Tour Guides</h2>
      <p className="ah-muted">Connect with experienced guides for your next road trip.</p>

      {guides.length === 0 ? (
        <EmptyState title="No guides listed yet" message="Check back soon." />
      ) : (
        <Row className="g-4">
          {guides.map((g) => (
            <Col md={6} lg={4} key={g.id}>
              <Card className="ah-card h-100 border-0">
                <Card.Body className="d-flex gap-3">
                  <img
                    src={g.avatar}
                    alt={g.name}
                    width={72}
                    height={72}
                    className="rounded-circle"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between">
                      <h6 className="fw-bold mb-0">{g.name}</h6>
                      <span className="small text-warning">
                        <FaStar /> {g.rating}
                      </span>
                    </div>
                    <div className="ah-muted small mb-2">
                      <FaMapMarkerAlt /> {g.region} · {g.trips} trips
                    </div>
                    <div className="d-flex flex-wrap gap-1 mb-2">
                      {(g.tags || []).map((t) => (
                        <Badge bg="secondary" key={t}>{t}</Badge>
                      ))}
                    </div>
                    <Button variant="outline-primary" size="sm">View profile</Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
