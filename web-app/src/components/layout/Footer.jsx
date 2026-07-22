import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FaGithub, FaInstagram, FaYoutube } from 'react-icons/fa';

// Site footer with pillar links and social icons.
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="ah-footer mt-5 py-4">
      <Container>
        <Row className="gy-4">
          <Col md={4}>
            <div className="ah-brand fs-5 mb-2">
              Auto<span style={{ color: 'var(--ah-orange)' }}>Hub</span>
            </div>
            <p className="ah-muted mb-0 small">
              A community for cars, bikes, travel, and a trusted marketplace to buy &amp; sell.
            </p>
          </Col>
          <Col md={2} xs={6}>
            <h6>Explore</h6>
            <ul className="list-unstyled small">
              <li><Link to="/feed">Cars &amp; Bikes</Link></li>
              <li><Link to="/marketplace">Marketplace</Link></li>
              <li><Link to="/travel">Travel Blog</Link></li>
              <li><Link to="/tour-guide">Tour Guide</Link></li>
            </ul>
          </Col>
          <Col md={2} xs={6}>
            <h6>Community</h6>
            <ul className="list-unstyled small">
              <li><Link to="/community">Groups</Link></li>
              <li><Link to="/register">Join</Link></li>
              <li><Link to="/login">Log in</Link></li>
            </ul>
          </Col>
          <Col md={4}>
            <h6>Follow</h6>
            <div className="d-flex gap-3 fs-5">
              <a href="#" aria-label="GitHub"><FaGithub /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </Col>
        </Row>
        <hr />
        <div className="d-flex justify-content-between flex-wrap small ah-muted">
          <span>&copy; {year} AutoHub. All rights reserved.</span>
          <span>Built with React + Bootstrap</span>
        </div>
      </Container>
    </footer>
  );
}
