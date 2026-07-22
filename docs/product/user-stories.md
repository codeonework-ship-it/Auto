# AutoHub — User Stories

> 45 user stories grouped by epic. IDs FIXED (`US-001`..). Each story includes role, want, benefit, Priority (MoSCoW), Story Points (Fibonacci), Epic link, and Acceptance Criteria in Given/When/Then. Consolidated criteria for the top 15 live in [`acceptance-criteria.md`](./acceptance-criteria.md); linked tests in [`test-cases.md`](./test-cases.md).

**Story Point scale:** 1, 2, 3, 5, 8, 13 (Fibonacci).
**Priority:** Must / Should / Could / Won't (MoSCoW).

---

## EP-01 — Identity & Authentication

### US-001 — Register with email and password
| Field | Value |
|---|---|
| **As a** | Guest visitor |
| **I want** | to create an account with my email and password |
| **So that** | I can post, review, comment, and transact on AutoHub |
| **Priority** | Must |
| **Story Points** | 5 |
| **Epic** | EP-01 |

**Acceptance Criteria**
- **Given** a valid, unregistered email and a policy-compliant password, **When** I submit the signup form, **Then** my account is created with role `MEMBER` and an `identity.user.registered` event is published.
- **Given** an email already registered, **When** I submit signup, **Then** I see "Email already in use" and no account is created.
- **Given** a password shorter than 8 chars or missing complexity, **When** I submit, **Then** I see specific validation errors.

### US-002 — Log in and log out
| Field | Value |
|---|---|
| **As a** | Registered user |
| **I want** | to log in and log out securely |
| **So that** | I can access my account and end my session safely |
| **Priority** | Must |
| **Story Points** | 3 |
| **Epic** | EP-01 |

**Acceptance Criteria**
- **Given** correct credentials, **When** I log in, **Then** I receive a JWT session and land on my dashboard.
- **Given** wrong credentials, **When** I log in, **Then** I see a generic "Invalid email or password" (no account enumeration).
- **Given** an active session, **When** I log out, **Then** my token is invalidated client-side and protected routes redirect to login.

### US-003 — Manage my profile
| Field | Value |
|---|---|
| **As a** | Registered user |
| **I want** | to edit my display name, bio, and avatar |
| **So that** | others recognize me in the community |
| **Priority** | Should |
| **Story Points** | 3 |
| **Epic** | EP-01 |

**Acceptance Criteria**
- **Given** I am logged in, **When** I update profile fields, **Then** changes persist and display across the site.
- **Given** an avatar over 5 MB or wrong type, **When** I upload, **Then** I see a validation error and the avatar is unchanged.

### US-004 — Reset a forgotten password
| Field | Value |
|---|---|
| **As a** | Registered user |
| **I want** | to reset my password via email |
| **So that** | I can regain access if I forget it |
| **Priority** | Should |
| **Story Points** | 3 |
| **Epic** | EP-01 |

**Acceptance Criteria**
- **Given** a registered email, **When** I request a reset, **Then** a time-limited reset link is sent.
- **Given** an expired or reused reset token, **When** I open it, **Then** I am told to request a new link.

---

## EP-02 — RBAC & User Management

### US-005 — Enforce role-based access on APIs
| Field | Value |
|---|---|
| **As a** | Platform (security requirement) |
| **I want** | every protected endpoint to check the caller's permissions |
| **So that** | users can only perform actions they are authorized for |
| **Priority** | Must |
| **Story Points** | 8 |
| **Epic** | EP-02 |

**Acceptance Criteria**
- **Given** a user lacking `master:manage`, **When** they call a Masters write endpoint, **Then** they receive HTTP 403.
- **Given** a user with the required permission, **When** they call it, **Then** the action proceeds.
- **Given** an unauthenticated request to a protected endpoint, **Then** they receive HTTP 401.

### US-006 — Assign roles to users
| Field | Value |
|---|---|
| **As a** | Admin (`ADMIN`/`SUPER_ADMIN`) |
| **I want** | to assign or revoke roles for a user |
| **So that** | access reflects each person's responsibilities |
| **Priority** | Must |
| **Story Points** | 5 |
| **Epic** | EP-02 |

