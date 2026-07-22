// Notifications page — lists the signed-in user's notifications (newest first).
// Integrator: add <Route path="/notifications" element={<Notifications/>}/> to App.jsx.
import { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { FaBell, FaRegBell } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../api/notifications';

export default function Notifications() {
  const { isAuthenticated } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await notificationsApi.list();
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      load();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, load]);

  const handleMarkRead = async (item) => {
    if (item.read) return;
    setBusyId(item.id);
    setError(null);
    try {
      await notificationsApi.markRead(item.id);
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
    } catch (e) {
      setError(e?.message || 'Could not mark notification read');
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    setError(null);
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      setError(e?.message || 'Could not mark all read');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = items.filter((n) => !n.read).length;

  if (!isAuthenticated) {
    return (
      <Container className="py-4">
        <Alert variant="info">Please log in to view your notifications.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <h2 className="fw-bold mb-0">Notifications</h2>
          <p className="ah-muted mb-0">
            {unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up.'}
          </p>
        </div>
        <Button
          variant="outline-primary"
          size="sm"
          disabled={markingAll || unreadCount === 0}
          onClick={handleMarkAllRead}
        >
          {markingAll ? 'Marking…' : 'Mark all read'}
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
        </div>
      ) : items.length === 0 ? (
        <p className="ah-muted">You have no notifications yet.</p>
      ) : (
        <Row className="g-3">
          {items.map((item) => (
            <Col xs={12} key={item.id}>
              <Card className={`ah-card border-0 ${item.read ? '' : 'border-start border-primary border-4'}`}>
                <Card.Body className="d-flex align-items-start gap-3">
                  <div className={item.read ? 'ah-muted' : 'text-primary'} style={{ fontSize: '1.25rem' }}>
                    {item.read ? <FaRegBell /> : <FaBell />}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <span className={`fw-${item.read ? 'semibold' : 'bold'}`}>{item.title}</span>
                      {!item.read && <Badge bg="primary">New</Badge>}
                      {item.type && (
                        <Badge bg="secondary" className="text-uppercase small">
                          {item.type}
                        </Badge>
                      )}
                    </div>
                    {item.body && <div className="ah-muted small mt-1">{item.body}</div>}
                    {item.createdAt && (
                      <div className="ah-muted small mt-1">
                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  {!item.read && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={busyId === item.id}
                      onClick={() => handleMarkRead(item)}
                    >
                      {busyId === item.id ? 'Marking…' : 'Mark read'}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
