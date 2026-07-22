import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import {
  FaCarSide,
  FaMapMarkedAlt,
  FaUsers,
  FaStore,
  FaShieldAlt,
} from 'react-icons/fa';

/*
 * Home page — hero + the five product pillars from the canonical spec:
 *  1. Posts for cars/bikes (images, reviews, comments)
 *  2. Travel blog & tour guide
 *  3. Community
 *  4. Marketplace (buy/sell) with KYC
 *  5. Control panel with Masters, RBAC (admin app — linked conceptually)
 */
const PILLARS = [
  {
    icon: <FaCarSide />,
    title: 'Cars & Bikes',
    text: 'Post your rides with up to 20 images, rich write-ups, reviews and comments.',
    to: '/feed',
    cta: 'Explore feed',
  },
  {
    icon: <FaMapMarkedAlt />,
    title: 'Travel & Tours',
    text: 'Read travel blogs and connect with tour guides for your next road trip.',
    to: '/travel',
    cta: 'Read travel blog',
  },
  {
    icon: <FaUsers />,
    title: 'Community',
    text: 'Join groups, follow enthusiasts, and share your passion for automobiles.',
    to: '/community',
    cta: 'Join community',
  },
  {
    icon: <FaStore />,
    title: 'Marketplace',
    text: 'Buy and sell cars & bikes with verified sellers and secure listings.',
    to: '/marketplace',
    cta: 'Browse listings',
  },
  {
    icon: <FaShieldAlt />,
    title: 'Trust & KYC',
    text: 'KYC-verified buyers and sellers, moderation, and role-based safety.',
    to: '/register',
    cta: 'Get verified',
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <Container className="pt-4">
        <div className="ah-hero p-4 p-md-5">
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="display-5 fw-bold mb-2">
                Everything automotive, in one hub.
              </h1>
              <p className="lead mb-4 opacity-75">
                Share your cars &amp; bikes, discover travel routes, connect with the
                community, and buy or sell with confidence.
              </p>
              <div className="d-flex gap-2 flex-wrap">
                <Button as={Link} to="/register" variant="primary" size="lg">
                  Get started
                </Button>
                <Button as={Link} to="/feed" variant="outline-light" size="lg">
                  Browse posts
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </Container>

      {/* Pillars */}
      <Container className="py-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold">What you can do on AutoHub</h2>
          <p className="ah-muted">Five pillars, one community.</p>
        </div>
        <Row className="g-4">
          {PILLARS.map((p) => (
            <Col md={6} lg={4} key={p.title}>
              <Card className="ah-card h-100 border-0">
                <Card.Body className="d-flex flex-column">
                  <div className="ah-pillar-icon mb-3">{p.icon}</div>
                  <Card.Title className="fw-bold">{p.title}</Card.Title>
                  <Card.Text className="ah-muted flex-grow-1">{p.text}</Card.Text>
                  <Link to={p.to} className="fw-semibold">
                    {p.cta} →
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
