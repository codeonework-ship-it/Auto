import { Modal, Button } from 'react-bootstrap';

// Reusable confirmation dialog for destructive / important actions.
export default function ConfirmModal({
  show,
  title = 'Confirm',
  body = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
