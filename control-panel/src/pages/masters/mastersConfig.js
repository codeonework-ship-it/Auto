/**
 * Central registry of all Masters (adminops context).
 * Each entry drives the generic MasterCrud page and the Masters index.
 *
 *  - key:      URL slug used in /masters/:key
 *  - resource: backend path segment (/masters/<resource>)
 *  - label:    singular display name
 *  - plural:   list heading
 *  - backed:   true when the backend serves this resource. When false the CRUD screen shows a
 *              "backend pending" note instead of making live calls.
 *  - fields:   form + table field definitions
 *
 * Field: { name, label, type, required?, options?, help? }
 *   type ∈ text | textarea | number | select | checkbox
 *
 * NOTE: the backend MasterController serves ONLY simple { id, name, active } masters, so the
 * backed entries carry just name + active. Richer masters (makes/models/cities/currencies, and
 * RBAC roles/permissions) have no generic-master backend and are flagged backed:false.
 */

const nameActive = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'active', label: 'Active', type: 'checkbox' },
];

export const MASTERS = [
  // ---- backend-backed simple masters ({ id, name, active }) ----
  {
    key: 'fuel-types',
    resource: 'fuel-types',
    label: 'Fuel Type',
    plural: 'Fuel Types',
    backed: true,
    fields: nameActive,
  },
  {
    key: 'body-types',
    resource: 'body-types',
    label: 'Body Type',
    plural: 'Body Types',
    backed: true,
    fields: nameActive,
  },
  {
    key: 'transmissions',
    resource: 'transmissions',
    label: 'Transmission',
    plural: 'Transmissions',
    backed: true,
    fields: nameActive,
  },
  {
    key: 'categories',
    resource: 'categories',
    label: 'Category',
    plural: 'Categories (car/bike)',
    backed: true,
    fields: nameActive,
  },
  {
    key: 'tour-categories',
    resource: 'tour-categories',
    label: 'Tour Category',
    plural: 'Tour Categories',
    backed: true,
    fields: nameActive,
  },
  {
    key: 'review-tags',
    resource: 'review-tags',
    label: 'Review Tag',
    plural: 'Review Tags',
    backed: true,
    fields: nameActive,
  },
  {
    key: 'report-reasons',
    resource: 'report-reasons',
    label: 'Report Reason',
    plural: 'Report Reasons',
    backed: true,
    fields: nameActive,
  },

  // ---- vehicle catalog + geo masters (adminops dedicated controllers) ----
  {
    key: 'vehicle-makes',
    resource: 'vehicle-makes',
    label: 'Vehicle Make',
    plural: 'Vehicle Makes',
    backed: true,
    // Drill into a make's models (and each model's variants) from the row actions.
    drillTo: 'models',
    fields: [
      { name: 'name', label: 'Make', type: 'text', required: true },
      {
        name: 'kind',
        label: 'Kind',
        type: 'select',
        options: ['CAR', 'BIKE', 'BOTH'],
        required: true,
        help: 'Which vehicle families this make covers.',
      },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    key: 'vehicle-models',
    resource: 'vehicle-models',
    label: 'Model',
    plural: 'Vehicle Models',
    // Hierarchical (belongs to a make, then to variants) — managed by drilling into a make
    // on the Vehicle Makes page rather than through the flat CRUD screen.
    backed: false,
    help: 'Models are managed per make: open Vehicle Makes and use “Models” on a make row.',
    fields: [
      { name: 'name', label: 'Model', type: 'text', required: true },
      { name: 'makeId', label: 'Make', type: 'text', required: true, help: 'Parent make id' },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    key: 'vehicle-variants',
    resource: 'vehicle-variants',
    label: 'Variant',
    plural: 'Vehicle Variants',
    backed: false,
    help: 'Variants are managed per model: drill Vehicle Makes → Models → Variants.',
    fields: [
      { name: 'name', label: 'Variant', type: 'text', required: true },
      { name: 'modelId', label: 'Model', type: 'text', required: true, help: 'Parent model id' },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    key: 'cities',
    resource: 'cities',
    label: 'City',
    plural: 'Locations / Cities',
    backed: true,
    fields: [
      { name: 'name', label: 'City', type: 'text', required: true },
      { name: 'country', label: 'Country', type: 'text', help: 'Part of the city’s unique key.' },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    key: 'currencies',
    resource: 'currencies',
    label: 'Currency',
    plural: 'Currencies',
    backed: true,
    fields: [
      { name: 'code', label: 'ISO Code', type: 'text', required: true, help: 'Exactly 3 letters, e.g. USD, INR' },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    key: 'roles',
    resource: 'roles',
    label: 'Role',
    plural: 'Roles',
    backed: false,
    help: 'Managed under Roles & Permissions.',
    fields: [
      { name: 'name', label: 'Role', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    key: 'permissions',
    resource: 'permissions',
    label: 'Permission',
    plural: 'Permissions',
    backed: false,
    help: 'Managed under Roles & Permissions.',
    fields: [
      { name: 'name', label: 'Permission', type: 'text', required: true, help: 'resource:action' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
];

export function getMaster(key) {
  return MASTERS.find((m) => m.key === key);
}

export default MASTERS;
