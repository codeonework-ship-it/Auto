# AutoHub — Test Cases

> 60 test cases derived from the acceptance criteria. IDs FIXED (`TC-001`..). Each links to a story. Types: **Functional**, **Negative**, **Security**, **Performance**. Enforced rules (image type/size/resolution, roles, permissions) are FIXED per the Canonical Spec.

## Coverage Summary

| Type | Count |
|---|---|
| Functional | 27 |
| Negative | 21 |
| Security | 9 |
| Performance | 3 |
| **Total** | **60** |

---

## Identity & Authentication (EP-01)

| ID | Story | Title | Preconditions | Steps | Expected Result | Type |
|---|---|---|---|---|---|---|
| TC-001 | US-001 | Successful signup | Email not registered | Submit valid email + strong password | Account created as `MEMBER`; `identity.user.registered` emitted; user logged in | Functional |
| TC-002 | US-001 | Duplicate email signup | Email already exists | Submit signup with existing email | HTTP 409 "Email already in use"; no account created | Negative |
| TC-003 | US-001 | Weak password rejected | On signup form | Submit password "abc" | HTTP 400 with password policy errors | Negative |
| TC-004 | US-001 | Malformed email rejected | On signup form | Submit email "not-an-email" | HTTP 400 "Enter a valid email" | Negative |
| TC-005 | US-002 | Valid login | Active account exists | Enter correct credentials | JWT issued with role/permission claims; dashboard shown | Functional |
| TC-006 | US-002 | Invalid login no enumeration | Account exists | Enter wrong password; then unknown email | Identical generic "Invalid email or password" for both | Security |
| TC-007 | US-002 | Suspended account login blocked | Account suspended | Log in | Blocked "Account suspended"; no working token | Negative |
| TC-008 | US-002 | Logout invalidates session | Logged in | Log out; call protected endpoint | HTTP 401 on protected route after logout | Functional |
| TC-009 | US-004 | Password reset happy path | Registered email | Request reset; open link; set new password | New password works; old fails | Functional |
| TC-010 | US-004 | Expired reset token | Reset link expired | Open expired link | "Request a new link"; reset blocked | Negative |

## RBAC & User Management (EP-02)

| ID | Story | Title | Preconditions | Steps | Expected Result | Type |
|---|---|---|---|---|---|---|
| TC-011 | US-005 | Permission granted path | User has `master:manage` | Call `POST /api/masters/makes` | HTTP 201; master created | Functional |
| TC-012 | US-005 | Permission denied | `MEMBER` lacks `master:manage` | Call masters write endpoint | HTTP 403; no change | Security |
| TC-013 | US-005 | Unauthenticated protected call | No token | Call protected endpoint | HTTP 401 | Security |
| TC-014 | US-005 | UI hides unauthorized controls | User lacks permission | Load app | Controls hidden/disabled; server still enforces | Functional |
| TC-015 | US-006 | Assign role | Admin has `user:manage` | Assign `MODERATOR` to user | User gains moderator permissions after refresh | Functional |
| TC-016 | US-006 | Revoke role removes access | User had `SELLER` | Revoke `SELLER`; user creates listing | HTTP 403 after revocation | Negative |
| TC-017 | US-006 | Unauthorized role change | User lacks `user:manage` | Attempt role change | HTTP 403; management UI hidden | Security |
| TC-018 | US-007 | Map permission to role | `SUPER_ADMIN` | Add `listing:approve` to `MODERATOR` | Moderators can approve listings | Functional |
| TC-019 | US-008 | Banned user blocked from writes | User banned | Attempt to post/comment | HTTP 403 "Account suspended" | Negative |

## Masters & Control-Panel (EP-03)

| ID | Story | Title | Preconditions | Steps | Expected Result | Type |
|---|---|---|---|---|---|---|
| TC-020 | US-009 | Create master | Admin has `master:manage` | Create Make "Yamaha" | Stored; appears in dropdowns | Functional |
| TC-021 | US-009 | Duplicate master rejected | "Yamaha" exists | Create "Yamaha" again | HTTP 409 "Value already exists" | Negative |
| TC-022 | US-009 | Referential-safe delete | Make referenced by posts | Delete the Make | Soft-deleted; historical links intact; hidden from new forms | Functional |
| TC-023 | US-010 | Cascade Make→Model→Variant | Make has Models | Deactivate Make | Its Models/Variants not selectable in new forms | Functional |
| TC-024 | US-011 | Add Report Reason master | Admin has `master:manage` | Add "Spam" reason | Appears in report dialog | Functional |
| TC-025 | US-011 | Add Review Tag master | Admin | Add "Reliable" tag | Selectable when writing a review | Functional |

