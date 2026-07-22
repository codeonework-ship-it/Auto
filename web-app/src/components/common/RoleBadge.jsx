import { Badge } from 'react-bootstrap';

/*
 * Renders a colored badge for an RBAC role.
 * Roles (FIXED): SUPER_ADMIN, ADMIN, MODERATOR, SELLER, BUYER, AUTHOR, MEMBER, GUEST.
 */
const ROLE_VARIANTS = {
  SUPER_ADMIN: 'danger',
  ADMIN: 'danger',
  MODERATOR: 'warning',
  SELLER: 'success',
  BUYER: 'info',
  AUTHOR: 'primary',
  MEMBER: 'secondary',
  GUEST: 'light',
};

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MODERATOR: 'Moderator',
  SELLER: 'Seller',
  BUYER: 'Buyer',
  AUTHOR: 'Author',
  MEMBER: 'Member',
  GUEST: 'Guest',
};

export default function RoleBadge({ role }) {
  if (!role) return null;
  const variant = ROLE_VARIANTS[role] || 'secondary';
  const label = ROLE_LABELS[role] || role;
  return (
    <Badge bg={variant} className="text-uppercase" style={{ fontSize: '0.65rem' }}>
      {label}
    </Badge>
  );
}