**Acceptance Criteria**
- **Given** I have `user:manage`, **When** I assign `MODERATOR` to a user, **Then** their effective permissions update immediately on next token refresh.
- **Given** I lack `user:manage`, **When** I open user management, **Then** it is not accessible.

### US-007 — Map permissions to roles
| Field | Value |
|---|---|
| **As a** | Super Admin |
| **I want** | to define which `resource:action` permissions each role holds |
| **So that** | least-privilege is configurable without code changes |
| **Priority** | Must |
| **Story Points** | 5 |
| **Epic** | EP-02 |

**Acceptance Criteria**
- **Given** I am `SUPER_ADMIN`, **When** I add `listing:approve` to `MODERATOR`, **Then** moderators gain that capability.
- **Given** a permission is removed from a role, **Then** affected users lose it on next session.

### US-008 — Suspend or ban a user
| Field | Value |
|---|---|
| **As a** | Admin/Moderator with `user:suspend` |
| **I want** | to suspend or ban an abusive account |
| **So that** | they can no longer post or transact |
| **Priority** | Must |
| **Story Points** | 5 |
| **Epic** | EP-02 |

**Acceptance Criteria**
- **Given** a banned user, **When** they attempt any write action, **Then** they receive HTTP 403 with a "account suspended" message.
- **Given** a banned user, **When** they browse, **Then** read access continues per policy (or is blocked if fully banned).

---

## EP-03 — Masters & Control-Panel

### US-009 — Create and edit master records
| Field | Value |
|---|---|
| **As a** | Admin with `master:manage` |
| **I want** | to CRUD master data (Make, Model, Variant, Fuel Type, etc.) |
| **So that** | forms and taxonomy stay current without engineering |
| **Priority** | Must |
| **Story Points** | 8 |
| **Epic** | EP-03 |

**Acceptance Criteria**
- **Given** I have `master:manage`, **When** I create a Vehicle Make "Yamaha", **Then** it appears in relevant dropdowns.
- **Given** a duplicate master value in the same scope, **When** I save, **Then** I get a uniqueness error.
- **Given** a master record referenced by posts/listings, **When** I try to delete it, **Then** it is soft-deleted/deactivated rather than breaking references.

### US-010 — Cascade Make → Model → Variant
| Field | Value |
|---|---|
| **As a** | Admin |
| **I want** | Models to belong to a Make and Variants to a Model |
| **So that** | dependent dropdowns are consistent |
| **Priority** | Must |
| **Story Points** | 5 |
| **Epic** | EP-03 |

**Acceptance Criteria**
- **Given** a Make with no Models, **When** a user opens the Model dropdown, **Then** it is empty and disabled.
- **Given** a Model under a Make, **When** the Make is deactivated, **Then** its Models/Variants are also unavailable in new forms.

### US-011 — Manage reference lists (Fuel, Body, Transmission, Currency, Tags, Reasons)
| Field | Value |
|---|---|
| **As a** | Admin |
| **I want** | to manage simple lookup lists |
| **So that** | posts, listings, reviews, and reports use consistent options |
| **Priority** | Must |
| **Story Points** | 3 |
| **Epic** | EP-03 |

**Acceptance Criteria**
- **Given** `master:manage`, **When** I add a Report Reason "Spam", **Then** it appears in the report dialog.
- **Given** a Review Tag "Reliable", **When** a user writes a review, **Then** they can attach that tag.

---

## EP-04 — Car & Bike Posts (Catalog)

### US-012 — Create a car post
| Field | Value |
|---|---|
| **As a** | Member/Author |
| **I want** | to create a car post using Masters and rich text |
| **So that** | I can share detailed information about a vehicle |
| **Priority** | Must |
| **Story Points** | 8 |
| **Epic** | EP-04 |

**Acceptance Criteria**
- **Given** I am authenticated, **When** I select Make/Model/Variant/Fuel/Body/Transmission and write content, **Then** the post saves as DRAFT.
- **Given** a complete draft, **When** I publish, **Then** status becomes PUBLISHED and a `catalog.post.published` event fires.
- **Given** a Guest, **When** they try to create a post, **Then** they are redirected to signup.

