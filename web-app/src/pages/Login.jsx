import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

// Login page — wired to AuthContext.login (which calls the stubbed auth API).
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    setServerError('');
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err?.message || 'Unable to log in. Please try again.');
    }
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="ah-card border-0">
            <Card.Body className="p-4">
              <h3 className="fw-bold mb-1">Welcome back</h3>
              <p className="ah-muted">Log in to post, review, and sell.</p>

              {serverError && <Alert variant="danger">{serverError}</Alert>}

              <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="you@example.com"
                    isInvalid={!!errors.email}
                    {...register('email', { required: 'Email is required' })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    isInvalid={!!errors.password}
                    {...register('password', { required: 'Password is required' })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100" disabled={isSubmitting}>
                  {isSubmitting ? 'Logging in…' : 'Log in'}
                </Button>
              </Form>

              <p className="text-center ah-muted mt-3 mb-0">
                New to AutoHub? <Link to="/register">Create an account</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
