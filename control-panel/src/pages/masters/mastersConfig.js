/**
 * Central registry of all Masters (adminops context).
 * Each entry drives the generic MasterCrud page and the Masters index.
 *
 *  - key:      URL slug used in /masters/:key
 *  - resource: backend path segment (/masters/<resource>)
 *  - label:    singular display name
 *  - plural:   list heading
 *  - fields:   form + table field definitions
 *
 * Field: { name, label, type, required?, options?, help? }
 *   type ∈ text | textarea | number | select | checkbox
 */

const nameCode = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'code', label: 'Code', type: 'text', help: 'Short unique code' },
  { name: 'active', label: 'Active', type: 'checkbox' },
];

export const MASTERS = [
  {
    key: 'vehicle-makes',
    resource: 'vehicle-makes',
    label: 'Vehicle Make',
    plural: 'Vehicle Makes',
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
    fields: [
      { name: 'name', label: 'Variant', type: 'text', required: true },
      { name: 'modelId', label: 'Model', type: 'text', required: true, help: 'Parent model id' },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    key: 'fuel-types',
    resource: 'fuel-types',
    label: 'Fuel Type',
    plural: 'Fuel Types',
    fields: nameCode,
  },
  {
    key: 'body-types',
    resource: 'body-types',
    label: 'Body Type',
    plural: 'Body Types',
    fields: nameCode,
  },
  {
    key: 'transmissions',
    resource: 'transmissions',
    label: 'Transmission',
    plural: 'Transmissions',
    fields: nameCode,
  },
  {
    key: 'categories',
    resource: 'categories',
    label: 'Category',
    plural: 'Categories (car/bike)',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      {
        name: 'kind',
        label: 'Kind',
        type: 'select',
        options: ['car', 'bike'],
        required: true,
      },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    key: 'cities',
    resource: 'cities',
    label: 'City',
    plural: 'Locations / Cities',
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
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'code', label: 'ISO Code', type: 'text', required: true, help: 'e.g. USD, INR' },
      { name: 'symbol', label: 'Symbol', type: 'text' },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    key: 'tour-categories',
    resource: 'tour-categories',
    label: 'Tour Category',
    plural: 'Tour Categories',
    fields: nameCode,
  },
  {
    key: 'review-tags',
    resource: 'review-tags',
    label: 'Review Tag',
    plural: 'Review Tags',
    fields: nameCode,
  },
  {
    key: 'report-reasons',
    resource: 'report-reasons',
    label: 'Report Reason',
    plural: 'Report Reasons',
    fields: [
      { name: 'name', label: 'Reason', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'active', label: 'Active', type: 'checkbox' },
    ],
  },
  {
    key: 'roles',
    resource: 'roles',
    label: 'Role',
    plural: 'Roles',
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
