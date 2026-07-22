# AutoHub — Web App (public/community)

The public-facing React app for **AutoHub**, a community platform for cars, bikes,
travel, and a KYC-backed marketplace. This is the `web-app` in the AutoHub monorepo
(the admin `control-panel` is a separate app).

## Tech stack

- **Vite** + **React 18**
- **react-router-dom v6** for routing
- **Bootstrap 5** + **react-bootstrap** for UI
- **axios** for API calls (JWT bearer via interceptors)
- **react-hook-form** for forms
- **react-quill** for the rich text editor
- **react-icons** for iconography

## Product pillars

1. **Cars & Bikes** — posts with up to 20 images, reviews, and comments.
2. **Travel** — travel blog and tour guides.
3. **Community** — groups and follows.
4. **Marketplace** — buy/sell listings with KYC-verified sellers.
5. **Trust & RBAC** — role-based access (admin features live in the control-panel app).

## Getting started

```bash
npm install          # install dependencies
cp .env.example .env # configure the API base URL
npm run dev          # start dev server on http://localhost:5173
```

The dev server proxies `/api` to the backend at `http://localhost:8080`.

### Scripts

| Script            | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start Vite dev server on port **5173**       |
| `npm run build`   | Production build to `dist/`                   |
| `npm run preview` | Preview the production build on port 5173     |
| `npm run lint`    | Run ESLint                                    |

## Environment variables

Only variables prefixed with `VITE_` are exposed to the client.

| Variable             | Default                              | Description            |
| -------------------- | ------------------------------------ | ---------------------- |
| `VITE_API_BASE_URL`  | `http://localhost:8080/api/v1`       | Backend REST base URL  |
| `VITE_APP_NAME`      | `AutoHub`                            | Display name           |

## Image upload rules

Enforced client-side in `src/components/upload/ImageUploader.jsx` and again by the backend:

- Max **20** images per post.
- Allowed types: **JPEG, PNG, WEBP**.
- Max size **5 MB** each.
- Min resolution **640x480** (recommended 1280x720+).

## Rich text & sanitization

`src/components/editor/RichTextEditor.jsx` wraps react-quill with a restricted toolbar.
Quill produces HTML — the **backend must sanitize** submitted HTML (allowlist) before
persisting or serving it. If HTML is ever rendered client-side, run it through DOMPurify.

## Authentication

`src/context/AuthContext.jsx` exposes `login`, `register`, `logout`, the current `user`,
and `roles`. The JWT is stored in `localStorage` and attached to requests by the axios
interceptor in `src/api/client.js`. Protected routes use `ProtectedRoute` (optionally
role-gated). Reading is public; **commenting/reviewing requires a signed-up member**.

## Project structure

```
web-app/
├─ public/favicon.svg
├─ index.html
├─ vite.config.js         # port 5173, /api -> :8080 proxy
├─ Dockerfile             # node build -> nginx serve on 80
├─ nginx.conf             # SPA history fallback + /api proxy
├─ .env.example
└─ src/
   ├─ main.jsx            # bootstrap css + quill css + theme
   ├─ App.jsx             # routes
   ├─ theme/theme.css     # design-system CSS variables (light + dark)
   ├─ api/                # axios client + service stubs
   ├─ context/            # AuthContext
   ├─ components/
   │  ├─ layout/          # Navbar, Footer, ProtectedRoute
   │  ├─ common/          # Loader, EmptyState, RoleBadge
   │  ├─ upload/          # ImageUploader (20-image, validated)
   │  └─ editor/          # RichTextEditor (react-quill)
   └─ pages/              # Home, Login, Register, feeds, details, etc.
```

## Docker

```bash
docker build -t autohub-web-app .
docker run -p 8080:80 autohub-web-app   # served by nginx on container port 80
```

> **Note:** In the monorepo, database passwords are committed only for local/dev
> convenience. Production must use a secrets manager.
