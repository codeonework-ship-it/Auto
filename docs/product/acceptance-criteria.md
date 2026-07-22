# AutoHub — Consolidated Acceptance Criteria

> Detailed, testable Given/When/Then acceptance criteria for the 15 most critical user stories. These are the authoritative behavioral contracts used to derive test cases in [`test-cases.md`](./test-cases.md). Rules (image limits, roles, permissions) are FIXED per the Canonical Spec.

## Index of Critical Stories

| # | Story | Title | Epic |
|---|---|---|---|
| 1 | US-001 | Register with email and password | EP-01 |
| 2 | US-002 | Log in and log out | EP-01 |
| 3 | US-005 | RBAC enforcement on APIs | EP-02 |
| 4 | US-006 | Assign roles to users | EP-02 |
| 5 | US-009 | Masters CRUD | EP-03 |
| 6 | US-012 | Create a car post | EP-04 |
| 7 | US-016 | Upload up to 20 images | EP-05 |
| 8 | US-017 | Enforce image type/size/resolution | EP-05 |
| 9 | US-021 | Sanitize rich text against XSS | EP-06 |
| 10 | US-022 | Comment requires signup | EP-07 |
| 11 | US-026 | Create marketplace listing | EP-08 |
| 12 | US-027 | Listing lifecycle & approval | EP-08 |
| 13 | US-029 | Submit seller KYC | EP-09 |
| 14 | US-031 | Review/decide KYC | EP-09 |
| 15 | US-044 | Moderate report queue | EP-15 |

---

## AC-1 — US-001: Register with email and password

**Scenario 1.1 — Successful registration**
- **Given** I am a Guest and provide an unregistered, valid email and a password meeting policy (≥8 chars, upper, lower, digit)
- **When** I submit the signup form
- **Then** an account is created with default role `MEMBER`
- **And** a domain event `identity.user.registered` is written to the Outbox in the same transaction
- **And** I am logged in (or prompted to log in) and see a welcome state.

**Scenario 1.2 — Duplicate email**
- **Given** an email already registered
- **When** I submit signup
- **Then** the response is HTTP 409 with message "Email already in use"
- **And** no new account or event is created.

**Scenario 1.3 — Weak password**
- **Given** a password failing policy
- **When** I submit
- **Then** the response is HTTP 400 with field-level errors describing the exact rule violated.

**Scenario 1.4 — Malformed email**
- **Given** an email like `not-an-email`
- **When** I submit
- **Then** the response is HTTP 400 "Enter a valid email".

---

## AC-2 — US-002: Log in and log out

**Scenario 2.1 — Valid login**
- **Given** correct credentials for an active account
- **When** I log in
- **Then** I receive a signed JWT with role/permission claims and land on my dashboard.

**Scenario 2.2 — Invalid credentials (no enumeration)**
- **Given** a wrong password or unknown email
- **When** I log in
- **Then** the response is a generic "Invalid email or password" (identical for both cases).

**Scenario 2.3 — Suspended account**
- **Given** a suspended/banned account
- **When** I log in
- **Then** I am blocked with "Account suspended" and receive no working session token.

**Scenario 2.4 — Logout**
- **Given** an active session
- **When** I log out
- **Then** the client token is discarded and subsequent protected requests return HTTP 401.

---

## AC-3 — US-005: RBAC enforcement on APIs

**Scenario 3.1 — Permission granted**
- **Given** a user whose role includes `master:manage`
- **When** they call `POST /api/masters/makes`
- **Then** the request succeeds (HTTP 201).

**Scenario 3.2 — Permission denied**
- **Given** a `MEMBER` lacking `master:manage`
- **When** they call `POST /api/masters/makes`
- **Then** the response is HTTP 403 and no data is changed.

**Scenario 3.3 — Unauthenticated**
- **Given** no valid token
- **When** a protected endpoint is called
- **Then** the response is HTTP 401.

**Scenario 3.4 — UI hiding**
- **Given** a user lacking a permission
- **When** they load the app
- **Then** controls requiring that permission are hidden/disabled (defense in depth; server still enforces).

**Scenario 3.5 — Stale token after revocation**
- **Given** a permission removed from a user's role
- **When** their current token is used after expiry/refresh
- **Then** the removed permission no longer grants access.

---

## AC-4 — US-006: Assign roles to users

**Scenario 4.1 — Assign role**
- **Given** an admin with `user:manage`
- **When** they assign `MODERATOR` to a user
- **Then** the user's effective permissions include moderator permissions after next token refresh.

**Scenario 4.2 — Revoke role**
- **Given** a user with `SELLER`
- **When** the admin revokes it
- **Then** seller-only actions (create listing) return HTTP 403 afterward.

**Scenario 4.3 — Unauthorized attempt**
- **Given** a user without `user:manage`
- **When** they attempt to change roles
- **Then** the endpoint returns HTTP 403 and the UI does not expose role management.

