import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import travelApi from '../api/travel';
import Loader from '../components/common/Loader';

// Travel post detail page.
export default function TravelPostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    let active = true;
    travelApi
      .getPost(id)
      .then((data) => active && setPost(data))
      .catch(
        () =>
          active &&
          setPost({
            id,
            title: 'Sample travel post',
            author: 'demo_traveler',
            cover: 'https://placehold.co/1280x720?text=Travel',
            bodyHtml:
              '<p>Placeholder travel content. Connect the backend to load the real story.</p>',
          }),
      );
    return () => {
      active = false;
    };
  }, [id]);

  if (!post) return <Loader label="Loading…" />;

  return (
    <Container className="py-4" style={{ maxWidth: 820 }}>
      <Link to="/travel" className="small">← Back to travel blog</Link>
      <h1 className="fw-bold mt-2">{post.title}</h1>
      <p className="ah-muted">by {post.author}</p>
      {post.cover && <img src={post.cover} alt={post.title} className="img-fluid rounded mb-3" />}
      {/* Server-sanitized HTML body. */}
      <div dangerouslySetInnerHTML={{ __html: post.bodyHtml || '' }} />
    </Container>
  );
}
