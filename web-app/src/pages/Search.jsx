// INTEGRATOR: add `<Route path="/search" element={<Search/>} />` to App.jsx (routes are not wired here).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Form, Button, InputGroup, ListGroup } from 'react-bootstrap';
import discoveryApi from '../api/discovery';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

const TYPES = [
  { value: '', label: 'All' },
  { value: 'POST', label: 'Posts' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'LISTING', label: 'Marketplace' },
];

const TYPE_META = {
  POST: { label: 'Post', variant: 'primary' },
  TRAVEL: { label: 'Travel', variant: 'info' },
  LISTING: { label: 'Marketplace', variant: 'warning' },
};

export default function Search() {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runSearch = async (e) => {
    if (e) e.preventDefault();
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await discoveryApi.search(q.trim(), type);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2 className="fw-bold mb-0">Search</h2>
        <p className="ah-muted mb-0">Find posts, travel stories and marketplace listings.</p>
      </div>

      <Form onSubmit={runSearch} className="mb-4">
        <Row className="g-2">
          <Col xs={12} md>
            <InputGroup>
              <Form.Control
                placeholder="Search AutoHub…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoFocus
              />
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Searching…' : 'Search'}
              </Button>
            </InputGroup>
          </Col>
          <Col xs={12} md="auto">
            <Form.Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ minWidth: 160 }}
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      </Form>

      {error && <p className="text-danger">{error}</p>}

      {loading && <Loader label="Searching…" />}

      {!loading && results !== null && results.length === 0 && (
        <EmptyState
          title="No results"
          message={q.trim() ? `Nothing matched “${q.trim()}”.` : 'Type a term above to search.'}
        />
      )}

      {!loading && results !== null && results.length > 0 && (
        <Card className="ah-card border-0">
          <ListGroup variant="flush">
            {results.map((hit) => {
              const meta = TYPE_META[hit.type] || { label: hit.type, variant: 'secondary' };
              return (
                <ListGroup.Item
                  key={`${hit.type}-${hit.id}`}
                  as={Link}
                  to={hit.url}
                  action
                  className="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <div className="fw-semibold">{hit.title}</div>
                    {hit.subtitle && <div className="ah-muted small">{hit.subtitle}</div>}
                  </div>
                  <Badge bg={meta.variant}>{meta.label}</Badge>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Card>
      )}
    </Container>
  );
}
