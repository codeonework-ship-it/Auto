import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form, Alert } from 'react-bootstrap';
import marketplaceApi from '../api/marketplace';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';

const STATUS_VARIANT = {
  ACTIVE: 'success',
  PENDING_REVIEW: 'warning',
  DRAFT: 'secondary',
  SOLD: 'dark',
  REJECTED: 'danger',
  CLOSED: 'secondary',
};

// Marketplace listing detail with a make-an-offer action (auth required).
export default function ListingDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [offer, setOffer] = useState({ amount: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [offerError, setOfferError] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let active = true;
    marketplaceApi
      .get(id)
      .then((data) => active && setListing(data))
      .catch((err) => active && setLoadError(err?.message || 'Listing not found.'));
    return () => {
      active = false;
    };
  }, [id]);

  const onChange = (e) => setOffer((o) => ({ ...o, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setOfferError(null);
    setNotice(null);
    try {
      await marketplaceApi.makeOffer(id, {
        amount: offer.amount ? Number(offer.amount) : undefined,
        message: offer.message,
      });
      setOffer({ amount: '', message: '' });
      setNotice('Your offer has been sent to the seller.');
    } catch (err) {
      setOfferError(err?.message || 'Could not submit your offer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <Container className="py-4">
        <Link to="/marketplace" className="small">← Back to marketplace</Link>
        <Alert variant="danger" className="mt-3">{loadError}</Alert>
      </Container>
    );
  }

  if (!listing) return <Loader label="Loading listing…" />;

  return (
    <Container className="py-4">
      <Link to="/marketplace" className="small">← Back to marketplace</Link>
      <Row className="mt-2 g-4">
        <Col lg={8}>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <h1 className="fw-bold">{listing.title}</h1>
            <Badge bg={STATUS_VARIANT[listing.status] || 'secondary'}>{listing.status}</Badge>
          </div>
          <div className="fs-4 fw-bold text-warning mb-3">
            {listing.currency} {listing.priceAmount != null ? Number(listing.priceAmount).toLocaleString() : '—'}
          </div>
          {listing.descriptionHtml ? (
            <div dangerouslySetInnerHTML={{ __html: listing.descriptionHtml }} />
          ) : (
            <p className="ah-muted">No description provided.</p>
          )}
        </Col>

        <Col lg={4}>
          <Card className="ah-card border-0">
            <Card.Body>
              <h6 className="fw-bold">Make an offer</h6>
              {isAuthenticated ? (
                <>
                  {offerError && <Alert variant="danger" className="py-2">{offerError}</Alert>}
                  {notice && <Alert variant="success" className="py-2">{notice}</Alert>}
                  <Form onSubmit={onSubmit}>
                    <Form.Group className="mb-2">
                      <Form.Label>Amount ({listing.currency || 'USD'})</Form.Label>
                      <Form.Control
                        name="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={offer.amount}
                        onChange={onChange}
                        required
                        placeholder="0.00"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Message</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="message"
                        value={offer.message}
                        onChange={onChange}
                        placeholder="Optional message to the seller"
                      />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
                      {submitting ? 'Sending…' : 'Send offer'}
                    </Button>
                  </Form>
                </>
              ) : (
                <Alert variant="info" className="small mb-0">
                  <Link to="/login">Log in</Link> to make an offer.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
