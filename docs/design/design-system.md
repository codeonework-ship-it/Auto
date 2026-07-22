# AutoHub — Design System

> The shared visual language for both **web-app** (public/community) and **control-panel** (admin/back-office). Built on **Bootstrap 5** + react-bootstrap, themed via CSS variables and Sass overrides. Source of truth for scope & stack: [`CANONICAL_SPEC.md`](../../CANONICAL_SPEC.md). Companion: [UX Approach](./ux-approach.md).

---

## 1. Brand Concept

**AutoHub** is the hub where automobile enthusiasts meet the open road — a community platform for cars, bikes, marketplace, and travel. The brand feel is **modern, precision-engineered, and energetic**: think dashboard instrumentation, asphalt and chrome, with a signature electric-cobalt accent that reads as speed and trust.

| Attribute | Expression |
| --- | --- |
| Personality | Confident, technical, welcoming, road-trip-ready |
| Visual metaphor | Instrument cluster + open highway |
| Core accent | **Electric Cobalt** — motion, energy, links & primary actions |
| Support accent | **Signal Amber** — highlights, ratings, warnings |
| Tone in UI | Clean surfaces, strong typographic hierarchy, generous whitespace, purposeful motion |

The two apps share one system. The web-app leans **immersive** (large imagery, hero galleries); the control-panel leans **dense & efficient** (data tables, compact forms) — same tokens, different density.

---

## 2. Color Palette

Two full themes: **Light** (default) and **Dark**. All foreground/background pairings meet WCAG **AA** (≥4.5:1 body text, ≥3:1 large text / UI components).

### Brand / semantic colors

| Token | Hex | Use |
| --- | --- | --- |
| `--ah-cobalt-500` | `#2563EB` | Primary brand / primary buttons / links |
| `--ah-cobalt-600` | `#1D4ED8` | Primary hover/active |
| `--ah-cobalt-300` | `#93C5FD` | Focus rings, subtle accents (on dark) |
| `--ah-amber-500` | `#F59E0B` | Ratings, highlights, warnings |
| `--ah-teal-500` | `#0EA5A4` | Secondary accent, "travel" pillar |
| `--ah-graphite-900` | `#0B1220` | Darkest ink / dark-theme base |
| `--ah-graphite-700` | `#1E293B` | Dark surfaces |
| `--ah-slate-500` | `#64748B` | Muted text, borders |
| `--ah-slate-200` | `#E2E8F0` | Light borders / dividers |
| `--ah-cloud-050` | `#F8FAFC` | Light app background |
| `--ah-white` | `#FFFFFF` | Light surfaces |

### State colors

| Token | Hex | Meaning |
| --- | --- | --- |
| `--ah-success` | `#16A34A` | Success / approved / KYC verified |
| `--ah-warning` | `#D97706` | Pending / caution |
| `--ah-danger` | `#DC2626` | Error / rejected / destructive |
| `--ah-info` | `#0284C7` | Informational |

### Light theme mapping

```css
:root,
:root[data-bs-theme="light"] {
  /* brand */
  --ah-primary: #2563EB;
  --ah-primary-hover: #1D4ED8;
  --ah-accent: #F59E0B;
  --ah-travel: #0EA5A4;

  /* surfaces & text */
  --ah-bg: #F8FAFC;
  --ah-surface: #FFFFFF;
  --ah-surface-2: #F1F5F9;
  --ah-border: #E2E8F0;
  --ah-text: #0B1220;
  --ah-text-muted: #64748B;

  /* states */
  --ah-success: #16A34A;
  --ah-warning: #D97706;
  --ah-danger:  #DC2626;
  --ah-info:    #0284C7;

  /* focus */
  --ah-focus-ring: rgba(37, 99, 235, .45);
}
```

### Dark theme mapping

