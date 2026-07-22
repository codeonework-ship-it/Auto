import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUsers,
  FaUserShield,
  FaDatabase,
  FaIdCard,
  FaFlag,
  FaStore,
  FaChartBar,
  FaClipboardList,
  FaCog,
  FaCarSide,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

// Each nav item may declare a required permission and/or role.
// SUPER_ADMIN sees everything (handled inside hasPermission).
const NAV = [
  { to: '/', label: 'Dashboard', icon: FaTachometerAlt, end: true },
  { to: '/users', label: 'Users', icon: FaUsers, permission: 'user:manage' },
  {
    to: '/roles',
    label: 'Roles & Permissions',
    icon: FaUserShield,
    permission: 'role:manage',
  },
  { to: '/masters', label: 'Masters', icon: FaDatabase, permission: 'master:manage' },
  { to: '/kyc', label: 'KYC Review', icon: FaIdCard, permission: 'kyc:review' },
  {
    to: '/moderation',
    label: 'Posts Moderation',
    icon: FaFlag,
    permission: 'post:moderate',
  },
  {
    to: '/marketplace',
    label: 'Marketplace',
    icon: FaStore,
    permission: 'listing:approve',
  },
  { to: '/reports', label: 'Reports', icon: FaChartBar, permission: 'report:view' },
  {
    to: '/audit',
    label: 'Audit Log',
    icon: FaClipboardList,
    permission: 'audit:view',
  },
  { to: '/settings', label: 'Settings', icon: FaCog },
];

export default function Sidebar({ open, onNavigate }) {
  const { hasPermission, hasRole } = useAuth();

  const visible = NAV.filter((item) => {
    const permOk = item.permission ? hasPermission(item.permission) : true;
    const roleOk = item.role ? hasRole(item.role) : true;
    return permOk && roleOk;
  });

  return (
    <aside className={`ah-sidebar${open ? ' open' : ''}`}>
      <div className="ah-sidebar__brand">
        <FaCarSide size={22} color="#f59e0b" />
        <span>AutoHub Admin</span>
      </div>
      <nav className="ah-sidebar__nav">
        <div className="ah-sidebar__section">Control Panel</div>
        {visible.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `ah-nav-link${isActive ? ' active' : ''}`
            }
            onClick={onNavigate}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
