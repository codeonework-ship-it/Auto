import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Alert } from 'react-bootstrap';
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import travelApi from '../api/travel';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = {
  title: '',
  destination: '',
  durationDays: '',
  priceAmount: '',
  currency: 'INR',
  description: '',
};

export default function TourGuide() {
  const { isAuthenticated } = useAuth();
  const [tours, setTours] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    load(() => active);
    return () => {
      active = false;
    };
  }, []);

  function load(isActive = () => true) {
    return travelApi
      .listTours()
      .then((data) => isActive() && setTours(Array.isArray(data) ? data : []))
      .catch(() => isActive() && setTours([]));
  }

  function field(name) {
    return (e) => setForm((f) => ({ ...f, [name]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await travelApi.createTour({
        title: form.title,
        destination: form.destination,
        durationDays: form.durationDays ? Number(form.durationDays) : null,
        priceAmount: form.priceAmount ? Number(form.priceAmount) : null,
        currency: form.currency,
        descriptionHtml: form.description ? `<p>${form.description.trim()}</p>` : '',
      });
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err?.message || 'Failed to create tour.');
    } finally {
      setSaving(false);
    }
  }

  if (tours === null) return <Loader label="Loading tours…" />;

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-0">Tour Guides</h2>
      <p className="ah-muted">Guided road trips and tours offered by the community.</p>

      {isAuthenticated && (
        <Card className="ah-card border-0 mb-4">
          <Card.Body>
            <h5 className="fw-bold">Offer a tour</h5>
            {error && <Alert variant="danger" className="small">{error}</Alert>}
            <Form onSubmit={submit}>
              <Row className="g-2">
                <Col md={6}>
                  <Form.Label className="small mb-1">Title</Form.Label>
                  <Form.Control value={form.title} onChange={field('title')}
                    placeholder="Himalayan motorcycle expedition" required />
                </Col>
                <Col md={6}>
                  <Form.Label className="small mb-1">Destination</Form.Label>
                  <Form.Control value={form.destination} onChange={field('destination')}
                    placeholder="Ladakh, India" />
                </Col>
                <Col md={4}>
                  <Form.Label className="small mb-1">Duration (days)</Form.Label>
                  <Form.Control type="number" min={1} value={form.durationDays}
                    onChange={field('durationDays')} placeholder="7" />
                </Col>
                <Col md={4}>
                  <Form.Label className="small mb-1">Price</Form.Label>
                  <Form.Control type="number" min={0} step="0.01" value={form.priceAmount}
                    onChange={field('priceAmount')} placeholder="45000" />
                </Col>
                <Col md={4}>
                  <Form.Label className="small mb-1">Currency</Form.Label>
                  <Form.Control value={form.currency} onChange={field('currency')}
                    maxLength={3} placeholder="INR" />
                </Col>
                <Col xs={12}>
                  <Form.Label className="small mb-1">Description</Form.Label>
                  <Form.Control as="textarea" rows={3} value={form.description}
                    onChange={field('description')} placeholder="What's included, itinerary, difficulty…" />
                </Col>
              </Row>
              <Button type="submit" variant="primary" className="mt-3" disabled={saving}>
                {saving ? 'Saving…' : 'Offer tour'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {tours.length === 0 ? (
        <EmptyState title="No tours listed yet" message="Check back soon." />
      ) : (
        <Row className="g-4">
          {tours.map((t) => (
            <Col md={6} lg={4} key={t.id}>
              <Card className="ah-card h-100 border-0">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fs-6 fw-bold">{t.title}</Card.Title>
                  {t.destination && (
                    <div className="ah-muted small mb-1">
                      <FaMapMarkerAlt /> {t.destination}
                    </div>
                  )}
                  {t.durationDays != null && (
                    <div className="ah-muted small mb-2">
                      <FaClock /> {t.durationDays} day(s)
                    </div>
                  )}
                  <div className="mt-auto">
                    {t.priceAmount != null && (
                      <Badge bg="success" className="fs-6">
                        {t.currency ? `${t.currency} ` : ''}{Number(t.priceAmount).toLocaleString()}
                      </Badge>
                    )}
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
