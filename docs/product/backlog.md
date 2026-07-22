# AutoHub — Product Backlog

> Prioritized backlog mapping Epics → Stories → Sprints (S0–S5 per the FIXED Sprint Plan) with MoSCoW prioritization. This is the planning bridge between [`epics.md`](./epics.md), [`user-stories.md`](./user-stories.md), and the agile sprint plan.

## Sprint Plan Reference (FIXED)

| Sprint | Duration | Theme | Focus |
|---|---|---|---|
| **S0** | 2 weeks | Foundation | Repo, docker, CI, auth skeleton, design system |
| **S1** | 2 weeks | Identity & RBAC | Signup/login, roles, user mgmt, masters CRUD |
| **S2** | 2 weeks | Catalog | Create/read car & bike posts, rich text, image upload (20) |
| **S3** | 2 weeks | Engagement | Reviews, comments, moderation |
| **S4** | 2 weeks | Marketplace & KYC | Listings, buyer/seller KYC, approvals |
| **S5** | 2 weeks | Travel & Community | Travel blog, tour guide, groups, feeds |

---

## 1. MoSCoW Prioritization

| Priority | Definition | Epics |
|---|---|---|
| **Must** | Launch-blocking; product is not viable without it | EP-01, EP-02, EP-03, EP-04, EP-05, EP-06, EP-07, EP-08, EP-09, EP-15 |
| **Should** | High value; deferrable without blocking launch | EP-10, EP-11, EP-12, EP-13 |
| **Could** | Desirable; include if capacity allows | EP-14 |
| **Won't (this release)** | Out of scope for v1.0 | Payments/escrow, native apps, real-time chat, auctions, i18n, video |

---

## 2. Epic → Story → Sprint Map

| Epic | Story | Priority | Points | Sprint |
|---|---|---|---|---|
| EP-01 Identity | US-001 Register | Must | 5 | S0→S1 |
| EP-01 Identity | US-002 Login/Logout | Must | 3 | S0→S1 |
| EP-01 Identity | US-003 Profile | Should | 3 | S1 |
| EP-01 Identity | US-004 Password reset | Should | 3 | S1 |
| EP-02 RBAC | US-005 RBAC enforcement | Must | 8 | S1 |
| EP-02 RBAC | US-006 Assign roles | Must | 5 | S1 |
| EP-02 RBAC | US-007 Map permissions | Must | 5 | S1 |
| EP-02 RBAC | US-008 Suspend/ban | Must | 5 | S1 |
| EP-03 Masters | US-009 Masters CRUD | Must | 8 | S1 |
| EP-03 Masters | US-010 Cascade Make/Model/Variant | Must | 5 | S1 |
| EP-03 Masters | US-011 Reference lists | Must | 3 | S1 |
| EP-04 Catalog | US-012 Create car post | Must | 8 | S2 |
| EP-04 Catalog | US-013 Create bike post | Must | 5 | S2 |
| EP-04 Catalog | US-014 Edit/delete post | Must | 3 | S2 |
| EP-04 Catalog | US-015 View post detail | Must | 3 | S2 |
| EP-05 Media | US-016 Upload 20 images | Must | 8 | S2 |
| EP-05 Media | US-017 Type/size/resolution rules | Must | 5 | S2 |
| EP-05 Media | US-018 Reorder/primary | Should | 3 | S2 |
| EP-05 Media | US-019 Orphan cleanup | Should | 5 | S2→S3 |
| EP-06 Rich Text | US-020 Rich text editor | Must | 5 | S2 |
| EP-06 Rich Text | US-021 XSS sanitization | Must | 5 | S2 |
| EP-07 Engagement | US-022 Comment requires signup | Must | 3 | S3 |
| EP-07 Engagement | US-023 Review + rating + tags | Must | 5 | S3 |
| EP-07 Engagement | US-024 Threaded replies | Should | 3 | S3 |
| EP-07 Engagement | US-025 Edit/delete own | Should | 2 | S3 |
| EP-15 Moderation | US-043 Report content | Must | 3 | S3 |
| EP-15 Moderation | US-044 Moderate queue | Must | 8 | S3 |
| EP-15 Moderation | US-045 Audit trail | Should | 3 | S3 |
| EP-08 Marketplace | US-026 Create listing | Must | 8 | S4 |
| EP-08 Marketplace | US-027 Lifecycle & approval | Must | 5 | S4 |
| EP-08 Marketplace | US-027a Listing expiry | Should | 3 | S4 |
| EP-08 Marketplace | US-028 Contact reveal | Must | 3 | S4 |
| EP-09 KYC | US-029 Seller KYC submit | Must | 8 | S4 |
| EP-09 KYC | US-030 Buyer KYC submit | Must | 5 | S4 |
| EP-09 KYC | US-031 KYC review/decide | Must | 5 | S4 |
| EP-10 Travel | US-032 Publish travel blog | Should | 5 | S5 |
| EP-10 Travel | US-033 Categorize/discover | Should | 3 | S5 |
| EP-11 Tour Guide | US-034 Create tour listing | Should | 5 | S5 |
| EP-11 Tour Guide | US-035 Book tour | Could | 5 | S5 |
| EP-12 Community | US-036 Groups | Should | 5 | S5 |
| EP-12 Community | US-037 Follows | Should | 3 | S5 |
| EP-13 Search/Feed | US-038 Search | Should | 8 | S3→S5 |
| EP-13 Search/Feed | US-039 Personalized feed | Should | 5 | S5 |
| EP-13 Search/Feed | US-040 Saved search | Could | 3 | S5 |
| EP-14 Notifications | US-041 Activity notifications | Could | 5 | S5 |
| EP-14 Notifications | US-042 Notification prefs | Could | 3 | S5 |

