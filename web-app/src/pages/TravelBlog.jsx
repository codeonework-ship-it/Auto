import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import travelApi from '../api/travel';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

export default function TravelBlog() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState(null);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [body, setBody] = useState('');
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
      .listPosts()
      .then((data) => isActive() && setPosts(Array.isArray(data) ? data : []))
      .catch(() => isActive() && setPosts([]));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      // Body is a plain textarea; wrap paragraphs so the server-side sanitizer keeps structure.
      const bodyHtml = body
        .split(/\n{2,}/)
        .map((p) => `<p>${p.trim()}</p>`)
        .join('');
      const created = await travelApi.createPost({ title, location, bodyHtml });
      await travelApi.publishPost(created.id);
      setTitle('');
      setLocation('');
      setBody('');
      await load();
    } catch (err) {
      setError(err?.message || 'Failed to publish travel post.');
    } finally {
      setSaving(false);
    }
  }

  if (posts === null) return <Loader label="Loading travel posts…" />;

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-0">Travel Blog</h2>
      <p className="ah-muted">Road trips, routes, and ride reports from the community.</p>

      {isAuthenticated && (
        <Card className="ah-card border-0 mb-4">
          <Card.Body>
            <h5 className="fw-bold">Write a travel post</h5>
            {error && <Alert variant="danger" className="small">{error}</Alert>}
            <Form onSubmit={submit}>
              <Form.Group className="mb-2">
                <Form.Label className="small mb-1">Title</Form.Label>
                <Form.Control
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Riding the Leh–Manali highway"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="small mb-1">Location</Form.Label>
                <Form.Control
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ladakh, India"
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="small mb-1">Your story</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Share the route, stops, and tips…"
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Publishing…' : 'Publish post'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}

      {posts.length === 0 ? (
        <EmptyState title="No travel posts yet" message="Check back soon for road-trip stories." />
      ) : (
        <Row className="g-4">
          {posts.map((p) => (
            <Col md={6} key={p.id}>
              <Card className="ah-card h-100 border-0">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fs-6 fw-bold">{p.title}</Card.Title>
                  {p.location && <div className="ah-muted small mb-2">📍 {p.location}</div>}
                  <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="ah-muted small">
                      {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : ''}
                    </span>
                    <Link to={`/travel/${p.slug}`} className="fw-semibold small">Read →</Link>
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