### US-013 — Create a bike post
| Field | Value |
|---|---|
| **As a** | Member/Author |
| **I want** | to create a bike post categorized as bike |
| **So that** | bike content is distinct from cars |
| **Priority** | Must |
| **Story Points** | 5 |
| **Epic** | EP-04 |

**Acceptance Criteria**
- **Given** Category master = bike, **When** I create a post, **Then** only bike-relevant Masters/specs are shown.
- **Given** a published bike post, **When** users browse, **Then** it is filterable by bike category.

### US-014 — Edit and delete my post
| Field | Value |
|---|---|
| **As a** | Post author |
| **I want** | to edit or delete my own post |
| **So that** | I can correct or remove content |
| **Priority** | Must |
| **Story Points** | 3 |
| **Epic** | EP-04 |

**Acceptance Criteria**
- **Given** I am the author, **When** I edit, **Then** changes save and version/updated timestamp reflects it.
- **Given** I am not the author and lack `post:manage`, **When** I try to edit, **Then** I get HTTP 403.
- **Given** I delete a post, **When** confirmed, **Then** it is soft-deleted and its media is scheduled for cleanup.

### US-015 — View a post detail page
| Field | Value |
|---|---|
| **As a** | Any visitor |
| **I want** | to view a post with its gallery, specs, reviews, and comments |
| **So that** | I can learn about the vehicle |
| **Priority** | Must |
| **Story Points** | 3 |
| **Epic** | EP-04 |

**Acceptance Criteria**
- **Given** a published post, **When** I open it, **Then** rich text renders safely and images load in order.
- **Given** a draft/soft-deleted post, **When** a non-owner opens it, **Then** they get a 404/forbidden.

---

## EP-05 — Image Upload & Media

### US-016 — Upload up to 20 images to a post
| Field | Value |
|---|---|
| **As a** | Post author |
| **I want** | to upload up to 20 images |
| **So that** | I can showcase the vehicle thoroughly |
| **Priority** | Must |
| **Story Points** | 8 |
| **Epic** | EP-05 |

**Acceptance Criteria**
- **Given** I add images, **When** the count would exceed 20, **Then** additional files are rejected with "Maximum 20 images".
- **Given** valid images, **When** I upload, **Then** each produces a `media.image.uploaded` event and appears in the gallery.

### US-017 — Enforce image type, size, and resolution
| Field | Value |
|---|---|
| **As a** | Platform (validation requirement) |
| **I want** | uploads validated for type, size, and resolution |
| **So that** | media quality and safety are guaranteed |
| **Priority** | Must |
| **Story Points** | 5 |
| **Epic** | EP-05 |

**Acceptance Criteria**
- **Given** a non-JPEG/PNG/WEBP file, **When** I upload, **Then** it is rejected with "Unsupported file type".
- **Given** a file > 5 MB, **When** I upload, **Then** it is rejected with "File exceeds 5 MB".
- **Given** an image below 640×480, **When** I upload, **Then** it is rejected with "Minimum resolution 640×480".
- **Given** an image ≥ 1280×720, **Then** it uploads without a resolution warning.

### US-018 — Reorder and set primary image
| Field | Value |
|---|---|
| **As a** | Post author |
| **I want** | to reorder images and mark a primary/cover image |
| **So that** | the gallery presents the vehicle well |
| **Priority** | Should |
| **Story Points** | 3 |
| **Epic** | EP-05 |

**Acceptance Criteria**
- **Given** multiple images, **When** I drag to reorder, **Then** the new order persists.
- **Given** a chosen primary image, **When** the post appears in feeds/search, **Then** the primary is used as the thumbnail.

### US-019 — Clean up orphaned media
| Field | Value |
|---|---|
| **As a** | Platform (housekeeping) |
| **I want** | media not linked to any post to be cleaned up |
| **So that** | storage stays lean and no dangling files remain |
| **Priority** | Should |
| **Story Points** | 5 |
| **Epic** | EP-05 |