---

## AC-5 — US-009: Masters CRUD

**Scenario 5.1 — Create master**
- **Given** an admin with `master:manage`
- **When** they create Vehicle Make "Yamaha"
- **Then** it is stored and available in dependent dropdowns.

**Scenario 5.2 — Duplicate value**
- **Given** an existing Make "Yamaha"
- **When** the admin creates "Yamaha" again in the same scope
- **Then** the response is HTTP 409 "Value already exists".

**Scenario 5.3 — Referential-safe delete**
- **Given** a Make referenced by existing posts/listings
- **When** the admin deletes it
- **Then** it is deactivated (soft delete), remains linked to historical records, and is hidden from new-entry dropdowns.

**Scenario 5.4 — Cascade dependency**
- **Given** a Make is deactivated
- **When** a user opens a new post form
- **Then** that Make and its Models/Variants are not selectable.

---

## AC-6 — US-012: Create a car post

**Scenario 6.1 — Draft creation**
- **Given** an authenticated user selecting valid Make/Model/Variant/Fuel/Body/Transmission and writing content
- **When** they save
- **Then** the post is stored as DRAFT owned by them.

**Scenario 6.2 — Publish**
- **Given** a complete draft
- **When** the author publishes
- **Then** status becomes PUBLISHED and `catalog.post.published` is emitted via the Outbox.

**Scenario 6.3 — Guest blocked**
- **Given** a Guest
- **When** they attempt to create a post
- **Then** they are redirected to signup and no post is created.

**Scenario 6.4 — Missing required masters**
- **Given** a form missing a required Master selection
- **When** they save
- **Then** field-level validation errors are shown.

---

## AC-7 — US-016: Upload up to 20 images

**Scenario 7.1 — Within limit**
- **Given** a post with 18 images
- **When** the author adds 2 valid images
- **Then** all 20 are accepted and each emits `media.image.uploaded`.

**Scenario 7.2 — Exceeds limit (single batch)**
- **Given** an empty gallery
- **When** the author selects 21 images at once
- **Then** the 21st is rejected with "Maximum 20 images per post" and the first 20 valid ones proceed.

**Scenario 7.3 — Exceeds limit (incremental)**
- **Given** a post already at 20 images
- **When** the author adds 1 more
- **Then** it is rejected with "Maximum 20 images per post".

**Scenario 7.4 — Ordering preserved**
- **Given** uploaded images
- **When** the gallery renders
- **Then** images display in upload/user-defined order with a designated primary.

---

## AC-8 — US-017: Enforce image type, size, resolution

**Scenario 8.1 — Unsupported type**
- **Given** a GIF, BMP, PDF, or SVG file
- **When** uploaded
- **Then** it is rejected with "Unsupported file type. Allowed: JPEG, PNG, WEBP" (HTTP 400 / client validation).

**Scenario 8.2 — Oversize file**
- **Given** a JPEG of 5.1 MB
- **When** uploaded
- **Then** it is rejected with "File exceeds maximum size of 5 MB".

**Scenario 8.3 — Below minimum resolution**
- **Given** an image of 320×240
- **When** uploaded
- **Then** it is rejected with "Minimum resolution is 640×480".

**Scenario 8.4 — Exactly minimum**
- **Given** an image of exactly 640×480
- **When** uploaded
- **Then** it is accepted.

**Scenario 8.5 — Recommended resolution**
- **Given** an image ≥ 1280×720
- **When** uploaded
- **Then** it is accepted with no resolution warning.

**Scenario 8.6 — Server-side revalidation**
- **Given** a client that bypasses front-end checks
- **When** the file reaches the API
- **Then** the server DTO validators re-enforce type, size, and resolution and reject invalid files.

---

## AC-9 — US-021: Sanitize rich text against XSS

**Scenario 9.1 — Script stripped**
- **Given** content containing `<script>alert('x')</script>`
- **When** saved
- **Then** the script tag is removed; benign text is retained.

**Scenario 9.2 — Event handler stripped**
- **Given** `<img src=x onerror="steal()">`
- **When** saved
- **Then** the `onerror` handler is removed; a safe `<img>` (or nothing) remains.

**Scenario 9.3 — Dangerous protocol**
- **Given** a link with `href="javascript:..."`
- **When** saved
- **Then** the dangerous href is neutralized.

**Scenario 9.4 — Render safety**
- **Given** sanitized content
- **When** rendered to any viewer
- **Then** no injected script executes (verified via automated security test).

---

## AC-10 — US-022: Comment requires signup

**Scenario 10.1 — Guest blocked at intent**
- **Given** a Guest viewing a post
- **When** they focus the comment field or click "Comment"
- **Then** they are redirected to signup/login; the comment is not submitted.

**Scenario 10.2 — Authenticated comment**
- **Given** a signed-in user
- **When** they submit a comment
- **Then** it is saved, attributed to them, and appears in the thread.

