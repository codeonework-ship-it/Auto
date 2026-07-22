import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Form, Button, Alert } from 'react-bootstrap';
import marketplaceApi from '../api/marketplace';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

const CURRENCIES = ['USD', 'EUR', 'INR', 'GBP'];

const STATUS_VARIANT = {
  ACTIVE: 'success',
  PENDING_REVIEW: 'warning',
  DRAFT: 'secondary',
  SOLD: 'dark',
  REJECTED: 'danger',
  CLOSED: 'secondary',
};

export default function Marketplace() {
  const { isAuthenticated } = useAuth();
  const [listings, setListings] = useState(null);
  const [q, setQ] = useState('');
  const [form, setForm] = useState({ title: '', priceAmount: '', currency: 'USD', descriptionHtml: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const load = () => {
    marketplaceApi
      .list()
      .then((data) => setListings(Array.isArray(data) ? data : data?.items || []))
      .catch(() => setListings([]));
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      await marketplaceApi.create({
        title: form.title.trim(),
        priceAmount: form.priceAmount ? Number(form.priceAmount) : undefined,
        currency: form.currency,
        descriptionHtml: form.descriptionHtml,
      });
      setForm({ title: '', priceAmount: '', currency: 'USD', descriptionHtml: '' });
      setNotice('Listing submitted for review.');
      load();
    } catch (err) {
      setError(err?.message || 'Could not create the listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (listings === null) return <Loader label="Loading listings…" />;

  const visible = listings.filter((l) => (l.title || '').toLowerCase().includes(q.toLowerCase()));

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-0">Marketplace</h2>
          <p className="ah-muted mb-0">Buy &amp; sell cars and bikes.</p>
        </div>
        <Form.Control
          size="sm"
          placeholder="Search listings…"
          style={{ maxWidth: 260 }}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {isAuthenticated && (
        <Card className="ah-card border-0 mb-4">
          <Card.Body>
            <h5 className="fw-bold mb-1">Sell an item</h5>
            <p className="ah-muted small mb-3">Seller KYC (APPROVED) is required to list.</p>
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            {notice && <Alert variant="success" className="py-2">{notice}</Alert>}
            <Form onSubmit={onSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      name="title"
                      value={form.title}
                      onChange={onChange}
                      required
                      maxLength={200}
                      placeholder="e.g. 2019 Honda City VX CVT"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Price</Form.Label>
                    <Form.Control
                      name="priceAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.priceAmount}
                      onChange={onChange}
                      placeholder="0.00"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Currency</Form.Label>
                    <Form.Select name="currency" value={form.currency} onChange={onChange}>
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="descriptionHtml"
                      value={form.descriptionHtml}
                      onChange={onChange}
                      placeholder="Describe the item…"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button type="submit" variant="primary" className="mt-3" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit listing'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {visible.length === 0 ? (
        <EmptyState title="No listings found" message="Try a different search term." />
      ) : (
        <Row className="g-4">
          {visible.map((l) => (
            <Col md={6} lg={4} key={l.id}>
              <Card className="ah-card h-100 border-0">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start">
                    <Card.Title className="fs-6 fw-bold">{l.title}</Card.Title>
                    <Badge bg={STATUS_VARIANT[l.status] || 'secondary'}>{l.status}</Badge>
                  </div>
                  <div className="fw-bold text-warning mb-1">
                    {l.currency} {l.priceAmount != null ? Number(l.priceAmount).toLocaleString() : '—'}
                  </div>
                  <div className="flex-grow-1" />
                  <Button
                    as={Link}
                    to={`/marketplace/${l.id}`}
                    variant="outline-primary"
                    size="sm"
                    className="mt-2"
                  >
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
