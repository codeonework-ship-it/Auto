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

  // ---- backend pending (no generic-master endpoint yet) ----
  {
    key: 'vehicle-makes',
    resource: 'vehicle-makes',
    label: 'Vehicle Make',
    plural: 'Vehicle Makes',
    backed: false,
    fields: [
      { name: 'name', label: 'Make', type: 'text', required: true },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        options: ['car', 'bike'],
        required: true,
      },
      { name: 'country', label: 'Country of Origin', type: 'text' },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    key: 'vehicle-models',
    resource: 'vehicle-models',
    label: 'Model',
    plural: 'Vehicle Models',
    backed: false,
    fields: [
      { name: 'name', label: 'Model', type: 'text', required: true },
      { name: 'makeId', label: 'Make', type: 'text', required: true, help: 'Parent make id' },
      { name: 'year', label: 'Year', type: 'number' },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    key: 'vehicle-variants',
    resource: 'vehicle-variants',
    label: 'Variant',
    plural: 'Vehicle Variants',
    backed: false,
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
    backed: false,
    fields: [
      { name: 'name', label: 'City', type: 'text', required: true },
      { name: 'state', label: 'State/Province', type: 'text' },
      { name: 'country', label: 'Country', type: 'text', required: true },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    key: 'currencies',
    resource: 'currencies',
    label: 'Currency',
    plural: 'Currencies',
    backed: false,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'code', label: 'ISO Code', type: 'text', required: true, help: 'e.g. USD, INR' },
      { name: 'symbol', label: 'Symbol', type: 'text' },
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
