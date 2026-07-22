import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import travelApi from '../api/travel';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const PLACEHOLDER_POSTS = [
  {
    id: 201,
    title: 'Riding the Leh–Manali highway: a 5-day guide',
    author: 'wander_riya',
    cover: 'https://placehold.co/640x480?text=Leh-Manali',
    excerpt: 'Passes, permits, fuel stops, and where to stay along the way.',
  },
  {
    id: 202,
    title: 'Coastal road trip: Mumbai to Goa by car',
    author: 'coastal_dev',
    cover: 'https://placehold.co/640x480?text=Mumbai-Goa',
    excerpt: 'The best detours, beaches, and seafood shacks on NH66.',
  },
];

export default function TravelBlog() {
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    let active = true;
    travelApi
      .listPosts()
      .then((data) => active && setPosts(Array.isArray(data) ? data : data?.items || []))
      .catch(() => active && setPosts(PLACEHOLDER_POSTS));
    return () => {
      active = false;
    };
  }, []);

  if (posts === null) return <Loader label="Loading travel posts…" />;

  return (
    <Container className="py-4">
      <h2 className="fw-bold mb-0">Travel Blog</h2>
      <p className="ah-muted">Road trips, routes, and ride reports from the community.</p>

      {posts.length === 0 ? (
        <EmptyState title="No travel posts yet" message="Check back soon for road-trip stories." />
      ) : (
        <Row className="g-4">
          {posts.map((p) => (
            <Col md={6} key={p.id}>
              <Card className="ah-card h-100 border-0 overflow-hidden">
                <Row className="g-0">
                  <Col xs={5}>
                    <img src={p.cover} alt={p.title} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  </Col>
                  <Col xs={7}>
                    <Card.Body>
                      <Card.Title className="fs-6 fw-bold">{p.title}</Card.Title>
                      <Card.Text className="ah-muted small">{p.excerpt}</Card.Text>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="ah-muted small">by {p.author}</span>
                        <Link to={`/travel/${p.id}`} className="fw-semibold small">Read →</Link>
                      </div>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