## Catalog — Car & Bike Posts (EP-04)

| ID | Story | Title | Preconditions | Steps | Expected Result | Type |
|---|---|---|---|---|---|---|
| TC-026 | US-012 | Create car post draft | Authenticated user | Fill masters + rich text; save | Post saved as DRAFT | Functional |
| TC-027 | US-012 | Publish car post | Complete draft | Publish | Status PUBLISHED; `catalog.post.published` emitted | Functional |
| TC-028 | US-012 | Guest cannot create post | Guest session | Attempt create post | Redirected to signup; no post created | Negative |
| TC-029 | US-013 | Create bike post | Category=bike | Create bike post | Only bike-relevant masters shown; filterable as bike | Functional |
| TC-030 | US-014 | Non-author edit blocked | User is not author, no `post:manage` | Attempt edit | HTTP 403 | Security |
| TC-031 | US-015 | Draft not visible to others | Post is DRAFT | Non-owner opens URL | 404/forbidden | Negative |

## Image Upload & Media (EP-05)

| ID | Story | Title | Preconditions | Steps | Expected Result | Type |
|---|---|---|---|---|---|---|
| TC-032 | US-016 | Upload 20 images | New post | Upload 20 valid images | All accepted; each emits `media.image.uploaded` | Functional |
| TC-033 | US-016 | 21st image rejected (batch) | Empty gallery | Select 21 images at once | 21st rejected "Maximum 20 images per post"; 20 proceed | Negative |
| TC-034 | US-016 | 21st image rejected (incremental) | Gallery at 20 | Add 1 more | Rejected "Maximum 20 images per post" | Negative |
| TC-035 | US-017 | Wrong file type rejected | Upload dialog | Upload a GIF / BMP / PDF | Rejected "Unsupported file type. Allowed: JPEG, PNG, WEBP" | Negative |
| TC-036 | US-017 | Oversize file rejected | Upload dialog | Upload 5.1 MB JPEG | Rejected "File exceeds maximum size of 5 MB" | Negative |
| TC-037 | US-017 | Low resolution rejected | Upload dialog | Upload 320×240 image | Rejected "Minimum resolution is 640×480" | Negative |
| TC-038 | US-017 | Exact minimum resolution accepted | Upload dialog | Upload 640×480 image | Accepted | Functional |
| TC-039 | US-017 | Recommended resolution accepted | Upload dialog | Upload 1920×1080 image | Accepted with no warning | Functional |
| TC-040 | US-017 | Server-side revalidation | Bypass client checks via direct API | POST invalid file to media endpoint | Server rejects per type/size/resolution rules | Security |
| TC-041 | US-018 | Reorder & set primary | Multiple images | Drag reorder; set primary | Order persists; primary used as thumbnail | Functional |
| TC-042 | US-019 | Orphaned media cleanup | Abandoned upload past retention | Run cleanup job | Orphaned media removed | Functional |
| TC-043 | US-016 | Concurrent uploads performance | Post open | Upload 20 images concurrently | All complete; p95 per-image < 3s; success rate ≥ 98% | Performance |

## Rich Text (EP-06)

| ID | Story | Title | Preconditions | Steps | Expected Result | Type |
|---|---|---|---|---|---|---|
| TC-044 | US-020 | Formatting preserved | Editor open | Apply headings/bold/lists/links; save | Formatting preserved on render | Functional |
| TC-045 | US-021 | Script tag stripped (XSS) | Editor open | Save `<script>alert(1)</script>` | Script removed; no execution on render | Security |
| TC-046 | US-021 | Event-handler XSS stripped | Editor open | Save `<img src=x onerror=alert(1)>` | `onerror` removed; no execution | Security |
| TC-047 | US-021 | javascript: href neutralized | Editor open | Save link `href="javascript:alert(1)"` | Dangerous href neutralized | Security |

## Reviews & Comments (EP-07)

| ID | Story | Title | Preconditions | Steps | Expected Result | Type |
|---|---|---|---|---|---|---|
| TC-048 | US-022 | Guest blocked from commenting | Guest on post | Focus comment box / click Comment | Redirected to signup; comment not submitted | Negative |
| TC-049 | US-022 | Authenticated comment posts | Logged-in user | Submit comment | Saved, attributed, visible in thread | Functional |
| TC-050 | US-022 | Comment API needs auth | No token | POST comment via API | HTTP 401 | Security |
| TC-051 | US-023 | Review with rating & tags | Authenticated, not yet reviewed | Submit 4★ + tags | Review saved; `engagement.review.added` emitted | Functional |
| TC-052 | US-023 | Duplicate review prevented | User already reviewed | Submit another review | Prompted to edit existing review | Negative |

