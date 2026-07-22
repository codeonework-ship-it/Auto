import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form } from 'react-bootstrap';
import postsApi from '../api/posts';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

// Placeholder data used until the backend feed endpoint is live.
const PLACEHOLDER_POSTS = [
  {
    id: 1,
    title: '2023 Ducati Panigale V4 — first 1,000 km review',
    category: 'BIKE',
    author: 'rider_max',
    cover: 'https://placehold.co/640x480?text=Panigale+V4',
    excerpt: 'Track-focused but surprisingly usable on the street. Here are my impressions…',
    reviews: 12,
  },
  {
    id: 2,
    title: 'Long-term with the Mahindra Thar — 20,000 km update',
    category: 'CAR',
    author: 'offroad_ann',
    cover: 'https://placehold.co/640x480?text=Thar',
    excerpt: 'Reliability, mileage, and what breaks after two monsoons of abuse.',
    reviews: 8,
  },
];

export default function CarBikeFeed() {
  const [posts, setPosts] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    let active = true;
    postsApi
      .list()
      .then((data) => active && setPosts(Array.isArray(data) ? data : data?.items || []))
      .catch(() => active && setPosts(PLACEHOLDER_POSTS)); // fall back to placeholders
    return () => {
      active = false;
    };
  }, []);

  if (posts === null) return <Loader label="Loading posts…" />;

  const visible =
    filter === 'ALL' ? posts : posts.filter((p) => p.category === filter);

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-0">Cars &amp; Bikes</h2>
          <p className="ah-muted mb-0">Community posts, reviews, and ownership stories.</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Form.Select
            size="sm"
            style={{ width: 140 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="CAR">Cars</option>
            <option value="BIKE">Bikes</option>
          </Form.Select>
          <Button as={Link} to="/create-post" variant="primary" size="sm">
            + New Post
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No posts yet"
          message="Be the first to share your ride."
          action={
            <Button as={Link} to="/create-post" variant="primary">
              Create a post
            </Button>
          }
        />
      ) : (
        <Row className="g-4">
          {visible.map((post) => (
            <Col md={6} lg={4} key={post.id}>
              <Card className="ah-card h-100 border-0 overflow-hidden">
                <Card.Img variant="top" src={post.cover} alt={post.title} />
                <Card.Body className="d-flex flex-column">
                  <div className="mb-2">
                    <Badge bg={post.category === 'BIKE' ? 'warning' : 'info'}>
                      {post.category}
                    </Badge>
                  </div>
                  <Card.Title className="fs-6 fw-bold">{post.title}</Card.Title>
                  <Card.Text className="ah-muted small flex-grow-1">{post.excerpt}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="ah-muted small">by {post.author}</span>
                    <Link to={`/posts/${post.id}`} className="fw-semibold small">
                      Read →
                    </Link>
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