---

## 3. Sprint Capacity & Load

> Assumed team velocity ≈ 40 points/sprint. Foundation setup (non-story engineering) consumes part of S0.

| Sprint | Committed Stories | Story Points | Notes |
|---|---|---|---|
| **S0** | Foundation eng + US-001, US-002 (skeleton) | ~8 (+setup) | Repo, Docker, CI, auth skeleton, design system |
| **S1** | US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-010, US-011 | 53 | Split auth polish + RBAC + Masters; may spill low-priority items |
| **S2** | US-012, US-013, US-014, US-015, US-016, US-017, US-018, US-020, US-021 | 45 | Catalog + media + rich text |
| **S3** | US-019, US-022, US-023, US-024, US-025, US-043, US-044, US-045, US-038 (start) | 35 | Engagement + moderation |
| **S4** | US-026, US-027, US-027a, US-028, US-029, US-030, US-031 | 37 | Marketplace + KYC |
| **S5** | US-032, US-033, US-034, US-035, US-036, US-037, US-039, US-040, US-041, US-042 | 45 | Travel + community + notifications |

> S1 is over nominal velocity; `Should`-priority US-003/US-004 are the first candidates to roll into S2 if needed.

---

## 4. Prioritized Backlog (Ordered)

Ranked top-to-bottom by delivery order. Higher rows are pulled first.

