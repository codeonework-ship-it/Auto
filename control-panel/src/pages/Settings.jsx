import { Form, Row, Col, Button } from 'react-bootstrap';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';

// Basic settings placeholder — profile + platform preferences.
export default function Settings() {
  const { user, roles } = useAuth();

  return (
    <div>
      <PageHeader title="Settings" subtitle="Your profile and control-panel preferences." />

      <div className="ah-card p-4" style={{ maxWidth: 640 }}>
        <h2 className="h6 mb-3">Profile</h2>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control defaultValue={user?.name || ''} readOnly />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control defaultValue={user?.email || ''} readOnly />
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group>
              <Form.Label>Roles</Form.Label>
              <Form.Control defaultValue={(roles || []).join(', ')} readOnly />
            </Form.Group>
          </Col>
        </Row>
        <hr className="my-4" />
        <h2 className="h6 mb-3">Preferences</h2>
        <Form.Check
          type="switch"
          id="email-notifs"
          label="Email me when a KYC submission needs review"
          defaultChecked
        />
        <Form.Check
          type="switch"
          id="digest"
          label="Daily moderation digest"
          className="mt-2"
        />
        <div className="mt-4">
          <Button disabled>Save changes</Button>
          <small className="ah-muted ms-3">Wire to /settings API.</small>
        </div>
      </div>
    </div>
  );
}