**Acceptance Criteria**
- **Given** an upload whose post creation is abandoned, **When** the retention window passes, **Then** the orphaned media is removed.
- **Given** a deleted post, **When** cleanup runs, **Then** its media is removed and references are cleared.

---

## EP-06 — Rich Text Content

### US-020 — Write content with a rich text editor
| Field | Value |
|---|---|
| **As a** | Author |
| **I want** | a react-quill editor with formatting |
| **So that** | my posts and blogs look professional |
| **Priority** | Must |
| **Story Points** | 5 |
| **Epic** | EP-06 |

**Acceptance Criteria**
- **Given** the editor, **When** I apply headings, bold, italics, lists, and links, **Then** the formatting is preserved on save and render.
- **Given** unsupported/dangerous markup, **When** I save, **Then** it is stripped by server-side sanitization.

### US-021 — Sanitize rich text against XSS
| Field | Value |
|---|---|
| **As a** | Platform (security requirement) |
| **I want** | all stored HTML sanitized |
| **So that** | malicious scripts cannot execute for other users |
| **Priority** | Must |
| **Story Points** | 5 |
| **Epic** | EP-06 |

**Acceptance Criteria**
- **Given** content containing `<script>` or `onerror=` handlers, **When** saved, **Then** those are removed and inert content remains.
- **Given** sanitized content, **When** rendered, **Then** no injected script executes (verified by security test).

---

## EP-07 — Reviews & Comments

### US-022 — Comment requires a signed-in account
| Field | Value |
|---|---|
| **As a** | Guest reading a post |
| **I want** | to be prompted to sign up/in when I try to comment |
| **So that** | comments are accountable and spam-resistant |
| **Priority** | Must |
| **Story Points** | 3 |
| **Epic** | EP-07 |

**Acceptance Criteria**
- **Given** a Guest on a post, **When** they focus the comment box or click Comment, **Then** they are redirected to signup/login.
- **Given** an authenticated user, **When** they submit a comment, **Then** it posts and appears in the thread.

### US-023 — Write a review with rating and tags
| Field | Value |
|---|---|
| **As a** | Authenticated user |
| **I want** | to rate a vehicle and attach review tags |
| **So that** | others benefit from my structured feedback |
| **Priority** | Must |
| **Story Points** | 5 |
| **Epic** | EP-07 |

**Acceptance Criteria**
- **Given** a 1–5 rating and optional Review Tags, **When** I submit, **Then** the review saves and `engagement.review.added` fires.
- **Given** I already reviewed this post, **When** I submit again, **Then** I am prompted to edit my existing review instead.

### US-024 — Reply to comments (threading)
| Field | Value |
|---|---|
| **As a** | Authenticated user |
| **I want** | to reply to a comment |
| **So that** | discussions stay organized |
| **Priority** | Should |
| **Story Points** | 3 |
| **Epic** | EP-07 |

**Acceptance Criteria**
- **Given** an existing comment, **When** I reply, **Then** the reply nests under it.
- **Given** a removed parent comment, **When** it is moderated, **Then** replies show a "comment removed" placeholder.

### US-025 — Edit or delete my comment/review
| Field | Value |
|---|---|
| **As a** | Comment/review author |
| **I want** | to edit or delete my own contribution |
| **So that** | I can fix mistakes or retract |
| **Priority** | Should |
| **Story Points** | 2 |
| **Epic** | EP-07 |

**Acceptance Criteria**
- **Given** I authored it, **When** I edit/delete, **Then** the change is applied and marked edited/removed.
- **Given** I did not author it and lack moderation rights, **When** I try, **Then** I get HTTP 403.

---

## EP-08 — Marketplace Listings

### US-026 — Create a marketplace listing
| Field | Value |
|---|---|
| **As a** | Seller (KYC-approved) |
| **I want** | to list a car/bike for sale |
| **So that** | verified buyers can find and contact me |
| **Priority** | Must |
| **Story Points** | 8 |
| **Epic** | EP-08 |

