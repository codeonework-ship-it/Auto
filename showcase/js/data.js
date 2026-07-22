/* ============================================================================
   MOTORA — UI taxonomy only (category ids, labels, icons).
   ALL product data (vehicles, specs, images, reviews) is served by the
   AutoHub Spring Boot API — see api.js. There is no mock catalog here.
   ============================================================================ */

export const CAR_CATEGORIES = [
  { id: "suv",         label: "SUV",         ico: "🚙" },
  { id: "sedan",       label: "Sedan",       ico: "🚗" },
  { id: "hatchback",   label: "Hatchback",   ico: "🚘" },
  { id: "coupe",       label: "Coupe",       ico: "🏎️" },
  { id: "luxury",      label: "Luxury",      ico: "💎" },
  { id: "ev",          label: "Electric",    ico: "⚡" },
  { id: "hybrid",      label: "Hybrid",      ico: "🔋" },
  { id: "offroad",     label: "Off-road",    ico: "⛰️" },
  { id: "convertible", label: "Convertible", ico: "🌤️" },
];

export const BIKE_CATEGORIES = [
  { id: "sports",     label: "Sports",      ico: "🏍️" },
  { id: "cruiser",    label: "Cruiser",     ico: "🛣️" },
  { id: "naked",      label: "Naked",       ico: "🔩" },
  { id: "adventure",  label: "Adventure",   ico: "🧭" },
  { id: "scooter",    label: "Scooter",     ico: "🛵" },
  { id: "commuter",   label: "Commuter",    ico: "🏙️" },
  { id: "electric",   label: "Electric",    ico: "⚡" },
  { id: "touring",    label: "Touring",     ico: "🗺️" },
  { id: "caferacer",  label: "Café Racer",  ico: "☕" },
];

export const CATEGORY_MAP = { car: CAR_CATEGORIES, bike: BIKE_CATEGORIES };

export function catLabel(type, id) {
  const c = (CATEGORY_MAP[type] || []).find(c => c.id === id);
  return c ? c.label : id;
}
