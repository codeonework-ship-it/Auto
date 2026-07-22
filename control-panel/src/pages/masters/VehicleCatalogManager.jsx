import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { FaArrowLeft, FaEdit, FaLayerGroup, FaPlus, FaTrash } from 'react-icons/fa';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import StatusBadge from '../../components/common/StatusBadge';
import Can from '../../components/Can';
import { vehicleCatalogApi } from '../../api/masters';

/**
 * Hierarchical vehicle catalog master: Makes -> Models -> Variants. A single breadcrumb-style
 * screen drills one level at a time. Reads are public; write controls are gated on master:manage.
 * Fully defensive — every load falls back to an empty state on error.
 */
export default function VehicleCatalogManager() {
  // level: 'makes' | 'models' | 'variants'
  const [make, setMake] = useState(null); // selected make when viewing its models
  const [model, setModel] = useState(null); // selected model when viewing its variants

  const level = model ? 'variants' : make ? 'models' : 'makes';

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const { register, handleSubmit, reset, formState } = useForm();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (model) data = await vehicleCatalogApi.listVariants(model.id);
      else if (make) data = await vehicleCatalogApi.listModels(make.id);
      else data = await vehicleCatalogApi.listMakes();
      setRows(Array.isArray(data) ? data : data?.items ?? []);
    } catch (e) {
      setError(e.normalizedMessage || 'Could not load records.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [make, model]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    reset(level === 'makes' ? { name: '', kind: 'CAR', active: true } : { name: '', active: true });
    setShowForm(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    reset(
      level === 'makes'
        ? { name: row.name, kind: row.kind, active: row.active }
        : { name: row.name, active: row.active }
    );
    setShowForm(true);
  };

  const onSubmit = async (values) => {
    setBusy(true);
    setError(null);
    try {
      if (level === 'makes') {
        const payload = { name: values.name, kind: values.kind, active: !!values.active };
        if (editing) await vehicleCatalogApi.updateMake(editing.id, payload);
        else await vehicleCatalogApi.createMake(payload);
      } else if (level === 'models') {
        const payload = { makeId: make.id, name: values.name, active: !!values.active };
        if (editing) await vehicleCatalogApi.updateModel(editing.id, payload);
        else await vehicleCatalogApi.createModel(payload);
      } else {
        const payload = { modelId: model.id, name: values.name, active: !!values.active };
        if (editing) await vehicleCatalogApi.updateVariant(editing.id, payload);
        else await vehicleCatalogApi.createVariant(payload);
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
      if (level === 'makes') await vehicleCatalogApi.removeMake(deleteTarget.id);
      else if (level === 'models') await vehicleCatalogApi.removeModel(deleteTarget.id);
      else await vehicleCatalogApi.removeVariant(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      setError(e.normalizedMessage || 'Delete failed.');
    } finally {
      setBusy(false);
    }
  };

  const drillIntoMake = (row) => {
    setModel(null);
    setMake(row);
  };
  const drillIntoModel = (row) => setModel(row);
  const backToMakes = () => {
    setModel(null);
    setMake(null);
  };
  const backToModels = () => setModel(null);

  const singular = level === 'makes' ? 'Make' : level === 'models' ? 'Model' : 'Variant';

  const columns = [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: singular, sortable: true },
    ...(level === 'makes' ? [{ key: 'kind', header: 'Kind', sortable: true }] : []),
    {
      key: 'active',
      header: 'Active',
      sortable: true,
      render: (row) => <StatusBadge status={row.active ? 'active' : 'disabled'} />,
    },
    {
      key: '__actions',
      header: 'Actions',
      render: (row) => (
        <div className="d-flex gap-2">
          {level === 'makes' && (
            <Button size="sm" variant="light" onClick={() => drillIntoMake(row)} title="Manage models">
              <FaLayerGroup className="me-1" /> Models
            </Button>
          )}
          {level === 'models' && (
            <Button size="sm" variant="light" onClick={() => drillIntoModel(row)} title="Manage variants">
              <FaLayerGroup className="me-1" /> Variants
            </Button>
          )}
          <Can permission="master:manage">
            <Button size="sm" variant="light" onClick={() => openEdit(row)}>
              <FaEdit />
            </Button>
            <Button size="sm" variant="outline-danger" onClick={() => setDeleteTarget(row)}>
              <FaTrash />
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  const title =
    level === 'makes'
      ? 'Vehicle Makes'
      : level === 'models'
        ? `Models · ${make.name}`
        : `Variants · ${make.name} ${model.name}`;

  const subtitle =
    level === 'makes'
      ? 'Manage vehicle makes; drill into a make to manage its models and variants.'
      : level === 'models'
        ? 'Models belonging to the selected make.'
        : 'Variants belonging to the selected model.';

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <>
            {level === 'makes' && (
              <Link to="/masters" className="btn btn-light btn-sm">
                <FaArrowLeft className="me-1" /> All Masters
              </Link>
            )}
            {level === 'models' && (
              <Button size="sm" variant="light" onClick={backToMakes}>
                <FaArrowLeft className="me-1" /> Makes
              </Button>
            )}
            {level === 'variants' && (
              <Button size="sm" variant="light" onClick={backToModels}>
                <FaArrowLeft className="me-1" /> Models
              </Button>
            )}
            <Can permission="master:manage">
              <Button size="sm" onClick={openCreate}>
                <FaPlus className="me-1" /> New {singular}
              </Button>
            </Can>
          </>
        }
      />

      {error && <Alert variant="info">{error}</Alert>}

      <DataTable
        columns={columns}
        data={rows}
        loading={loading}
        pageSize={10}
        emptyMessage={`No ${singular.toLowerCase()}s yet.`}
      />

      {/* Create / edit modal */}
      <Modal show={showForm} onHide={() => setShowForm(false)} centered>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Header closeButton>
            <Modal.Title>{editing ? `Edit ${singular}` : `New ${singular}`}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>
                {singular} name<span className="text-danger"> *</span>
              </Form.Label>
              <Form.Control type="text" {...register('name', { required: true })} />
              {formState.errors?.name && <div className="text-danger small mt-1">Required</div>}
            </Form.Group>

            {level === 'makes' && (
              <Form.Group className="mb-3">
                <Form.Label>
                  Kind<span className="text-danger"> *</span>
                </Form.Label>
                <Form.Select {...register('kind', { required: true })}>
                  <option value="CAR">CAR</option>
                  <option value="BIKE">BIKE</option>
                  <option value="BOTH">BOTH</option>
                </Form.Select>
                <Form.Text className="ah-muted">Which vehicle families this make covers.</Form.Text>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Active</Form.Label>
              <Form.Check type="switch" label="Enabled" {...register('active')} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowForm(false)} disabled={busy}>
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
        title={`Delete ${singular}`}
        body={`Delete “${deleteTarget?.name ?? deleteTarget?.id}”? This cannot be undone.`}
        confirmLabel="Delete"
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