**Acceptance Criteria**
- **Given** an approved seller, **When** I create a listing with price (Currency master), specs, and images, **Then** it saves as DRAFT.
- **Given** a seller without approved KYC, **When** they try to publish a listing, **Then** they are blocked with a "Complete seller KYC" message.
- **Given** a submitted listing, **Then** it enters PENDING_REVIEW and a `marketplace.listing.created` event fires.

### US-027 — Listing lifecycle and admin approval
| Field | Value |
|---|---|
| **As a** | Admin/Moderator with `listing:approve` |
| **I want** | to approve or reject pending listings |
| **So that** | only compliant listings go live |
| **Priority** | Must |
| **Story Points** | 5 |
| **Epic** | EP-08 |

**Acceptance Criteria**
- **Given** a PENDING_REVIEW listing, **When** I approve, **Then** status becomes ACTIVE and it appears in search.
- **Given** a policy-violating listing, **When** I reject with a reason, **Then** status becomes REJECTED and the seller is notified.
- **Given** an ACTIVE listing, **When** the seller marks it SOLD, **Then** it leaves active search and lifecycle records the transition.

### US-027a — Listing expiry
| Field | Value |
|---|---|
| **As a** | Platform |
| **I want** | listings to expire after a set period |
| **So that** | stale inventory doesn't clutter search |
| **Priority** | Should |
| **Story Points** | 3 |
| **Epic** | EP-08 |

**Acceptance Criteria**
- **Given** an ACTIVE listing past its expiry date, **When** the job runs, **Then** status becomes EXPIRED and it's removed from active search.
- **Given** an EXPIRED listing, **When** the seller renews, **Then** it returns to PENDING_REVIEW.

### US-028 — Reveal seller contact to verified buyers
| Field | Value |
|---|---|
| **As a** | Buyer (KYC-approved) |
| **I want** | to reveal a seller's contact on an active listing |
| **So that** | I can inquire safely |
| **Priority** | Must |
| **Story Points** | 3 |
| **Epic** | EP-08 |

**Acceptance Criteria**
- **Given** an approved buyer on an ACTIVE listing, **When** I click "Contact seller", **Then** contact details are revealed and the event is logged.
- **Given** a buyer without approved KYC, **When** they click contact, **Then** they are prompted to complete buyer KYC.

---

## EP-09 — KYC (Buyer & Seller)

### US-029 — Submit seller KYC
| Field | Value |
|---|---|
| **As a** | User wanting to sell |
| **I want** | to submit seller KYC with identity/business documents |
| **So that** | I can be approved to list vehicles |
| **Priority** | Must |
| **Story Points** | 8 |
| **Epic** | EP-09 |

**Acceptance Criteria**
- **Given** the seller KYC form, **When** I provide required fields and valid documents, **Then** a KYC record is created with status PENDING.
- **Given** a missing required document or invalid file, **When** I submit, **Then** I see field-level validation errors and nothing is submitted.
- **Given** a submitted KYC, **When** I revisit, **Then** I see status PENDING and cannot edit locked fields.

### US-030 — Submit buyer KYC
| Field | Value |
|---|---|
| **As a** | User wanting to buy |
| **I want** | to submit buyer KYC |
| **So that** | I can contact sellers and transact |
| **Priority** | Must |
| **Story Points** | 5 |
| **Epic** | EP-09 |

**Acceptance Criteria**
- **Given** the buyer KYC form, **When** I submit valid details/documents, **Then** a KYC record is created PENDING.
- **Given** approved buyer KYC, **Then** I gain the `BUYER` role capabilities (e.g., contact reveal).

### US-031 — Review and decide KYC (approve/reject)
| Field | Value |
|---|---|
| **As a** | Admin/Moderator with `kyc:review` |
| **I want** | to review submitted KYC and approve or reject |
| **So that** | only verified users can transact |
| **Priority** | Must |
| **Story Points** | 5 |
| **Epic** | EP-09 |

**Acceptance Criteria**
- **Given** a PENDING KYC, **When** I approve, **Then** status becomes APPROVED and the user is granted the corresponding role.
- **Given** invalid/insufficient documents, **When** I reject with a reason, **Then** status becomes REJECTED, the user is notified, and they may resubmit.
- **Given** I lack `kyc:review`, **When** I open the KYC queue, **Then** access is denied.