## Marketplace & KYC (EP-08, EP-09)

| ID | Story | Title | Preconditions | Steps | Expected Result | Type |
|---|---|---|---|---|---|---|
| TC-053 | US-026 | Approved seller creates listing | Seller KYC APPROVED | Create listing with price + specs + images | Saved as DRAFT | Functional |
| TC-054 | US-026 | Listing blocked without KYC | Seller KYC not approved | Attempt to publish listing | Blocked "Complete seller KYC to list" | Negative |
| TC-055 | US-027 | Approve listing | Approver has `listing:approve`; PENDING_REVIEW | Approve | Status ACTIVE; appears in search | Functional |
| TC-056 | US-027 | Reject listing | Policy violation | Reject with reason | Status REJECTED; seller notified | Functional |
| TC-057 | US-027 | Unauthorized approval | User lacks `listing:approve` | Attempt approve | HTTP 403 | Security |
| TC-058 | US-028 | Contact reveal needs buyer KYC | Buyer KYC not approved | Click "Contact seller" | Prompted to complete buyer KYC | Negative |
| TC-059 | US-029 | Seller KYC valid submission | Seller KYC form | Submit required fields + valid docs | KYC created PENDING; cannot list yet | Functional |
| TC-060 | US-029 | KYC missing document rejected | Seller KYC form | Submit without required doc | Field-level validation error; not submitted | Negative |
| TC-061 | US-031 | KYC approval grants role | PENDING KYC; reviewer has `kyc:review` | Approve | Status APPROVED; user granted `SELLER`/`BUYER` | Functional |
| TC-062 | US-031 | KYC rejection with reason | Insufficient docs | Reject with reason | Status REJECTED; user notified; resubmission allowed | Functional |
| TC-063 | US-031 | Unauthorized KYC review | User lacks `kyc:review` | Open KYC queue | Access denied (403/hidden) | Security |

## Moderation & Reporting (EP-15)

| ID | Story | Title | Preconditions | Steps | Expected Result | Type |
|---|---|---|---|---|---|---|
| TC-064 | US-043 | Report content | Authenticated user; Report Reason master exists | Submit report with reason | Report enters moderation queue | Functional |
| TC-065 | US-044 | Hide reported content | Moderator has `content:moderate` | Hide item | Item hidden; action audit-logged | Functional |
| TC-066 | US-044 | Unauthorized moderation | User lacks `content:moderate` | Open queue | Access denied | Security |
| TC-067 | US-045 | Audit trail written | Any moderation action performed | Perform hide/remove | Immutable audit record (actor, action, reason, target, timestamp) | Functional |

## Search & Performance (EP-13)

| ID | Story | Title | Preconditions | Steps | Expected Result | Type |
|---|---|---|---|---|---|---|
| TC-068 | US-038 | Faceted search | Content indexed | Search with facets (Make/Fuel/Location/price) | Relevant ranked results | Functional |
| TC-069 | US-038 | Empty-state search | No matches | Search obscure query | Empty-state with suggestions | Functional |
| TC-070 | US-038 | Search latency under load | 100k posts indexed | Run search at 200 rps | p95 latency < 400 ms | Performance |

---

## Traceability Matrix (Story → Test Cases)

| Story | Test Cases |
|---|---|
| US-001 | TC-001..004 |
| US-002 | TC-005..008 |
| US-004 | TC-009, TC-010 |
| US-005 | TC-011..014 |
| US-006 | TC-015..017 |
| US-007 | TC-018 |
| US-008 | TC-019 |
| US-009 | TC-020..022 |
| US-010 | TC-023 |
| US-011 | TC-024, TC-025 |
| US-012 | TC-026..028 |
| US-013 | TC-029 |
| US-014 | TC-030 |
| US-015 | TC-031 |
| US-016 | TC-032..034, TC-043 |
| US-017 | TC-035..040 |
| US-018 | TC-041 |
| US-019 | TC-042 |
| US-020 | TC-044 |
| US-021 | TC-045..047 |
| US-022 | TC-048..050 |
| US-023 | TC-051, TC-052 |
| US-026 | TC-053, TC-054 |
| US-027 | TC-055..057 |
| US-028 | TC-058 |
| US-029 | TC-059, TC-060 |
| US-031 | TC-061..063 |
| US-043 | TC-064 |
| US-044 | TC-065, TC-066 |
| US-045 | TC-067 |
| US-038 | TC-068..070 |