```css
:root[data-bs-theme="dark"] {
  --ah-primary: #3B82F6;        /* lightened for contrast on dark */
  --ah-primary-hover: #60A5FA;
  --ah-accent: #FBBF24;
  --ah-travel: #2DD4BF;

  --ah-bg: #0B1220;
  --ah-surface: #111A2E;
  --ah-surface-2: #1E293B;
  --ah-border: #334155;
  --ah-text: #E5EAF2;
  --ah-text-muted: #94A3B8;

  --ah-success: #22C55E;
  --ah-warning: #F59E0B;
  --ah-danger:  #F87171;
  --ah-info:    #38BDF8;

  --ah-focus-ring: rgba(96, 165, 250, .55);
}
```

> Theme toggling uses Bootstrap 5.3's native `data-bs-theme` attribute on `<html>`. Our `--ah-*` tokens layer on top so both custom components and Bootstrap components switch together.

---

## 3. Typography

Primary UI typeface: **Inter** (clean, legible at small sizes). Display/brand headings: **Sora** (geometric, technical character). Monospace (IDs, code, VINs): **JetBrains Mono**. Fall back to system stack for resilience.

```css
:root {
  --ah-font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --ah-font-display: "Sora", var(--ah-font-sans);
  --ah-font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
  --ah-line-tight: 1.2;
  --ah-line-body: 1.55;
}
```

### Type scale (1.250 major-third)

| Token | rem / px | Weight | Usage |
| --- | --- | --- | --- |
| `--ah-fs-display` | 3.05rem / 49px | 700 | Marketing hero |
| `--ah-fs-h1` | 2.44rem / 39px | 700 | Page title |
| `--ah-fs-h2` | 1.95rem / 31px | 600 | Section |
| `--ah-fs-h3` | 1.56rem / 25px | 600 | Subsection / card title |
| `--ah-fs-h4` | 1.25rem / 20px | 600 | Group heading |
| `--ah-fs-body` | 1.00rem / 16px | 400 | Body text |
| `--ah-fs-sm` | 0.875rem / 14px | 400 | Secondary / table cells |
| `--ah-fs-xs` | 0.75rem / 12px | 500 | Badges, captions, meta |

- Body line-height 1.55; headings 1.2.
- Max readable measure for long-form (travel blogs): ~68ch.

---

## 4. Spacing, Radius, Elevation

4-px base spacing scale.

| Token | Value | Token | Value |
| --- | --- | --- | --- |
| `--ah-space-1` | 4px | `--ah-space-6` | 32px |
| `--ah-space-2` | 8px | `--ah-space-7` | 40px |
| `--ah-space-3` | 12px | `--ah-space-8` | 48px |
| `--ah-space-4` | 16px | `--ah-space-9` | 64px |
| `--ah-space-5` | 24px | `--ah-space-10` | 80px |

```css
:root {
  --ah-radius-sm: 6px;
  --ah-radius-md: 10px;   /* cards, inputs */
  --ah-radius-lg: 16px;   /* modals, hero panels */
  --ah-radius-pill: 999px;

  --ah-shadow-sm: 0 1px 2px rgba(11,18,32,.06), 0 1px 3px rgba(11,18,32,.10);
  --ah-shadow-md: 0 4px 12px rgba(11,18,32,.10);
  --ah-shadow-lg: 0 12px 32px rgba(11,18,32,.16);
}
```

---

## 5. Bootstrap 5 Theming Approach

We theme Bootstrap **two ways**, layered:

1. **Runtime (CSS variables)** — override Bootstrap's own `--bs-*` variables with our `--ah-*` tokens. Enables live light/dark switching and quick tweaks without a rebuild.
2. **Build-time (Sass overrides)** — set `$primary`, `$font-family-base`, `$border-radius`, the theme map, and `$min-contrast-ratio` before importing Bootstrap. This regenerates utility classes & component defaults on-brand.

### Sass override (build-time) — `styles/_theme.scss`

