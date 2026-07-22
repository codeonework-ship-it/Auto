# REST API Contracts

All AutoHub APIs are served by the backend at base path `/api/v1` on port **8080**. Requests and
responses are JSON (except multipart image upload). Authentication is via a **Bearer JWT** access
token; authorization is via RBAC permissions in `resource:action` form (see [rbac.md](rbac.md)).

Common conventions:

- **Auth column** lists the permission (or `Public`) required. Any authenticated user is noted as
  `Authenticated`.
- Timestamps are ISO-8601 UTC. IDs are UUIDs unless a master (numeric).
- List endpoints support `?page`, `?size`, `?sort`, and resource-specific filters; they return a
  paged envelope `{ content, page, size, totalElements, totalPages }`.
- Standard status codes: `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`
  (validation), `401 Unauthorized` (missing/invalid token), `403 Forbidden` (missing permission),
  `404 Not Found`, `409 Conflict`, `422 Unprocessable Entity`, `429 Too Many Requests`.

## 1. Auth

| Method | Path | Auth | Request body | Response | Status |
|--------|------|------|--------------|----------|--------|
| POST | `/api/v1/auth/signup` | Public | `{ email, password, displayName }` | `{ userId, email, displayName }` | 201, 400, 409 |
| POST | `/api/v1/auth/login` | Public | `{ email, password }` | `{ accessToken, refreshToken, expiresIn, roles }` | 200, 400, 401 |
| POST | `/api/v1/auth/refresh` | Public (refresh token) | `{ refreshToken }` | `{ accessToken, expiresIn }` | 200, 401 |
| POST | `/api/v1/auth/logout` | Authenticated | `{ refreshToken }` | — | 204, 401 |
| GET | `/api/v1/auth/me` | Authenticated | — | `{ userId, email, displayName, roles, permissions }` | 200, 401 |

## 2. Users

| Method | Path | Auth | Request body | Response | Status |
|--------|------|------|--------------|----------|--------|
| GET | `/api/v1/users` | `user:manage` | — (filters: `q`, `role`, `status`) | Paged `UserSummary[]` | 200, 401, 403 |
| GET | `/api/v1/users/{id}` | `user:manage` or self | — | `UserDetail` | 200, 403, 404 |
| PATCH | `/api/v1/users/{id}` | `user:manage` or self | `{ displayName?, status? }` | `UserDetail` | 200, 400, 403, 404 |
| POST | `/api/v1/users/{id}/roles` | `user:manage` | `{ roleCode }` | `UserDetail` | 200, 400, 403, 404 |
| DELETE | `/api/v1/users/{id}/roles/{roleCode}` | `user:manage` | — | `UserDetail` | 200, 403, 404 |

## 3. Roles & Permissions

| Method | Path | Auth | Request body | Response | Status |
|--------|------|------|--------------|----------|--------|
| GET | `/api/v1/roles` | `master:manage` | — | `Role[]` | 200, 403 |
| POST | `/api/v1/roles` | `master:manage` | `{ code, name, description }` | `Role` | 201, 400, 403, 409 |
| GET | `/api/v1/permissions` | `master:manage` | — | `Permission[]` | 200, 403 |
| PUT | `/api/v1/roles/{code}/permissions` | `master:manage` | `{ permissionCodes: string[] }` | `Role` | 200, 400, 403, 404 |

## 4. Masters

Generic CRUD applies to each master resource `{master}` in:
`makes`, `models`, `variants`, `fuel-types`, `body-types`, `transmissions`, `categories`,
`cities`, `currencies`, `tour-categories`, `review-tags`, `report-reasons`.

| Method | Path | Auth | Request body | Response | Status |
|--------|------|------|--------------|----------|--------|
| GET | `/api/v1/masters/{master}` | Public (read) | filters: `q`, `active` | Paged `MasterItem[]` | 200 |
| GET | `/api/v1/masters/{master}/{id}` | Public | — | `MasterItem` | 200, 404 |
| POST | `/api/v1/masters/{master}` | `master:manage` | `{ name, ...typeSpecific, active }` | `MasterItem` | 201, 400, 403, 409 |
| PUT | `/api/v1/masters/{master}/{id}` | `master:manage` | `{ name, ..., active }` | `MasterItem` | 200, 400, 403, 404 |
| DELETE | `/api/v1/masters/{master}/{id}` | `master:manage` | — | — | 204, 403, 404, 409 |

Hierarchy filters: `GET /api/v1/masters/models?makeId=`, `GET /api/v1/masters/variants?modelId=`.

## 5. Posts (Catalog)

