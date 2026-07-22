import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import StatusBadge from '../../components/common/StatusBadge';
import Can from '../../components/Can';
import mastersApi from '../../api/masters';
import { getMaster } from './mastersConfig';
import VehicleCatalogManager from './VehicleCatalogManager';

// Generic CRUD screen that renders itself from a master's field config.
export default function MasterCrud() {
  const { key } = useParams();
  const master = getMaster(key);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const { register, handleSubmit, reset, formState } = useForm();

  const load = useCallback(async () => {
    if (!master || !master.backed) return;
    setLoading(true);
    setError(null);
    try {
      const data = await mastersApi.list(master.resource);
      setRows(Array.isArray(data) ? data : data?.items ?? []);
    } catch (e) {
      // Graceful empty state — no sample data.
      setError(e.normalizedMessage || 'Could not load records.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [master]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    reset(defaultValues(master));
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    reset(row);
    setShowForm(true);
  };

  // Build the payload from the master's configured fields so richer masters (e.g. the make
  // "kind", city "country", currency "code") send every column the backend expects — not just
  // { name, active }. Checkboxes are coerced to real booleans.
  const toPayload = (values) => {
    const payload = {};
    (master?.fields ?? []).forEach((f) => {
      payload[f.name] = f.type === 'checkbox' ? !!values[f.name] : values[f.name];
    });
    return payload;
  };

  const onSubmit = async (values) => {
    setBusy(true);
    setError(null);
    try {
      if (editing?.id != null) {
        await mastersApi.update(master.resource, editing.id, toPayload(values));
      } else {
        await mastersApi.create(master.resource, toPayload(values));
      }
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e.normalizedMessage || 'Save failed.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      await mastersApi.remove(master.resource, deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setError(e.normalizedMessage || 'Delete failed.');
    } finally {
      setBusy(false);
    }
  };

  // Build columns from the field config + an actions column.
  const columns = useMemo(() => {
    if (!master) return [];
    const fieldCols = master.fields.map((f) => ({
      key: f.name,
      header: f.label,
      sortable: true,
      render:
        f.type === 'checkbox'
          ? (row) => <StatusBadge status={row[f.name] ? 'active' : 'disabled'} />
          : undefined,
    }));
    return [
      { key: 'id', header: 'ID', sortable: true },
      ...fieldCols,
      {
        key: '__actions',
        header: 'Actions',
        render: (row) => (
          <div className="d-flex gap-2">
            <Can permission="master:manage">
              <Button size="sm" variant="light" onClick={() => openEdit(row)}>
                <FaEdit />
              </Button>
              <Button
                size="sm"
                variant="outline-danger"
                onClick={() => setDeleteTarget(row)}
              >
                <FaTrash />
              </Button>
            </Can>
          </div>
        ),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [master]);

  // Vehicle makes are hierarchical (make -> model -> variant); a dedicated manager handles the
  // drill-down. Rendered here (after all hooks) so hook order stays stable across master pages.
  if (key === 'vehicle-makes') {
    return <VehicleCatalogManager />;
  }

  if (!master) {
    return (
      <Alert variant="warning">
        Unknown master “{key}”. <Link to="/masters">Back to Masters</Link>
      </Alert>
    );
  }

  const backendPending = !master.backed;

  return (
    <div>
      <PageHeader
        title={master.plural}
        subtitle={`Manage ${master.label.toLowerCase()} reference data.`}
        actions={
          <>
            <Link to="/masters" className="btn btn-light btn-sm">
              <FaArrowLeft className="me-1" /> All Masters
            </Link>
            {!backendPending && (
              <Can permission="master:manage">
                <Button size="sm" onClick={openCreate}>
                  <FaPlus className="me-1" /> New {master.label}
                </Button>
              </Can>
            )}
          </>
        }
      />

      {backendPending ? (
        <Alert variant="warning">
          <strong>Backend pending.</strong> The API for “{master.plural}” is not available yet.
          {master.help ? ` ${master.help}` : ''}
        </Alert>
      ) : (
        <>
          {error && <Alert variant="info">{error}</Alert>}
          <DataTable
            columns={columns}
            data={rows}
            loading={loading}
            pageSize={10}
            emptyMessage={`No ${master.plural.toLowerCase()} yet.`}
          />
        </>
      )}

      {/* Create / edit modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editing ? `Edit ${master.label}` : `New ${master.label}`}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {master.fields.map((f) => (
              <Form.Group className="mb-3" key={f.name}>
                <Form.Label>
                  {f.label}
                  {f.required && <span className="text-danger"> *</span>}
                </Form.Label>
                {f.type === 'textarea' ? (
                  <Form.Control
                    as="textarea"
                    rows={3}
                    {...register(f.name, { required: f.required })}
                  />
                ) : f.type === 'select' ? (
                  <Form.Select {...register(f.name, { required: f.required })}>
                    <option value="">Select…</option>
                    {(f.options || []).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Form.Select>
                ) : f.type === 'checkbox' ? (
                  <Form.Check
                    type="switch"
                    label="Enabled"
                    {...register(f.name)}
                  />
                ) : (
                  <Form.Control
                    type={f.type === 'number' ? 'number' : 'text'}
                    {...register(f.name, { required: f.required })}
                  />
                )}
                {f.help && <Form.Text className="ah-muted">{f.help}</Form.Text>}
                {formState.errors?.[f.name] && (
                  <div className="text-danger small mt-1">Required</div>
                )}
              </Form.Group>
            ))}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="light"
              onClick={() => setShowForm(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <ConfirmModal
        show={!!deleteTarget}
        title={`Delete ${master.label}`}
        body={`Delete “${deleteTarget?.name ?? deleteTarget?.id}”? This cannot be undone.`}
        confirmLabel="Delete"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// ---- helpers ----
function defaultValues(master) {
  const v = {};
  master.fields.forEach((f) => {
    v[f.name] = f.type === 'checkbox' ? true : '';
  });
  return v;
}
