import { Link } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { FaDatabase, FaChevronRight } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import { MASTERS } from './mastersConfig';

// Landing grid linking to each master's CRUD screen.
export default function MastersIndex() {
  return (
    <div>
      <PageHeader
        title="Masters"
        subtitle="Reference data that powers the AutoHub catalog, marketplace and RBAC."
      />
      <Row className="g-3">
        {MASTERS.map((m) => (
          <Col key={m.key} xs={12} sm={6} lg={4}>
            <Link to={`/masters/${m.key}`} className="text-decoration-none">
              <div className="ah-card p-3 d-flex align-items-center justify-content-between h-100">
                <div className="d-flex align-items-center gap-3">
                  <span
                    className="ah-kpi__icon"
                    style={{ background: 'var(--ah-primary)' }}
                  >
                    <FaDatabase />
                  </span>
                  <div>
                    <div className="fw-semibold" style={{ color: 'var(--ah-text)' }}>
                      {m.plural}
                    </div>
                    <small className="ah-muted">{m.fields.length} fields</small>
                  </div>
                </div>
                <FaChevronRight className="ah-muted" />
              </div>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
