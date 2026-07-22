import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Form, Button } from 'react-bootstrap';
import marketplaceApi from '../api/marketplace';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const PLACEHOLDER_LISTINGS = [
  {
    id: 101,
    title: '2019 Honda City VX CVT',
    price: 850000,
    currency: 'INR',
    location: 'Pune',
    kycVerified: true,
    cover: 'https://placehold.co/640x480?text=Honda+City',
  },
  {
    id: 102,
    title: '2021 KTM 390 Duke',
    price: 245000,
    currency: 'INR',
    location: 'Bengaluru',
    kycVerified: false,
    cover: 'https://placehold.co/640x480?text=390+Duke',
  },
];

export default function Marketplace() {
  const [listings, setListings] = useState(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    let active = true;
    marketplaceApi
      .listListings()
      .then((data) => active && setListings(Array.isArray(data) ? data : data?.items || []))
      .catch(() => active && setListings(PLACEHOLDER_LISTINGS));
    return () => {
      active = false;
    };
  }, []);

  if (listings === null) return <Loader label="Loading listings…" />;

  const visible = listings.filter((l) =>
    l.title.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-0">Marketplace</h2>
          <p className="ah-muted mb-0">Buy &amp; sell cars and bikes — KYC-verified sellers.</p>
        </div>
        <Form.Control
          size="sm"
          placeholder="Search listings…"
          style={{ maxWidth: 260 }}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No listings found" message="Try a different search term." />
      ) : (
        <Row className="g-4">
          {visible.map((l) => (
            <Col md={6} lg={4} key={l.id}>
              <Card className="ah-card h-100 border-0 overflow-hidden">
                <Card.Img variant="top" src={l.cover} alt={l.title} />
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start">
                    <Card.Title className="fs-6 fw-bold">{l.title}</Card.Title>
                    {l.kycVerified && <Badge bg="success">KYC</Badge>}
                  </div>
                  <div className="fw-bold text-warning mb-1">
                    {l.currency} {Number(l.price).toLocaleString()}
                  </div>
                  <div className="ah-muted small flex-grow-1">{l.location}</div>
                  <Button as={Link} to={`/marketplace/${l.id}`} variant="outline-primary" size="sm" className="mt-2">
                    View details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
