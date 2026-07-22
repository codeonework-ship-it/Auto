import { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Alert, Spinner } from 'react-bootstrap';
import { FaUsers } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { communityApi } from '../api/community';

// Community groups landing — real data from the community bounded context.
export default function Community() {
  const { isAuthenticated } = useAuth();

  const [groups, setGroups] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await communityApi.listGroups();
      setGroups(Array.isArray(list) ? list : []);
      if (isAuthenticated) {
        const own = await communityApi.myGroups();
        setMine(Array.isArray(own) ? own : []);
      } else {
        setMine([]);
      }
    } catch (e) {
      setError(e?.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  const myIds = useMemo(() => new Set(mine.map((g) => g.id)), [mine]);

  const handleJoin = async (group) => {
    setBusyId(group.id);
    setError(null);
    try {
      await communityApi.join(group.id);
      await load();
    } catch (e) {
      setError(e?.message || 'Could not join group');
    } finally {
      setBusyId(null);
    }
  };

  const handleLeave = async (group) => {
    setBusyId(group.id);
    setError(null);
    try {
      await communityApi.leave(group.id);
      await load();
    } catch (e) {
      setError(e?.message || 'Could not leave group');
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim()) {
      setFormError('Group name is required');
      return;
    }
    setCreating(true);
    try {
      await communityApi.createGroup({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
      });
      setForm({ name: '', description: '' });
      await load();
    } catch (e2) {
      setFormError(e2?.message || 'Could not create group');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-0">Community</h2>
          <p className="ah-muted mb-0">Join groups and connect with fellow enthusiasts.</p>
        </div>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      {isAuthenticated && (
        <Card className="ah-card border-0 mb-4">
          <Card.Body>
            <Card.Title className="fs-6 fw-bold mb-3">Create a group</Card.Title>
            {formError && <Alert variant="danger" className="py-2">{formError}</Alert>}
            <Form onSubmit={handleCreate}>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group controlId="groupName">
                    <Form.Label className="small fw-semibold">Name</Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={120}
                      placeholder="e.g. JDM Enthusiasts"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="groupDescription">
                    <Form.Label className="small fw-semibold">Description</Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={500}
                      placeholder="What's this group about?"
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button type="submit" variant="primary" className="w-100" disabled={creating}>
                    {creating ? 'Creating…' : 'Create'}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      ) : groups.length === 0 ? (
        <p className="ah-muted">No groups yet. {isAuthenticated ? 'Be the first to create one!' : ''}</p>
      ) : (
        <Row className="g-4">
          {groups.map((grp) => {
            const isMember = myIds.has(grp.id);
            return (
              <Col md={6} lg={3} key={grp.id}>
                <Card className="ah-card h-100 border-0 text-center">
                  <Card.Body className="d-flex flex-column">
                    <div className="ah-pillar-icon mx-auto mb-3">
                      <FaUsers />
                    </div>
                    <Card.Title className="fs-6 fw-bold">{grp.name}</Card.Title>
                    {grp.description && (
                      <div className="ah-muted small mb-2">{grp.description}</div>
                    )}
                    <Badge bg="secondary" className="mb-2 align-self-center">
                      {grp.memberCount?.toLocaleString?.() ?? grp.memberCount} members
                    </Badge>
                    <div className="mt-auto pt-2">
                      {!isAuthenticated ? (
                        <Button variant="outline-primary" size="sm" disabled>
                          Log in to join
                        </Button>
                      ) : isMember ? (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          disabled={busyId === grp.id}
                          onClick={() => handleLeave(grp)}
                        >
                          {busyId === grp.id ? 'Leaving…' : 'Leave'}
                        </Button>
                      ) : (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          disabled={busyId === grp.id}
                          onClick={() => handleJoin(grp)}
                        >
                          {busyId === grp.id ? 'Joining…' : 'Join group'}
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}