---

## EP-10 — Travel Blog

### US-032 — Publish a travel blog post
| Field | Value |
|---|---|
| **As a** | Author |
| **I want** | to publish a travel blog with rich text and a gallery |
| **So that** | I can share trip stories with the community |
| **Priority** | Should |
| **Story Points** | 5 |
| **Epic** | EP-10 |

**Acceptance Criteria**
- **Given** rich content and up to 20 valid images, **When** I publish, **Then** the travel post goes live and appears in travel feeds.
- **Given** a Guest, **When** they try to author, **Then** they are prompted to sign up.

### US-033 — Categorize and discover travel posts
| Field | Value |
|---|---|
| **As a** | Reader |
| **I want** | to filter travel posts by category and location |
| **So that** | I find relevant trips |
| **Priority** | Should |
| **Story Points** | 3 |
| **Epic** | EP-10 |

**Acceptance Criteria**
- **Given** travel posts tagged with Tour Category and Location masters, **When** I filter, **Then** results match the selected facets.

---

## EP-11 — Tour Guide

### US-034 — Create a tour-guide listing
| Field | Value |
|---|---|
| **As a** | Tour guide (Seller) |
| **I want** | to offer a guided tour with category, location, and price |
| **So that** | enthusiasts can discover and book it |
| **Priority** | Should |
| **Story Points** | 5 |
| **Epic** | EP-11 |

**Acceptance Criteria**
- **Given** Tour Category, Location, and price (Currency master), **When** I publish, **Then** the tour appears in tour discovery.
- **Given** incomplete required fields, **When** I publish, **Then** I see validation errors.

### US-035 — Request to book a tour
| Field | Value |
|---|---|
| **As a** | Authenticated user |
| **I want** | to request a booking on a tour |
| **So that** | I can arrange a guided trip |
| **Priority** | Could |
| **Story Points** | 5 |
| **Epic** | EP-11 |

**Acceptance Criteria**
- **Given** an available tour, **When** I submit a booking request, **Then** the guide is notified and the request is PENDING.
- **Given** a Guest, **When** they request, **Then** they are prompted to sign up.

---

## EP-12 — Community (Groups & Follows)

### US-036 — Create and join groups
| Field | Value |
|---|---|
| **As a** | Member |
| **I want** | to create and join interest groups |
| **So that** | I connect with like-minded enthusiasts |
| **Priority** | Should |
| **Story Points** | 5 |
| **Epic** | EP-12 |

**Acceptance Criteria**
- **Given** a group name, **When** I create it, **Then** I become its owner and can post within it.
- **Given** a public group, **When** I join, **Then** its activity appears in my feed.

### US-037 — Follow users and authors
| Field | Value |
|---|---|
| **As a** | Member |
| **I want** | to follow authors |
| **So that** | I see their new posts in my feed |
| **Priority** | Should |
| **Story Points** | 3 |
| **Epic** | EP-12 |

**Acceptance Criteria**
- **Given** an author, **When** I follow them, **Then** their new posts surface in my feed.
- **Given** a follow, **When** I unfollow, **Then** their content no longer prioritizes in my feed.

---

## EP-13 — Search & Feed

### US-038 — Search across posts, listings, and travel
| Field | Value |
|---|---|
| **As a** | Any visitor |
| **I want** | to search and filter content |
| **So that** | I quickly find relevant vehicles, listings, and trips |
| **Priority** | Should |
| **Story Points** | 8 |
| **Epic** | EP-13 |

**Acceptance Criteria**
- **Given** a query and facets (Make, Fuel, Body, Location, price range), **When** I search, **Then** matching results return ranked by relevance.
- **Given** no results, **When** I search, **Then** I see an empty-state with suggestions.

### US-039 — Personalized feed
| Field | Value |
|---|---|
| **As a** | Authenticated user |
| **I want** | a feed based on my follows and groups |
| **So that** | I see relevant, fresh content |
| **Priority** | Should |
| **Story Points** | 5 |
| **Epic** | EP-13 |