| Method | Path | Auth | Request body | Response | Status |
|--------|------|------|--------------|----------|--------|
| GET | `/api/v1/posts` | Public | filters: `category`, `makeId`, `modelId`, `cityId`, `q` | Paged `PostSummary[]` | 200 |
| GET | `/api/v1/posts/{id}` | Public | — | `PostDetail` | 200, 404 |
| POST | `/api/v1/posts` | `post:create` | `PostRequest` (see example) | `PostDetail` | 201, 400, 401, 403 |
| PUT | `/api/v1/posts/{id}` | `post:update` (author) | `PostRequest` | `PostDetail` | 200, 400, 403, 404 |
| POST | `/api/v1/posts/{id}/publish` | `post:create` (author) | — | `PostDetail` (status=PUBLISHED) | 200, 403, 404, 422 |
| DELETE | `/api/v1/posts/{id}` | `post:delete` or `moderate:content` | — | — | 204, 403, 404 |

## 6. Image Upload (Media) — Multipart

Images are uploaded per post. The endpoint enforces the fixed upload rules.

| Method | Path | Auth | Request | Response | Status |
|--------|------|------|---------|----------|--------|
| POST | `/api/v1/posts/{postId}/images` | `post:update` (author) | `multipart/form-data` | `PostImage[]` | 201, 400, 403, 404, 413, 422 |
| DELETE | `/api/v1/posts/{postId}/images/{imageId}` | `post:update` (author) | — | — | 204, 403, 404 |
| PATCH | `/api/v1/posts/{postId}/images/order` | `post:update` (author) | `{ order: [imageId...] }` | `PostImage[]` | 200, 400, 403, 404 |

**Multipart contract for upload:**

- Field name: `files` (repeatable, one part per image).
- **Max 20 images per post** (across all uploads; the endpoint rejects the request if it would
  exceed 20 total). Enforced in the DTO validator and the domain aggregate.
- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`. Others → `422`.
- **Max size:** 5 MB per file → oversize returns `413 Payload Too Large` (or `422` with detail).
- **Min resolution:** 640x480 (width x height). Smaller → `422`. Recommended 1280x720 or higher.
- Each rejected file returns a clear per-file validation error; valid files in the same request
  may still be accepted (partial success reported in the response).

Validation error example (`422`):

```json
{
  "error": "IMAGE_VALIDATION_FAILED",
  "message": "One or more images were rejected",
  "details": [
    { "filename": "front.gif",  "reason": "UNSUPPORTED_TYPE", "allowed": ["image/jpeg","image/png","image/webp"] },
    { "filename": "wide.jpg",   "reason": "RESOLUTION_TOO_LOW", "min": "640x480", "actual": "500x400" },
    { "filename": "huge.png",   "reason": "FILE_TOO_LARGE", "maxBytes": 5242880, "actualBytes": 8912345 },
    { "filename": "extra21.jpg","reason": "MAX_IMAGES_EXCEEDED", "max": 20, "current": 20 }
  ]
}
```

## 7. Reviews (Engagement)

| Method | Path | Auth | Request body | Response | Status |
|--------|------|------|--------------|----------|--------|
| GET | `/api/v1/posts/{postId}/reviews` | Public | — | Paged `Review[]` | 200, 404 |
| POST | `/api/v1/posts/{postId}/reviews` | `review:create` (Authenticated) | `{ rating, bodyHtml }` | `Review` | 201, 400, 401, 403, 404 |
| DELETE | `/api/v1/reviews/{id}` | author or `moderate:content` | — | — | 204, 403, 404 |

## 8. Comments (Engagement)

Commenting **requires a signed-in account** (see [security-kyc.md](security-kyc.md#signup-required-to-comment)).

| Method | Path | Auth | Request body | Response | Status |
|--------|------|------|--------------|----------|--------|
| GET | `/api/v1/posts/{postId}/comments` | Public | — | Paged `Comment[]` | 200, 404 |
| POST | `/api/v1/posts/{postId}/comments` | `comment:create` (Authenticated) | `{ bodyHtml, parentId? }` | `Comment` | 201, 400, 401, 403, 404 |
| DELETE | `/api/v1/comments/{id}` | author or `moderate:content` | — | — | 204, 403, 404 |

## 9. Marketplace Listings

| Method | Path | Auth | Request body | Response | Status |
|--------|------|------|--------------|----------|--------|
| GET | `/api/v1/listings` | Public | filters: `cityId`, `makeId`, `priceMin/Max`, `status` | Paged `ListingSummary[]` | 200 |
| GET | `/api/v1/listings/{id}` | Public | — | `ListingDetail` | 200, 404 |
| POST | `/api/v1/listings` | `listing:create` (SELLER, KYC APPROVED) | `{ postId, price, currencyId, cityId }` | `ListingDetail` | 201, 400, 403, 404, 409 |
| POST | `/api/v1/listings/{id}/approve` | `listing:approve` | — | `ListingDetail` | 200, 403, 404 |
| POST | `/api/v1/listings/{id}/offers` | `offer:create` (BUYER) | `{ amount }` | `Offer` | 201, 400, 403, 404 |
| PATCH | `/api/v1/offers/{id}` | seller (owner) | `{ status }` (ACCEPTED/REJECTED) | `Offer` | 200, 400, 403, 404 |

## 10. KYC (Identity)

| Method | Path | Auth | Request body | Response | Status |
|--------|------|------|--------------|----------|--------|
| GET | `/api/v1/kyc/me` | Authenticated | — | `KycProfile` | 200, 401, 404 |
| POST | `/api/v1/kyc` | Authenticated | `{ kycType, legalName, documentType, documentNumber }` | `KycProfile` (DRAFT) | 201, 400, 401, 409 |
| POST | `/api/v1/kyc/{id}/documents` | owner | `multipart/form-data` (document image/PDF) | `KycProfile` | 200, 400, 403, 404, 422 |
| POST | `/api/v1/kyc/{id}/submit` | owner | — | `KycProfile` (SUBMITTED) | 200, 403, 404, 422 |
| GET | `/api/v1/kyc` | `kyc:review` | filters: `status` | Paged `KycProfile[]` | 200, 403 |
| POST | `/api/v1/kyc/{id}/approve` | `kyc:review` | `{ note? }` | `KycProfile` (APPROVED) | 200, 403, 404 |
| POST | `/api/v1/kyc/{id}/reject` | `kyc:review` | `{ note }` | `KycProfile` (REJECTED) | 200, 400, 403, 404 |

## 11. Travel & Tours

| Method | Path | Auth | Request body | Response | Status |
|--------|------|------|--------------|----------|--------|
| GET | `/api/v1/travel-posts` | Public | filters: `cityId`, `tourId`, `q` | Paged `TravelPostSummary[]` | 200 |
| GET | `/api/v1/travel-posts/{id}` | Public | — | `TravelPostDetail` | 200, 404 |
| POST | `/api/v1/travel-posts` | `travel:create` (AUTHOR) | `{ title, bodyHtml, cityId, tourId? }` | `TravelPostDetail` | 201, 400, 403 |
| GET | `/api/v1/tours` | Public | filters: `cityId`, `tourCategoryId` | Paged `TourSummary[]` | 200 |
| POST | `/api/v1/tours` | `tour:create` (AUTHOR/guide) | `{ title, descriptionHtml, cityId, tourCategoryId, price, currencyId }` | `TourDetail` | 201, 400, 403 |
| POST | `/api/v1/tours/{id}/publish` | `tour:create` (owner) | — | `TourDetail` | 200, 403, 404 |

## Example — Create a car post

Request:

```http
POST /api/v1/posts HTTP/1.1
Host: localhost:8080
Authorization: Bearer <accessToken>
Content-Type: application/json
```
```json
{
  "category": "car",
  "makeId": 12,
  "modelId": 240,
  "variantId": 5511,
  "bodyTypeId": 3,
  "cityId": 101,
  "title": "2023 Sedan — 12,000 km long-term review",
  "bodyHtml": "<p>After six months and 12,000 km...</p>"
}
```

Response `201 Created`:

```json
{
  "id": "b2c3d4e5-0000-4a1b-8c2d-1122334455aa",
  "authorId": "a1b2c3d4-1111-4a1b-8c2d-99887766aabb",
  "category": "car",
  "makeId": 12,
  "modelId": 240,
  "variantId": 5511,
  "bodyTypeId": 3,
  "cityId": 101,
  "title": "2023 Sedan — 12,000 km long-term review",
  "bodyHtml": "<p>After six months and 12,000 km...</p>",
  "status": "DRAFT",
  "imageCount": 0,
  "createdAt": "2026-07-22T09:40:55Z",
  "updatedAt": "2026-07-22T09:40:55Z"
}
```

## Example — Login

Request:

```json
POST /api/v1/auth/login
{ "email": "seller@example.com", "password": "S3cure!pass" }
```

Response `200 OK`:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "def50200a1b2c3...",
  "expiresIn": 900,
  "roles": ["SELLER", "MEMBER"]
}
```

## Related Documents

- [rbac.md](rbac.md)
- [security-kyc.md](security-kyc.md)
- [data-model-erd.md](data-model-erd.md)