```scss
// 1) Brand palette
$primary:   #2563EB;
$secondary: #64748B;
$success:   #16A34A;
$warning:   #D97706;
$danger:    #DC2626;
$info:      #0284C7;

// 2) Typography & shape
$font-family-sans-serif: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
$headings-font-family:   "Sora", $font-family-sans-serif;
$border-radius:    .625rem;   // 10px
$border-radius-lg: 1rem;      // 16px

// 3) Accessibility: enforce AA contrast when Bootstrap picks fg on colored bg
$min-contrast-ratio: 4.5;

// 4) Bring in Bootstrap
@import "bootstrap/scss/bootstrap";
```

### Runtime override (CSS variables) — `styles/theme.css`

```css
:root[data-bs-theme="light"] {
  --bs-primary: var(--ah-primary);
  --bs-body-bg: var(--ah-bg);
  --bs-body-color: var(--ah-text);
  --bs-border-color: var(--ah-border);
  --bs-link-color: var(--ah-primary);
  --bs-border-radius: var(--ah-radius-md);
}
:root[data-bs-theme="dark"] {
  --bs-primary: var(--ah-primary);
  --bs-body-bg: var(--ah-bg);
  --bs-body-color: var(--ah-text);
  --bs-border-color: var(--ah-border);
}
```

react-bootstrap components are used for structure; the tokens above restyle them without per-component CSS.

---

## 6. Component Inventory

Shared across both apps unless noted. Each entry lists intent + key variants/states.

### Buttons
- Variants: `primary` (cobalt), `secondary` (slate outline), `accent` (amber), `success`, `danger`, `ghost`/link.
- Sizes: `sm`, `md` (default), `lg`.
- States: default, hover, active, focus-visible (2px ring `--ah-focus-ring`), disabled, loading (spinner + `aria-busy`).

```css
.btn-ah-primary {
  background: var(--ah-primary);
  border-color: var(--ah-primary);
  color: #fff;
  border-radius: var(--ah-radius-md);
  font-weight: 600;
}
.btn-ah-primary:hover { background: var(--ah-primary-hover); }
.btn-ah-primary:focus-visible { box-shadow: 0 0 0 3px var(--ah-focus-ring); outline: none; }
```

### Cards
- Post card (web-app): image thumb, title, make/model badges, rating, price (marketplace), author + meta.
- Uses `--ah-surface`, `--ah-shadow-sm`, `--ah-radius-md`; hover lifts to `--ah-shadow-md`.
- Compact variant for grids; horizontal variant for lists.

### Navbar
- Web-app: brand logo, primary nav (Cars, Bikes, Marketplace, Travel, Community), search, auth/profile menu, theme toggle.
- Control-panel: collapsible sidebar (Masters, Users, Moderation, Marketplace, KYC, Reports) + top bar with breadcrumb, search, admin menu.
- Sticky, translucent-on-scroll on web-app; solid on control-panel.

### Forms
- react-hook-form driven; inputs, selects, textareas, file inputs, toggles, date pickers.
- Label always visible & associated; helper text; inline validation with icon + message; error border `--ah-danger`.
- Grouped in cards/fieldsets with legends.

### Image Gallery (Catalog / Media)
- Grid thumbnail strip + lightbox; supports **up to 20 images**; drag-to-reorder in editor.
- Uploader shows per-file progress, type/size/resolution validation errors (JPEG/PNG/WEBP, ≤5 MB, ≥640×480).
- Lazy-loaded, responsive `srcset`; alt text captured per image.

### Rich-text Editor
- **react-quill** for post & travel-blog bodies; constrained toolbar (headings, bold/italic, lists, links, quote, image, code).
- Output sanitized server-side (XSS-safe); themed to match `--ah-*` tokens.

### Data Tables (Control-panel)
- Sortable columns, pagination, sticky header, row selection, inline row actions, density toggle.
- Zebra striping via `--ah-surface-2`; column filters; empty & loading states.
- Used for Masters, Users, Moderation queue, KYC & listing approvals.

