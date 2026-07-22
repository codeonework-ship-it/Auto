# AutoHub — Control Panel

Admin back-office for the **AutoHub** platform (Masters, RBAC, user management, KYC,
posts/listing moderation). Part of the AutoHub monorepo.

## Stack

- Vite + React 18, react-router-dom v6
- Bootstrap 5 + react-bootstrap
- axios (JWT interceptors), react-hook-form, react-icons, react-quill

## Getting started

```bash
npm install
cp .env.example .env      # adjust VITE_API_BASE_URL if needed
npm run dev               # http://localhost:5174
```

The dev server proxies `/api` → `http://localhost:8080` (the Spring Boot backend).

## Scripts

| Script            | Purpose                          |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start dev server on port `5174`  |
| `npm run build`   | Production build to `dist/`      |
| `npm run preview` | Preview the production build     |
| `npm run lint`    | Run ESLint                       |

## Environment

| Variable             | Default                          | Notes            |
| -------------------- | -------------------------------- | ---------------- |
| `VITE_API_BASE_URL`  | `http://localhost:8080/api/v1`   | Backend REST API |

## Project structure

```
src/
  api/            axios client + service stubs (auth, users, roles, masters, kyc, …)
  components/     Can, ProtectedRoute, layout/, common/ (DataTable, etc.)
  context/        AuthContext (login/logout, roles, permissions)
  pages/          Dashboard, Login, users/, rbac/, masters/, kyc/, moderation/, …
  theme/          admin.css (light + dark, dense tables)
```

## RBAC

Routes and sidebar links are gated by permission (`resource:action`). Use:

- `<ProtectedRoute permission="user:manage">` to guard a route.
- `<Can permission="master:manage">…</Can>` to gate UI elements.

`SUPER_ADMIN` implicitly holds every permission. Roles: `SUPER_ADMIN`, `ADMIN`,
`MODERATOR`, `SELLER`, `BUYER`, `AUTHOR`, `MEMBER`, `GUEST`.

## Masters

A single generic CRUD screen (`pages/masters/MasterCrud.jsx`) is driven by
`pages/masters/mastersConfig.js`, which registers every master: Vehicle Make, Model,
Variant, Fuel Type, Body Type, Transmission, Category, City, Currency, Tour Category,
Review Tag, Report Reason, Role, Permission.

## Docker

```bash
docker build -t autohub-control-panel .
docker run -p 8090:80 autohub-control-panel
```

Multi-stage build: Node builds the SPA, nginx serves it on port `80` and proxies
`/api` to the `backend` service.

> Note: pages currently fall back to sample data when the backend is unavailable, so
> the UI is fully browsable before the API is wired up.
