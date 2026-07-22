import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import marketplaceApi from '../api/marketplace';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';

// Marketplace listing detail with a contact-seller action (auth required).
export default function ListingDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);

  useEffect(() => {
    let active = true;
    marketplaceApi
      .getListing(id)
      .then((data) => active && setListing(data))
      .catch(
        () =>
          active &&
          setListing({
            id,
            title: 'Sample listing',
            price: 500000,
            currency: 'INR',
            location: 'Mumbai',
            kycVerified: true,
            description: 'Placeholder listing. Connect the backend to load real data.',
            images: ['https://placehold.co/1280x720?text=Listing'],
            seller: { name: 'demo_seller', kycVerified: true },
          }),
      );
    return () => {
      active = false;
    };
  }, [id]);

  if (!listing) return <Loader label="Loading listing…" />;

  return (
    <Container className="py-4">
      <Link to="/marketplace" className="small">← Back to marketplace</Link>
      <Row className="mt-2 g-4">
        <Col lg={8}>
          <h1 className="fw-bold">{listing.title}</h1>
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="fs-4 fw-bold text-warning">
              {listing.currency} {Number(listing.price).toLocaleString()}
            </span>
            {listing.kycVerified && <Badge bg="success">KYC verified</Badge>}
          </div>
          {(listing.images || []).map((src, i) => (
            <img key={i} src={src} alt={`${listing.title} ${i + 1}`} className="img-fluid rounded mb-3" />
          ))}
          <p>{listing.description}</p>
        </Col>

        <Col lg={4}>
          <Card className="ah-card border-0">
            <Card.Body>
              <h6 className="fw-bold">Seller</h6>
              <p className="mb-1">{listing.seller?.name || 'Unknown'}</p>
              <p className="ah-muted small">{listing.location}</p>
              {isAuthenticated ? (
                <Button variant="primary" className="w-100">
                  Contact seller
                </Button>
              ) : (
                <Alert variant="info" className="small mb-0">
                  <Link to="/login">Log in</Link> to contact the seller.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