### Badges — roles & KYC status
- **Role badges** (pill): color-coded per RBAC role.
- **KYC / status badges**: state-colored.

| Badge | Color token | Example |
| --- | --- | --- |
| SUPER_ADMIN | graphite-900 / white text | `SUPER_ADMIN` |
| ADMIN | cobalt-500 | `ADMIN` |
| MODERATOR | teal-500 | `MODERATOR` |
| SELLER | amber-500 | `SELLER` |
| BUYER | info | `BUYER` |
| AUTHOR | cobalt-300 | `AUTHOR` |
| MEMBER | slate-500 | `MEMBER` |
| GUEST | slate-200 / dark text | `GUEST` |
| KYC Verified | success | ✓ Verified |
| KYC Pending | warning | ⏳ Pending |
| KYC Rejected | danger | ✕ Rejected |

```css
.badge-kyc-verified { background: var(--ah-success); color:#fff; border-radius: var(--ah-radius-pill); }
.badge-kyc-pending  { background: var(--ah-warning); color:#111; border-radius: var(--ah-radius-pill); }
.badge-kyc-rejected { background: var(--ah-danger);  color:#fff; border-radius: var(--ah-radius-pill); }
```

### Other shared components
- Alerts/toasts (state-colored, dismissible, `role="status"`/`role="alert"`).
- Modals & drawers (`--ah-radius-lg`, focus-trapped).
- Tabs, breadcrumbs, pagination, avatar, rating stars (amber), skeleton loaders, empty-state panels.

---

## 7. Iconography

- Library: **Bootstrap Icons** (ships with the ecosystem; consistent stroke).
- Sizes: 16 / 20 / 24 px; align to text baseline.
- Icons are decorative by default (`aria-hidden="true"`); when an icon is the only content of a control it carries an `aria-label`.
- Domain glyphs: car, bike, road/travel (compass), marketplace (tag), KYC (shield-check), moderation (flag), community (people).

---

## 8. Accessibility (WCAG 2.1 AA)

Baseline for every screen — enforced by the [Definition of Done](../agile/definition-of-done.md).

- **Contrast:** body text ≥4.5:1, large text & UI/icon boundaries ≥3:1. Both themes validated; `$min-contrast-ratio: 4.5` in Sass guards Bootstrap-picked foregrounds.
- **Keyboard:** every interactive element reachable & operable by keyboard; logical tab order; no keyboard traps (modals trap intentionally with escape).
- **Focus:** visible `focus-visible` ring (3px `--ah-focus-ring`) never removed without a replacement.
- **Semantics:** landmark regions (`header`/`nav`/`main`/`footer`), headings in order, buttons vs links used correctly.
- **Forms:** programmatic label association, descriptive errors linked via `aria-describedby`, required state announced.
- **Media:** all images (posts, galleries, avatars) require alt text; galleries expose captions.
- **Motion:** respect `prefers-reduced-motion`; keep animations subtle & non-essential.
- **Color independence:** status never conveyed by color alone — pair with icon/text (e.g., KYC badge shows ✓/⏳/✕).
- **Targets:** interactive hit area ≥44×44px on touch.

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: .001ms !important; transition-duration: .001ms !important; }
}
```

---

## 9. Design Tokens Summary

| Category | Prefix | Examples |
| --- | --- | --- |
| Color | `--ah-*` | `--ah-primary`, `--ah-surface`, `--ah-danger` |
| Typography | `--ah-font-*`, `--ah-fs-*` | `--ah-font-display`, `--ah-fs-h1` |
| Spacing | `--ah-space-*` | `--ah-space-4` (16px) |
| Radius | `--ah-radius-*` | `--ah-radius-md` (10px) |
| Elevation | `--ah-shadow-*` | `--ah-shadow-md` |
| Focus | `--ah-focus-ring` | ring color |

Tokens are the contract: components consume `--ah-*`, Bootstrap consumes `--bs-*` mapped from them. Change a token, both apps update.
