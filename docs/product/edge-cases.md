# AutoHub — Edge Cases & System Behavior

> Catalog of edge cases grouped by theme, with the expected system behavior for each. These complement the acceptance criteria and drive negative/security/performance test coverage in [`test-cases.md`](./test-cases.md). Enforced rules are FIXED per the Canonical Spec.

## Legend

| Severity | Meaning |
|---|---|
| **Critical** | Data loss, security breach, or transaction integrity risk |
| **High** | Broken core flow or trust impact |
| **Medium** | Degraded experience, recoverable |
| **Low** | Cosmetic or rare |

---

## 1. Concurrency

| # | Edge Case | Expected System Behavior | Severity |
|---|---|---|---|
| 1.1 | Two admins edit the same master record simultaneously | Optimistic locking (version column); the later save fails with HTTP 409 and prompts a reload | High |
| 1.2 | Author edits a post while a moderator hides it | Moderation action wins; the author's save is rejected with "This content is under moderation" | High |
| 1.3 | Two buyers reveal contact on the last-second-sold listing | Contact reveal checks live listing status; if SOLD, reveal is refused with "Listing no longer available" | Medium |
| 1.4 | Seller marks listing SOLD while an approver is approving it | State machine enforces valid transitions; conflicting transition returns 409, queue refreshes | Medium |
| 1.5 | Concurrent role changes to the same user | Last write wins with audit entries for each; effective permissions recomputed on next token refresh | Medium |
| 1.6 | Simultaneous KYC approve and reject by two reviewers | First decision locks the record; second reviewer sees "Already decided" | High |

## 2. Duplicate & Repeated Actions

| # | Edge Case | Expected System Behavior | Severity |
|---|---|---|---|
| 2.1 | User double-clicks "Publish post" | Idempotency key / disabled button prevents duplicate posts; only one is created | Medium |
| 2.2 | Duplicate listing for the same vehicle | Soft duplicate detection warns the seller; allowed but flagged for moderation if identical images/VIN | Medium |
| 2.3 | User submits the same review twice | Unique (user, post) constraint; second attempt routes to "edit existing review" | Medium |
| 2.4 | Duplicate master value (e.g., Make "Honda" twice) | Uniqueness constraint returns HTTP 409 | Medium |
| 2.5 | Repeated report of the same content by same user | De-duplicated; report count increments once per user | Low |
| 2.6 | Retried signup after network timeout | Email uniqueness prevents double account; retry returns 409 or logs into the created account | Medium |

## 3. Large / Malformed Media

| # | Edge Case | Expected System Behavior | Severity |
|---|---|---|---|
| 3.1 | 4K/50 MB image | Rejected pre-upload (>5 MB) with clear message; no partial upload stored | Medium |
| 3.2 | Image renamed `.jpg` but actually a PDF | Content sniffing (magic bytes) on server rejects it; extension alone is not trusted | High |
| 3.3 | Corrupt/truncated image file | Server fails to decode dimensions; rejected with "Invalid or corrupt image" | Medium |
| 3.4 | Zip bomb / decompression bomb disguised as image | Dimension and pixel limits enforced; oversized decompressed content rejected | High |
| 3.5 | 20 valid images but total request very large | Per-file 5 MB cap and request size limit enforced; oversized request rejected (413) | Medium |
| 3.6 | Animated formats (GIF/APNG) | Rejected — allowed types are JPEG/PNG/WEBP only | Low |
| 3.7 | EXIF containing malicious payload | EXIF stripped on ingest; only safe pixel data retained | Medium |

## 4. Banned / Suspended Users

| # | Edge Case | Expected System Behavior | Severity |
|---|---|---|---|
| 4.1 | Banned user attempts to post/comment/list | All write actions return HTTP 403 "Account suspended" | High |
| 4.2 | Banned user's existing content | Content policy: hidden or retained per moderation decision; not silently deleted | Medium |
| 4.3 | Banned user re-registers with new email | Device/identity signals flag; KYC prevents re-verification with same documents | High |
| 4.4 | Suspended seller with ACTIVE listings | Listings are paused (moved out of active search) during suspension | High |
| 4.5 | Banned user still holds a valid JWT | Server-side ban check on each write; token alone does not authorize | Critical |

## 5. Incomplete / Invalid KYC

| # | Edge Case | Expected System Behavior | Severity |
|---|---|---|---|
| 5.1 | Seller starts listing before KYC approved | Blocked at publish with "Complete seller KYC to list" | High |
| 5.2 | KYC approved then documents later found invalid | Admin can revoke; role downgraded; active listings paused | High |
| 5.3 | Buyer attempts contact reveal with PENDING KYC | Blocked; prompted to wait for approval | Medium |
| 5.4 | KYC document expires (e.g., ID expiry date passed) | Flagged for re-verification; role capabilities suspended until renewed | Medium |
| 5.5 | Partial KYC form abandoned | Saved as DRAFT KYC; no role granted; user can resume | Low |
| 5.6 | Same document used across multiple accounts | Duplicate-document detection flags for manual review | High |

