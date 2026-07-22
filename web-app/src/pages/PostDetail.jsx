import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container, Row, Col, Badge, Card, Button, Alert, Form } from 'react-bootstrap';
import postsApi from '../api/posts';
import { mediaUrl } from '../api/client';
import engagementApi from '../api/reviews';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';

// Post detail — shows gallery, body, reviews & comments. Engaging requires sign-up.
export default function PostDetail() {
  const { id: slug } = useParams();
  const { isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewBody, setReviewBody] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [error, setError] = useState('');

  // Load the review-tag master once (public); ignore failures — tags are optional.
  useEffect(() => {
    let active = true;
    engagementApi
      .listTags()
      .then((data) => active && setTags((data || []).filter((t) => t.active)))
      .catch(() => active && setTags([]));
    return () => {
      active = false;
    };
  }, []);

  // Look up a tag's display name from its id (falls back to the id if unknown).
  const tagName = (id) => tags.find((t) => t.id === id)?.name || id;

  function toggleTag(id) {
    setSelectedTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  // Load the post by slug first, then its reviews/comments by post id.
  useEffect(() => {
    let active = true;
    postsApi
      .get(slug)
      .then((data) => {
        if (!active) return;
        setPost(data);
        loadEngagement(data.id);
      })
      .catch(() => active && setPost(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  function loadEngagement(postId) {
    engagementApi.listReviews(postId).then(setReviews).catch(() => setReviews([]));
    engagementApi.listComments(postId).then(setComments).catch(() => setComments([]));
  }

  async function submitComment(e) {
    e.preventDefault();
    setError('');
    try {
      await engagementApi.addComment(post.id, { body: comment });
      setComment('');
      const fresh = await engagementApi.listComments(post.id);
      setComments(fresh);
    } catch (err) {
      setError(err?.message || 'Failed to post comment.');
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    setError('');
    try {
      await engagementApi.addReview(post.id, {
        rating: Number(rating),
        body: reviewBody,
        tagIds: selectedTagIds,
      });
      setReviewBody('');
      setSelectedTagIds([]);
      const fresh = await engagementApi.listReviews(post.id);
      setReviews(fresh);
    } catch (err) {
      setError(err?.message || 'Failed to submit review.');
    }
  }

  if (post === false) {
    return (
      <Container className="py-5 text-center">
        <h3 className="fw-bold">Post not found</h3>
        <Link to="/feed" className="fw-semibold">← Back to feed</Link>
      </Container>
    );
  }

  if (!post) return <Loader label="Loading post…" />;

  return (
    <Container className="py-4">
      <Link to="/feed" className="small">← Back to feed</Link>
      <Row className="mt-2 g-4">
        <Col lg={8}>
          <Badge bg={post.kind === 'BIKE' ? 'warning' : 'info'} className="mb-2">
            {post.kind}
          </Badge>
          <h1 className="fw-bold">{post.title}</h1>
          {post.publishedAt && (
            <p className="ah-muted">
              Published {new Date(post.publishedAt).toLocaleDateString()}
            </p>
          )}

          {(post.images || []).map((img, i) => (
            <img
              key={img.id || i}
              src={mediaUrl(img.url)}
              alt={`${post.title} ${i + 1}`}
              className="img-fluid rounded mb-3"
            />
          ))}

          {/* Body is server-sanitized HTML from the rich text editor. */}
          <div dangerouslySetInnerHTML={{ __html: post.bodyHtml || '' }} />
        </Col>

        <Col lg={4}>
          {error && <Alert variant="danger" className="small">{error}</Alert>}

          {!isAuthenticated && (
            <Alert variant="info" className="small">
              <strong>Sign up to engage.</strong> You must be a registered member to
              post reviews or comments.{' '}
              <Link to="/register">Create an account</Link>.
            </Alert>
          )}

          {/* Reviews */}
          <Card className="ah-card border-0 mb-3">
            <Card.Body>
              <h5 className="fw-bold">Reviews ({reviews.length})</h5>

              {isAuthenticated && (
                <Form onSubmit={submitReview} className="mb-3">
                  <div className="d-flex gap-2 align-items-center mb-2">
                    <Form.Label className="mb-0 small">Rating</Form.Label>
                    <Form.Select
                      size="sm"
                      style={{ width: 80 }}
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} ★</option>
                      ))}
                    </Form.Select>
                  </div>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Your review…"
                    value={reviewBody}
                    onChange={(e) => setReviewBody(e.target.value)}
                  />
                  {tags.length > 0 && (
                    <div className="mt-2">
                      <div className="small fw-semibold mb-1">Tags</div>
                      <div className="d-flex flex-wrap gap-2">
                        {tags.map((t) => (
                          <Form.Check
                            key={t.id}
                            type="checkbox"
                            id={`review-tag-${t.id}`}
                            label={t.name}
                            className="small"
                            checked={selectedTagIds.includes(t.id)}
                            onChange={() => toggleTag(t.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <Button type="submit" variant="outline-primary" size="sm" className="mt-2">
                    Submit review
                  </Button>
                </Form>
              )}

              {reviews.length === 0 ? (
                <p className="ah-muted small mb-0">No reviews yet.</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {reviews.map((r) => (
                    <li key={r.id} className="border-top py-2">
                      <div className="text-warning small">{'★'.repeat(r.rating)}<span className="ah-muted">{'★'.repeat(5 - r.rating)}</span></div>
                      <div className="small" dangerouslySetInnerHTML={{ __html: r.body || '' }} />
                      {(r.tagIds || []).length > 0 && (
                        <div className="d-flex flex-wrap gap-1 mt-1">
                          {r.tagIds.map((id) => (
                            <Badge key={id} bg="light" text="dark" className="fw-normal">
                              {tagName(id)}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>

          {/* Comments */}
          <Card className="ah-card border-0">
            <Card.Body>
              <h5 className="fw-bold">Comments ({comments.length})</h5>

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

              {comments.length === 0 ? (
                <p className="ah-muted small mb-0">No comments yet.</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {comments.map((c) => (
                    <li key={c.id} className={`py-2 ${c.parentId ? 'ps-3 border-start' : 'border-top'}`}>
                      <div className="small" dangerouslySetInnerHTML={{ __html: c.body || '' }} />
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