| Rank | Story | Epic | Priority | Points | Rationale |
|---|---|---|---|---|---|
| 1 | US-001 Register | EP-01 | Must | 5 | Nothing works without identity |
| 2 | US-002 Login/Logout | EP-01 | Must | 3 | Session foundation |
| 3 | US-005 RBAC enforcement | EP-02 | Must | 8 | Security backbone |
| 4 | US-006 Assign roles | EP-02 | Must | 5 | Operate the platform |
| 5 | US-007 Map permissions | EP-02 | Must | 5 | Configurable least-privilege |
| 6 | US-009 Masters CRUD | EP-03 | Must | 8 | Powers all taxonomy/forms |
| 7 | US-010 Cascade masters | EP-03 | Must | 5 | Data consistency |
| 8 | US-008 Suspend/ban | EP-02 | Must | 5 | Trust & safety baseline |
| 9 | US-011 Reference lists | EP-03 | Must | 3 | Tags/reasons/currency |
| 10 | US-012 Create car post | EP-04 | Must | 8 | Core content |
| 11 | US-016 Upload 20 images | EP-05 | Must | 8 | Core media |
| 12 | US-017 Media validation | EP-05 | Must | 5 | Quality/safety gate |
| 13 | US-020 Rich text editor | EP-06 | Must | 5 | Content authoring |
| 14 | US-021 XSS sanitization | EP-06 | Must | 5 | Security-critical |
| 15 | US-013 Create bike post | EP-04 | Must | 5 | Core content |
| 16 | US-014 Edit/delete post | EP-04 | Must | 3 | Content management |
| 17 | US-015 View post detail | EP-04 | Must | 3 | Consumption |
| 18 | US-022 Comment requires signup | EP-07 | Must | 3 | Accountability |
| 19 | US-023 Review + tags | EP-07 | Must | 5 | Engagement core |
| 20 | US-043 Report content | EP-15 | Must | 3 | Safety |
| 21 | US-044 Moderate queue | EP-15 | Must | 8 | Safety operations |
| 22 | US-026 Create listing | EP-08 | Must | 8 | Commerce core |
| 23 | US-029 Seller KYC | EP-09 | Must | 8 | Trust gate for selling |
| 24 | US-030 Buyer KYC | EP-09 | Must | 5 | Trust gate for buying |
| 25 | US-031 KYC review | EP-09 | Must | 5 | Approval workflow |
| 26 | US-027 Listing lifecycle | EP-08 | Must | 5 | Commerce integrity |
| 27 | US-028 Contact reveal | EP-08 | Must | 3 | Verified-buyer commerce |
| 28 | US-003 Profile | EP-01 | Should | 3 | Identity polish |
| 29 | US-004 Password reset | EP-01 | Should | 3 | Account recovery |
| 30 | US-018 Reorder/primary | EP-05 | Should | 3 | Media UX |
| 31 | US-019 Orphan cleanup | EP-05 | Should | 5 | Housekeeping |
| 32 | US-024 Threaded replies | EP-07 | Should | 3 | Discussion quality |
| 33 | US-025 Edit/delete own | EP-07 | Should | 2 | Contribution control |
| 34 | US-045 Audit trail | EP-15 | Should | 3 | Accountability |
| 35 | US-027a Listing expiry | EP-08 | Should | 3 | Inventory hygiene |
| 36 | US-038 Search | EP-13 | Should | 8 | Discovery |
| 37 | US-032 Travel blog | EP-10 | Should | 5 | Travel pillar |
| 38 | US-033 Travel discovery | EP-10 | Should | 3 | Travel pillar |
| 39 | US-034 Tour listing | EP-11 | Should | 5 | Tour pillar |
| 40 | US-036 Groups | EP-12 | Should | 5 | Community |
| 41 | US-037 Follows | EP-12 | Should | 3 | Community |
| 42 | US-039 Personalized feed | EP-13 | Should | 5 | Engagement |
| 43 | US-035 Book tour | EP-11 | Could | 5 | Tour monetization |
| 44 | US-040 Saved search | EP-13 | Could | 3 | Buyer convenience |
| 45 | US-041 Notifications | EP-14 | Could | 5 | Retention |
| 46 | US-042 Notification prefs | EP-14 | Could | 3 | Control |

---

## 5. Definition of Ready (DoR)

A backlog item is Ready when:
- It links to an Epic and has a clear As-a/I-want/So-that.
- Acceptance criteria (Given/When/Then) are written.
- Dependencies (masters, roles, events) are identified.
- Story points estimated and priority assigned.
- UX/design notes attached where UI is involved.

## 6. Definition of Done (DoD) — summary

An item is Done when:
- Code merged with passing CI and required reviews.
- All acceptance criteria met; linked test cases pass (see [`test-cases.md`](./test-cases.md)).
- Negative, security, and (where relevant) performance cases covered.
- RBAC enforced server-side; input validated and sanitized.
- Domain events emitted via Outbox where specified.
- Docs/tracker updated. See the agile Definition of Done for the authoritative checklist.

---

## 7. Risk & Dependency Watchlist

| Risk / Dependency | Impact | Mitigation |
|---|---|---|
| RBAC (EP-02) blocks nearly everything | High | Prioritize in S1; stub permissions early in S0 |
| Masters (EP-03) feed all forms | High | Seed reference data via Flyway; build CRUD early |
| Media validation reliability (EP-05) | High | Server-side revalidation + magic-byte checks |
| XSS sanitization gaps (EP-06) | Critical | Central sanitizer + security tests before S3 engagement |
| KYC review throughput (EP-09) | Medium | Queue + SLAs + audit; staff moderation early |
| Outbox/Kafka delivery reliability | High | At-least-once + idempotent consumers |
