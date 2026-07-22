import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { FaCarSide } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Admin login screen.
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (values) => {
    setBusy(true);
    setError(null);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (e) {
      setError(e.normalizedMessage || 'Invalid credentials.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ah-login">
      <div className="ah-login__card">
        <div className="text-center mb-4">
          <FaCarSide size={40} color="#1f6feb" />
          <h1 className="h4 mt-2 mb-1">AutoHub Admin</h1>
          <p className="ah-muted mb-0">Sign in to the control panel</p>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="admin@autohub.dev"
              autoComplete="username"
              {...register('email', { required: true })}
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register('password', { required: true })}
            />
          </Form.Group>
          <Button type="submit" className="w-100" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </Form>

        <p className="text-center ah-muted mt-4 mb-0" style={{ fontSize: '0.8rem' }}>
          AutoHub Control Panel · dev build
        </p>
      </div>
    </div>
  );
}
