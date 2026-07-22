import { Dropdown, Button } from 'react-bootstrap';
import { FaBars, FaMoon, FaSun, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

// Top navigation bar: sidebar toggle (mobile), theme switch, and user menu.
export default function Topbar({ onToggleSidebar, theme, onToggleTheme }) {
  const { user, roles, logout } = useAuth();

  return (
    <header className="ah-topbar">
      <div className="d-flex align-items-center gap-2">
        <Button
          variant="light"
          size="sm"
          className="d-lg-none"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </Button>
        <strong className="d-none d-sm-inline">Back-Office</strong>
      </div>

      <div className="d-flex align-items-center gap-2">
        <Button
          variant="light"
          size="sm"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </Button>

        <Dropdown align="end">
          <Dropdown.Toggle variant="light" size="sm" id="user-menu">
            <FaUserCircle className="me-1" />
            {user?.name || user?.email || 'Admin'}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Header>
              {roles?.length ? roles.join(', ') : 'No roles'}
            </Dropdown.Header>
            <Dropdown.Divider />
            <Dropdown.Item onClick={logout}>Sign out</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
}
