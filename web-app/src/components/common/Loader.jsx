import { Spinner } from 'react-bootstrap';

// Centered loading spinner with an optional label.
export default function Loader({ label = 'Loading…', fullscreen = false }) {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center gap-2 ${
        fullscreen ? 'vh-100' : 'py-5'
      }`}
      role="status"
    >
      <Spinner animation="border" variant="primary" />
      <span className="ah-muted small">{label}</span>
    </div>
  );
}
