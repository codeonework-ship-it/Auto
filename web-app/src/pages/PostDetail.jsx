import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Badge, Card, Button, Alert, Form } from 'react-bootstrap';
import postsApi from '../api/posts';
import reviewsApi from '../api/reviews';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';

// Post detail — shows gallery, body, reviews. Commenting requires sign-up.
export default function PostDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    let active = true;
    postsApi
      .get(id)
      .then((data) => active && setPost(data))
      .catch(
        () =>
          active &&
          setPost({
            id,
            title: 'Sample post',
            category: 'CAR',
            author: 'demo_user',
            bodyHtml: '<p>This is placeholder post content. Connect the backend to load real data.</p>',
            images: ['https://placehold.co/1280x720?text=AutoHub+Post'],
          }),
      );
    reviewsApi
      .listForPost(id)
      .then((data) => active && setReviews(Array.isArray(data) ? data : []))
      .catch(() => active && setReviews([]));
    return () => {
      active = false;
    };
  }, [id]);

  if (!post) return <Loader label="Loading post…" />;

  function submitComment(e) {
    e.preventDefault();
    // Stubbed — would call reviewsApi.addComment / addReview.
    setReviews((prev) => [
      { id: `local-${Date.now()}`, author: 'you', body: comment },
      ...prev,
    ]);
    setComment('');
  }

  return (
    <Container className="py-4">
      <Link to="/feed" className="small">← Back to feed</Link>
      <Row className="mt-2 g-4">
        <Col lg={8}>
          <Badge bg={post.category === 'BIKE' ? 'warning' : 'info'} className="mb-2">
            {post.category}
          </Badge>
          <h1 className="fw-bold">{post.title}</h1>
          <p className="ah-muted">by {post.author}</p>

          {(post.images || []).map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${post.title} ${i + 1}`}
              className="img-fluid rounded mb-3"
            />
          ))}

          {/* Body is server-sanitized HTML from the rich text editor. */}
          <div dangerouslySetInnerHTML={{ __html: post.bodyHtml || '' }} />
        </Col>

        <Col lg={4}>
          <Card className="ah-card border-0">
            <Card.Body>
              <h5 className="fw-bold">Reviews &amp; comments</h5>

              {!isAuthenticated && (
                <Alert variant="info" className="small">
                  <strong>Sign up to comment.</strong> You must be a registered member to
                  post reviews or comments.{' '}
                  <Link to="/register">Create an account</Link>.
                </Alert>
              )}

              {isAuthenticated && (
                <Form onSubmit={submitComment} className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Share your thoughts…"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                  <Button type="submit" variant="primary" size="sm" className="mt-2">
                    Post comment
                  </Button>
                </Form>
              )}

              {reviews.length === 0 ? (
                <p className="ah-muted small mb-0">No comments yet.</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {reviews.map((r) => (
                    <li key={r.id} className="border-top py-2">
                      <div className="fw-semibold small">{r.author}</div>
                      <div className="small">{r.body}</div>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