**Scenario 10.3 — API enforcement**
- **Given** a direct API call to create a comment without a valid token
- **When** received
- **Then** the response is HTTP 401.

**Scenario 10.4 — Banned user**
- **Given** a suspended user
- **When** they attempt to comment
- **Then** the response is HTTP 403 "Account suspended".

---

## AC-11 — US-026: Create marketplace listing

**Scenario 11.1 — Approved seller creates draft**
- **Given** a seller with APPROVED seller KYC
- **When** they create a listing with price (Currency master), specs, and valid images
- **Then** it saves as DRAFT.

**Scenario 11.2 — Submit for review**
- **Given** a complete draft
- **When** submitted
- **Then** status becomes PENDING_REVIEW and `marketplace.listing.created` is emitted.

**Scenario 11.3 — KYC gate**
- **Given** a user without APPROVED seller KYC
- **When** they attempt to publish a listing
- **Then** they are blocked with "Complete seller KYC to list".

**Scenario 11.4 — Validation**
- **Given** missing price or required specs
- **When** submitted
- **Then** field-level validation errors are shown.

---

## AC-12 — US-027: Listing lifecycle & approval

**Lifecycle:** `DRAFT → PENDING_REVIEW → ACTIVE → SOLD | EXPIRED`, with `PENDING_REVIEW → REJECTED`.

**Scenario 12.1 — Approve**
- **Given** a PENDING_REVIEW listing and an approver with `listing:approve`
- **When** they approve
- **Then** status becomes ACTIVE and it appears in search/feed.

**Scenario 12.2 — Reject**
- **Given** a policy-violating listing
- **When** the approver rejects with a reason
- **Then** status becomes REJECTED and the seller is notified with the reason.

**Scenario 12.3 — Mark sold**
- **Given** an ACTIVE listing
- **When** the seller marks it SOLD
- **Then** it is removed from active search and the transition is recorded.

**Scenario 12.4 — Expiry**
- **Given** an ACTIVE listing past expiry
- **When** the scheduled job runs
- **Then** status becomes EXPIRED and it leaves active search.

**Scenario 12.5 — Unauthorized approval**
- **Given** a user without `listing:approve`
- **When** they attempt to approve
- **Then** HTTP 403 is returned.

---

## AC-13 — US-029: Submit seller KYC

**Scenario 13.1 — Valid submission**
- **Given** the seller KYC form with all required fields and valid documents (JPEG/PNG/WEBP/PDF as configured, ≤5 MB)
- **When** submitted
- **Then** a KYC record is created with status PENDING and the user cannot yet list.

**Scenario 13.2 — Missing document**
- **Given** a required document not provided
- **When** submitted
- **Then** submission is blocked with field-level errors.

**Scenario 13.3 — Invalid document file**
- **Given** an oversize or wrong-type document
- **When** submitted
- **Then** it is rejected with a clear validation error.

**Scenario 13.4 — Locked after submission**
- **Given** a PENDING KYC
- **When** the user revisits
- **Then** locked fields are read-only and status shows PENDING.

---

## AC-14 — US-031: Review/decide KYC

**Scenario 14.1 — Approve**
- **Given** a PENDING KYC and a reviewer with `kyc:review`
- **When** they approve
- **Then** status becomes APPROVED and the user is granted `SELLER` (or `BUYER`) capabilities.

**Scenario 14.2 — Reject with reason**
- **Given** insufficient/invalid documents
- **When** the reviewer rejects with a reason
- **Then** status becomes REJECTED, the user is notified, and resubmission is allowed.

**Scenario 14.3 — Unauthorized reviewer**
- **Given** a user without `kyc:review`
- **When** they open the KYC queue
- **Then** access is denied (HTTP 403 / hidden UI).

**Scenario 14.4 — Audit**
- **Given** any KYC decision
- **When** made
- **Then** an audit record captures reviewer, decision, reason, and timestamp.

---

## AC-15 — US-044: Moderate report queue

**Scenario 15.1 — Hide reported content**
- **Given** a moderator with `content:moderate` and a queued report
- **When** they hide the content
- **Then** it is no longer visible to users and the action is audit-logged.

**Scenario 15.2 — Remove and notify**
- **Given** a policy-violating item
- **When** the moderator removes it
- **Then** the content is removed, the author notified, and replies show a placeholder.

**Scenario 15.3 — Escalate to suspension**
- **Given** repeated violations by a user
- **When** the moderator escalates with `user:suspend`
- **Then** the user is suspended and can no longer perform write actions.

**Scenario 15.4 — Unauthorized moderation**
- **Given** a user without `content:moderate`
- **When** they open the queue
- **Then** access is denied.

**Scenario 15.5 — Audit trail**
- **Given** any moderation action
- **When** performed
- **Then** an immutable audit record (actor, action, reason, target, timestamp) is written.