**Acceptance Criteria**
- **Given** follows/groups, **When** I open my feed, **Then** it prioritizes their recent activity.
- **Given** a new user with no follows, **Then** I see a trending/curated default feed.

### US-040 — Save a search
| Field | Value |
|---|---|
| **As a** | Buyer |
| **I want** | to save a search with filters |
| **So that** | I get notified of new matching listings |
| **Priority** | Could |
| **Story Points** | 3 |
| **Epic** | EP-13 |

**Acceptance Criteria**
- **Given** a filter set, **When** I save the search, **Then** it is stored and re-runnable.
- **Given** a new listing matching a saved search, **Then** I receive a notification (see EP-14).

---

## EP-14 — Notifications

### US-041 — Receive activity notifications
| Field | Value |
|---|---|
| **As a** | Registered user |
| **I want** | notifications for reviews, comments, follows, and status changes |
| **So that** | I stay informed |
| **Priority** | Could |
| **Story Points** | 5 |
| **Epic** | EP-14 |

**Acceptance Criteria**
- **Given** someone comments on my post, **When** it happens, **Then** I receive an in-app notification.
- **Given** my KYC or listing status changes, **Then** I receive a notification.

### US-042 — Manage notification preferences
| Field | Value |
|---|---|
| **As a** | Registered user |
| **I want** | to control which notifications I receive |
| **So that** | I avoid noise |
| **Priority** | Could |
| **Story Points** | 3 |
| **Epic** | EP-14 |

**Acceptance Criteria**
- **Given** preference toggles, **When** I disable a category, **Then** I stop receiving those notifications.

---

## EP-15 — Moderation & Reporting

### US-043 — Report content
| Field | Value |
|---|---|
| **As a** | Authenticated user |
| **I want** | to report a post, comment, review, or listing |
| **So that** | harmful content is reviewed |
| **Priority** | Must |
| **Story Points** | 3 |
| **Epic** | EP-15 |

**Acceptance Criteria**
- **Given** a Report Reason (from master), **When** I submit a report, **Then** it enters the moderation queue.
- **Given** a Guest, **When** they try to report, **Then** they are prompted to sign up.

### US-044 — Moderate the report queue
| Field | Value |
|---|---|
| **As a** | Moderator with `content:moderate` |
| **I want** | to review reported items and take action |
| **So that** | the platform stays safe |
| **Priority** | Must |
| **Story Points** | 8 |
| **Epic** | EP-15 |

**Acceptance Criteria**
- **Given** a queued report, **When** I hide/remove the content, **Then** it is no longer visible and the action is audit-logged.
- **Given** repeated violations by a user, **When** I escalate, **Then** I can suspend/ban via `user:suspend`.
- **Given** I lack `content:moderate`, **When** I open the queue, **Then** access is denied.

### US-045 — Audit trail of moderation actions
| Field | Value |
|---|---|
| **As a** | Admin |
| **I want** | every moderation action logged with actor, reason, and timestamp |
| **So that** | actions are accountable and reversible |
| **Priority** | Should |
| **Story Points** | 3 |
| **Epic** | EP-15 |

**Acceptance Criteria**
- **Given** any moderation action, **When** it occurs, **Then** an immutable audit record is written.
- **Given** the audit log, **When** an admin reviews it, **Then** they can trace who did what and when.

---

## Story Rollup

| Epic | Stories | Total Points |
|---|---|---|
| EP-01 | US-001..004 | 14 |
| EP-02 | US-005..008 | 23 |
| EP-03 | US-009..011 | 16 |
| EP-04 | US-012..015 | 19 |
| EP-05 | US-016..019 | 21 |
| EP-06 | US-020..021 | 10 |
| EP-07 | US-022..025 | 13 |
| EP-08 | US-026, 027, 027a, 028 | 19 |
| EP-09 | US-029..031 | 18 |
| EP-10 | US-032..033 | 8 |
| EP-11 | US-034..035 | 10 |
| EP-12 | US-036..037 | 8 |
| EP-13 | US-038..040 | 16 |
| EP-14 | US-041..042 | 8 |
| EP-15 | US-043..045 | 14 |
| **Total** | **45 stories** | **217** |
