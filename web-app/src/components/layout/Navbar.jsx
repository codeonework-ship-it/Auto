import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Navbar as BsNavbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { FaCarSide } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import RoleBadge from '../common/RoleBadge';

// Top navigation bar. Shows primary pillars and auth-aware actions.
export default function Navbar() {
  const { isAuthenticated, user, roles, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <BsNavbar expand="lg" className="ah-navbar" sticky="top" collapseOnSelect>
      <Container>
        <BsNavbar.Brand as={Link} to="/" className="ah-brand d-flex align-items-center gap-2">
          <FaCarSide className="text-warning" />
          Auto<span>Hub</span>
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="ah-nav" />
        <BsNavbar.Collapse id="ah-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/feed">Cars &amp; Bikes</Nav.Link>
            <Nav.Link as={NavLink} to="/marketplace">Marketplace</Nav.Link>
            <Nav.Link as={NavLink} to="/travel">Travel</Nav.Link>
            <Nav.Link as={NavLink} to="/tour-guide">Tour Guide</Nav.Link>
            <Nav.Link as={NavLink} to="/community">Community</Nav.Link>
          </Nav>
          <Nav className="align-items-lg-center gap-lg-2">
            {isAuthenticated ? (
              <>
                <Button as={Link} to="/create-post" variant="primary" size="sm">
                  + New Post
                </Button>
                <NavDropdown
                  align="end"
                  title={
                    <span className="d-inline-flex align-items-center gap-2">
                      {user?.displayName || user?.username || 'Account'}
                      {roles?.[0] && <RoleBadge role={roles[0]} />}
                    </span>
                  }
                  id="ah-account"
                >
                  <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/create-post">Create Post</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Log out</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={NavLink} to="/login">Log in</Nav.Link>
                <Button as={Link} to="/register" variant="primary" size="sm">
                  Sign up
                </Button>
              </>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}
