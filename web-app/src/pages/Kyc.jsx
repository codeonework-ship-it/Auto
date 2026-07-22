// Kyc — buyer/seller identity verification page.
// INTEGRATOR NOTE: add the route to App.jsx:
//   <Route path="/kyc" element={<Kyc/>} />
// (this file intentionally does not touch App.jsx).
import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Table } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import kycApi from '../api/kyc';

const DOCUMENT_TYPES = [
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVERS_LICENSE', label: "Driver's license" },
  { value: 'NATIONAL_ID', label: 'National ID' },
  { value: 'GST', label: 'GST' },
];

// react-bootstrap Badge variant per KYC status.
const STATUS_VARIANT = {
  DRAFT: 'secondary',
  SUBMITTED: 'info',
  UNDER_REVIEW: 'primary',
  APPROVED: 'success',
  REJECTED: 'danger',
};

export default function Kyc() {
  const { isAuthenticated } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { kycType: 'BUYER', documentType: 'PASSPORT' } });

  async function loadProfiles() {
    setLoading(true);
    try {
      const list = await kycApi.myProfiles();
      setProfiles(Array.isArray(list) ? list : []);
    } catch (err) {
      setServerError(err?.message || 'Failed to load your KYC profiles.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAuthenticated) loadProfiles();
    else setLoading(false);
  }, [isAuthenticated]);

  async function onSubmit(values) {
    setServerError('');
    setSuccess('');
    try {
      await kycApi.submit(values);
      setSuccess(`Your ${values.kycType} KYC has been submitted for review.`);
      reset({ kycType: 'BUYER', documentType: 'PASSPORT' });
      await loadProfiles();
    } catch (err) {
      setServerError(err?.message || 'Failed to submit KYC.');
    }
  }

  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Please sign in to complete KYC verification.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={9}>
          <h2 className="fw-bold mb-1">Identity verification (KYC)</h2>
          <p className="ah-muted">Verify your identity to buy and sell on AutoHub.</p>

          <Alert variant="info" className="small">
            KYC is <strong>required to buy or sell</strong> on the marketplace. Submit a profile
            for each role you need. Text details only — no document files are uploaded or stored.
          </Alert>

          {serverError && <Alert variant="danger">{serverError}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Card className="ah-card border-0 mb-4">
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Verification for</Form.Label>
                      <Form.Select {...register('kycType', { required: true })}>
                        <option value="BUYER">Buyer</option>
                        <option value="SELLER">Seller</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Legal name</Form.Label>
                      <Form.Control
                        placeholder="Full legal name"
                        isInvalid={!!errors.legalName}
                        {...register('legalName', { required: 'Legal name is required' })}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.legalName?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Document type</Form.Label>
                      <Form.Select {...register('documentType', { required: true })}>
                        {DOCUMENT_TYPES.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Document number</Form.Label>
                      <Form.Control
                        placeholder="e.g. P1234567"
                        isInvalid={!!errors.documentNumber}
                        {...register('documentNumber', { required: 'Document number is required' })}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.documentNumber?.message}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Phone</Form.Label>
                      <Form.Control placeholder="Contact number" {...register('phone')} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Address line</Form.Label>
                      <Form.Control placeholder="Street address" {...register('addressLine')} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>City</Form.Label>
                      <Form.Control {...register('city')} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Country</Form.Label>
                      <Form.Control {...register('country')} />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mt-3">
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting…' : 'Submit for review'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Form>

          <h5 className="fw-bold mb-3">Your KYC profiles</h5>
          {loading ? (
            <p className="ah-muted">Loading…</p>
          ) : profiles.length === 0 ? (
            <p className="ah-muted">You have not submitted any KYC profiles yet.</p>
          ) : (
            <Table responsive className="align-middle">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Legal name</th>
                  <th>Document</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id}>
                    <td>{p.kycType}</td>
                    <td>{p.legalName}</td>
                    <td>
                      {p.documentType}
                      {p.documentNumber ? ` · ${p.documentNumber}` : ''}
                    </td>
                    <td>
                      <Badge bg={STATUS_VARIANT[p.status] || 'secondary'}>{p.status}</Badge>
                      {p.status === 'REJECTED' && p.reviewNotes && (
                        <div className="small text-danger mt-1">{p.reviewNotes}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </Container>
  );
}
