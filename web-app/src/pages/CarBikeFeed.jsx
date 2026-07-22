import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form } from 'react-bootstrap';
import postsApi from '../api/posts';
import { mediaUrl } from '../api/client';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const PLACEHOLDER_IMG = 'https://placehold.co/640x480?text=AutoHub';

export default function CarBikeFeed() {
  const [posts, setPosts] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    let active = true;
    postsApi
      .list()
      .then((data) => active && setPosts(Array.isArray(data) ? data : []))
      .catch(() => active && setPosts([]));
    return () => {
      active = false;
    };
  }, []);

  if (posts === null) return <Loader label="Loading posts…" />;

  const visible = filter === 'ALL' ? posts : posts.filter((p) => p.kind === filter);

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
                <Card.Img
                  variant="top"
                  src={post.coverUrl ? mediaUrl(post.coverUrl) : PLACEHOLDER_IMG}
                  alt={post.title}
                  style={{ aspectRatio: '4 / 3', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <div className="mb-2">
                    <Badge bg={post.kind === 'BIKE' ? 'warning' : 'info'}>{post.kind}</Badge>
                  </div>
                  <Card.Title className="fs-6 fw-bold flex-grow-1">{post.title}</Card.Title>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="ah-muted small">{post.imageCount} photo(s)</span>
                    <Link to={`/posts/${post.slug}`} className="fw-semibold small">
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
