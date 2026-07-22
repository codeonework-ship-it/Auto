import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import travelApi from '../api/travel';
import { mediaUrl } from '../api/client';
import Loader from '../components/common/Loader';

// Travel post detail page. The :id route param carries the post slug.
export default function TravelPostDetail() {
  const { id: slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    let active = true;
    travelApi
      .getPost(slug)
      .then((data) => active && setPost(data))
      .catch(() => active && setPost(false));
    return () => {
      active = false;
    };
  }, [slug]);

  if (post === false) {
    return (
      <Container className="py-5 text-center">
        <h3 className="fw-bold">Travel post not found</h3>
        <Link to="/travel" className="fw-semibold">← Back to travel blog</Link>
      </Container>
    );
  }

  if (!post) return <Loader label="Loading…" />;

  return (
    <Container className="py-4" style={{ maxWidth: 820 }}>
      <Link to="/travel" className="small">← Back to travel blog</Link>
      <h1 className="fw-bold mt-2">{post.title}</h1>
      {post.location && <p className="ah-muted">📍 {post.location}</p>}
      {post.publishedAt && (
        <p className="ah-muted small">Published {new Date(post.publishedAt).toLocaleDateString()}</p>
      )}

      {/* Photo gallery */}
      {(post.images || []).map((img, i) => (
        <img
          key={img.id || i}
          src={mediaUrl(img.url)}
          alt={`${post.title} ${i + 1}`}
          className="img-fluid rounded mb-3"
        />
      ))}

      {/* Server-sanitized HTML body. */}
      <div dangerouslySetInnerHTML={{ __html: post.bodyHtml || '' }} />
    </Container>
  );
}
