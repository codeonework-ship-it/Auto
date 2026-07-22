import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

// Register page — wired to AuthContext.register (stubbed auth API).
export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    setServerError('');
    try {
      // Do not send confirmPassword to the API.
      const { confirmPassword, ...payload } = values;
      void confirmPassword;
      await registerUser(payload);
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(err?.message || 'Unable to register. Please try again.');
    }
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={7} lg={6}>
          <Card className="ah-card border-0">
            <Card.Body className="p-4">
              <h3 className="fw-bold mb-1">Create your account</h3>
              <p className="ah-muted">Join AutoHub to post, review, comment, and sell.</p>

              {serverError && <Alert variant="danger">{serverError}</Alert>}

              <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Row>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Display name</Form.Label>
                      <Form.Control
                        isInvalid={!!errors.displayName}
                        {...register('displayName', { required: 'Display name is required' })}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.displayName?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        isInvalid={!!errors.username}
                        {...register('username', { required: 'Username is required' })}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.username?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    isInvalid={!!errors.email}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/, message: 'Enter a valid email' },
                    })}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email?.message}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        isInvalid={!!errors.password}
                        {...register('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'At least 8 characters' },
                        })}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col sm={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Confirm password</Form.Label>
                      <Form.Control
                        type="password"
                        isInvalid={!!errors.confirmPassword}
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (v) => v === watch('password') || 'Passwords do not match',
                        })}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.confirmPassword?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" variant="primary" className="w-100" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account…' : 'Sign up'}
                </Button>
              </Form>

              <p className="text-center ah-muted mt-3 mb-0">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
