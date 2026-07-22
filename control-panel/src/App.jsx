import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/users/UserManagement';
import Roles from './pages/rbac/Roles';
import Permissions from './pages/rbac/Permissions';
import MastersIndex from './pages/masters/MastersIndex';
import MasterCrud from './pages/masters/MasterCrud';
import KycReview from './pages/kyc/KycReview';
import PostsModeration from './pages/moderation/PostsModeration';
import ListingApprovals from './pages/marketplace/ListingApprovals';
import Reports from './pages/reports/Reports';
import AuditLog from './pages/audit/AuditLog';
import Settings from './pages/Settings';
import Forbidden from './pages/Forbidden';
import NotFound from './pages/NotFound';

// Route table. Protected routes render inside the admin layout shell.
export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />

      {/* Authenticated shell */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route
          path="users"
          element={
            <ProtectedRoute permission="user:manage">
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="roles"
          element={
            <ProtectedRoute permission="role:manage">
              <Roles />
            </ProtectedRoute>
          }
        />
        <Route
          path="permissions"
          element={
            <ProtectedRoute permission="role:manage">
              <Permissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="masters"
          element={
            <ProtectedRoute permission="master:manage">
              <MastersIndex />
            </ProtectedRoute>
          }
        />
        <Route
          path="masters/:key"
          element={
            <ProtectedRoute permission="master:manage">
              <MasterCrud />
            </ProtectedRoute>
          }
        />

        <Route
          path="kyc"
          element={
            <ProtectedRoute permission="kyc:review">
              <KycReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="moderation"
          element={
            <ProtectedRoute permission="post:moderate">
              <PostsModeration />
            </ProtectedRoute>
          }
        />
        <Route
          path="marketplace"
          element={
            <ProtectedRoute permission="listing:approve">
              <ListingApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute permission="report:view">
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="audit"
          element={
            <ProtectedRoute permission="audit:view">
              <AuditLog />
            </ProtectedRoute>
          }
        />
        <Route path="settings" element={<Settings />} />

        <Route path="403" element={<Forbidden />} />
      </Route>

      {/* Fallbacks */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