## 6. Network & Upload Failures

| # | Edge Case | Expected System Behavior | Severity |
|---|---|---|---|
| 6.1 | Connection drops mid image-upload | Failed images marked; user can retry only the failed ones; partial gallery preserved | Medium |
| 6.2 | Post save succeeds but media upload fails | Post remains DRAFT; user warned images are missing; can re-add | Medium |
| 6.3 | Timeout on publish | Idempotent publish; safe to retry without duplicate events | Medium |
| 6.4 | Client offline during comment submit | Optimistic UI with rollback; comment retried or shown as failed | Low |
| 6.5 | Kafka/Outbox relay temporarily down | Events buffered in Outbox table; relayed when broker recovers (at-least-once) | High |
| 6.6 | Duplicate event delivery (at-least-once) | Consumers are idempotent (dedupe by event id) | High |

## 7. Security — Injection & Abuse

| # | Edge Case | Expected System Behavior | Severity |
|---|---|---|---|
| 7.1 | XSS in rich text (`<script>`, `onerror`, `javascript:`) | Server-side HTML sanitization strips dangerous tags/attributes/protocols | Critical |
| 7.2 | Stored XSS in profile bio / comment | Same sanitization pipeline applied to all user HTML | Critical |
| 7.3 | SQL injection in search/filter params | Parameterized queries / JPA; input never concatenated into SQL | Critical |
| 7.4 | IDOR — accessing another user's DRAFT post/KYC by ID | Ownership/authorization check on every resource fetch; 403/404 otherwise | Critical |
| 7.5 | Privilege escalation via forged role claim | Server validates JWT signature and re-checks permissions server-side | Critical |
| 7.6 | CSRF on state-changing requests | Token-based auth + appropriate CSRF protections on cookie flows | High |
| 7.7 | Path traversal in media file names | Filenames sanitized; storage keys generated server-side, not from user input | High |
| 7.8 | Malicious SVG upload (script payload) | SVG not in allowed types; rejected | High |

## 8. Rate Limiting & Spam

| # | Edge Case | Expected System Behavior | Severity |
|---|---|---|---|
| 8.1 | Rapid-fire signups from one IP | Rate limiting + optional CAPTCHA challenge (user solves it; platform does not bypass) | High |
| 8.2 | Comment/review flooding | Per-user rate limits; throttled with 429 and backoff | Medium |
| 8.3 | Brute-force login attempts | Exponential backoff + temporary lockout after N failures | High |
| 8.4 | Bulk listing spam by one seller | Listing quota per account; excess queued/blocked | Medium |
| 8.5 | Report abuse (mass false reports) | Reporter reputation weighting; abusive reporters de-prioritized | Medium |
| 8.6 | Scraping via API | Rate limits + pagination caps on public endpoints | Low |

## 9. Orphaned & Referential Data

| # | Edge Case | Expected System Behavior | Severity |
|---|---|---|---|
| 9.1 | Media uploaded but post never created | Retention window then cleanup job removes orphaned media | Medium |
| 9.2 | Post deleted but media remains | Cascade cleanup schedules media deletion | Medium |
| 9.3 | Master deactivated while referenced | Soft delete; historical references preserved; hidden from new forms | Medium |
| 9.4 | Comment on a deleted post | Comments removed/archived with the post; no dangling threads | Low |
| 9.5 | Listing references a deactivated Currency master | Existing listing keeps its stored currency; new listings cannot select it | Low |
| 9.6 | Follow relationship to a deleted account | Follow edges cleaned up; feed excludes removed accounts | Low |

## 10. Boundary Values

| # | Edge Case | Expected System Behavior | Severity |
|---|---|---|---|
| 10.1 | Exactly 20 images | Accepted; 21st rejected | Medium |
| 10.2 | Image exactly 640×480 | Accepted (inclusive minimum) | Low |
| 10.3 | Image exactly 5.00 MB | Accepted; 5 MB + 1 byte rejected | Low |
| 10.4 | Password exactly 8 chars meeting complexity | Accepted; 7 chars rejected | Low |
| 10.5 | Review rating outside 1–5 | Rejected with validation error | Medium |
| 10.6 | Empty rich-text post (only whitespace/markup) | Rejected — content required after sanitization | Low |
| 10.7 | Maximum-length title/body | Enforced field length limits; graceful truncation message | Low |

## 11. Internationalization & Encoding (forward-looking)

| # | Edge Case | Expected System Behavior | Severity |
|---|---|---|---|
| 11.1 | Emoji / multibyte characters in content | Full UTF-8 support; stored and rendered correctly | Low |
| 11.2 | RTL text in reviews | Rendered without breaking layout | Low |
| 11.3 | Very long single-word input (no spaces) | CSS word-break prevents layout overflow | Low |
