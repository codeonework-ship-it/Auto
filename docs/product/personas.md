# AutoHub — User Personas

> Detailed personas informing product, UX, and prioritization decisions. Roles referenced map to the FIXED RBAC roles: `SUPER_ADMIN`, `ADMIN`, `MODERATOR`, `SELLER`, `BUYER`, `AUTHOR`, `MEMBER`, `GUEST`.

## Persona Index

| # | Persona | Archetype | Primary Role(s) | Pillar Focus |
|---|---|---|---|---|
| P1 | Rohan Mehta | Car Enthusiast | `MEMBER`, `AUTHOR` | Posts, Community |
| P2 | Priya Sharma | Bike Seller | `SELLER`, `MEMBER` | Marketplace |
| P3 | Arjun Nair | Buyer | `BUYER`, `MEMBER` | Marketplace, Posts |
| P4 | Lena Fernandes | Travel Blogger / Tour Guide | `AUTHOR`, `SELLER` | Travel, Community |
| P5 | Sameer Khan | Community Moderator | `MODERATOR` | Community, Moderation |
| P6 | Deepa Rao | Platform Admin | `SUPER_ADMIN`, `ADMIN` | Control-panel |

---

## P1 — Rohan Mehta, the Car Enthusiast

| Attribute | Detail |
|---|---|
| **Age / Location** | 29, Bengaluru |
| **Occupation** | Software engineer, weekend track-day hobbyist |
| **Tech comfort** | High |
| **Devices** | Desktop (evenings), mobile (on the go) |
| **AutoHub roles** | `MEMBER`, upgrades to `AUTHOR` after quality contributions |

**Goals**
- Write detailed, image-rich posts comparing cars he's driven.
- Build a reputation as a trusted reviewer.
- Discover other enthusiasts and join model-specific groups.

**Frustrations**
- Existing forums have poor image handling and no formatting.
- Anonymous trolls derail technical discussions.
- Hard to tell credible reviewers from spammers.

**Needs from AutoHub**
- Rich-text editor (react-quill) with headings, lists, and inline emphasis.
- Upload up to 20 high-res images per post with clear validation feedback.
- Reputation signals and verified badges.

**Key journeys**
1. Signs up → completes profile → publishes first car post with 15 images.
2. Reviews a friend's bike post; comments require an account (which he has).
3. Joins the "Track Day India" group and follows top authors.

**Success looks like:** Rohan's posts rank in search, earn reviews, and he's promoted to `AUTHOR`.

**Quote:** *"I want my write-up to look as good as the car — proper photos, proper formatting."*

---

## P2 — Priya Sharma, the Bike Seller

| Attribute | Detail |
|---|---|
| **Age / Location** | 34, Pune |
| **Occupation** | Small used-bike dealership owner |
| **Tech comfort** | Medium |
| **Devices** | Mobile primarily |
| **AutoHub roles** | `SELLER` (after seller KYC), `MEMBER` |

**Goals**
- List multiple bikes quickly with accurate specs pulled from Masters.
- Reach verified, serious buyers only.
- Manage listing lifecycle (draft → active → sold) easily.

**Frustrations**
- Time wasted on tyre-kickers and scam buyers.
- Classifieds sites don't verify anyone.
- Re-entering the same make/model/variant repeatedly.

**Needs from AutoHub**
- Straightforward **seller KYC** (business/ID documents) with clear status tracking.
- Listing form that reuses Masters (Make, Model, Variant, Fuel Type, etc.).
- Contact reveal only to KYC-verified buyers.

**Key journeys**
1. Registers → submits seller KYC → waits for `kyc:review` approval.
2. Creates a listing; it enters moderation, then goes `ACTIVE` on approval.
3. Marks a bike `SOLD`; listing lifecycle updates and it leaves active search.

**Success looks like:** Faster sales, fewer junk inquiries, verified-buyer contacts.

**Quote:** *"If a buyer is verified, I'll actually pick up the phone."*

---

## P3 — Arjun Nair, the Buyer

| Attribute | Detail |
|---|---|
| **Age / Location** | 41, Kochi |
| **Occupation** | Marketing manager, first-time used-car buyer |
| **Tech comfort** | Medium |
| **Devices** | Desktop for research, mobile for contact |
| **AutoHub roles** | `BUYER` (after buyer KYC), `MEMBER` |

**Goals**
- Research vehicles via reviews before buying.
- Filter marketplace listings by make, budget, fuel type, location.
- Contact sellers safely without exposing personal data prematurely.

**Frustrations**
- Fear of scams and misrepresented vehicles.
- Overwhelming, unfiltered listings.
- No way to verify a seller's legitimacy.

**Needs from AutoHub**
- Trustworthy reviews and posts to inform decisions.
- **Buyer KYC** to unlock seller contact and build seller confidence.
- Powerful search/feed filters and saved searches.

**Key journeys**
1. Browses posts and reviews as a `GUEST`; must sign up to comment.
2. Registers → completes buyer KYC → gains contact-reveal ability.
3. Filters listings, saves favorites, contacts a verified seller.

**Success looks like:** Confident purchase from a verified seller, informed by community content.

**Quote:** *"I'll pay a bit more to know the seller is real and the reviews are honest."*

---

## P4 — Lena Fernandes, the Travel Blogger & Tour Guide

| Attribute | Detail |
|---|---|
| **Age / Location** | 31, Goa |
| **Occupation** | Freelance travel writer and motorcycle tour guide |
| **Tech comfort** | High |
| **Devices** | Mobile (on trips), desktop (writing) |
| **AutoHub roles** | `AUTHOR`, `SELLER` (offers tours) |

**Goals**
- Publish long-form travel blogs with photo galleries.
- Offer guided motorcycle/car tours categorized by Tour Category master.
- Build a following and convert readers into tour bookings.

**Frustrations**
- Blogging platforms don't connect to a vehicle community.
- No unified place to market tours to enthusiasts.
- Image-heavy posts are painful to format elsewhere.

**Needs from AutoHub**
- Travel blog with rich text + 20-image galleries.
- Tour-guide listings tied to Tour Categories, locations, and pricing (Currency master).
- Community follows and feeds to grow an audience.

**Key journeys**
1. Publishes a "Western Ghats ride" travel post with a gallery.
2. Creates a tour-guide listing under "Adventure" tour category.
3. Followers see her posts and tours in their feed; some book.

**Success looks like:** Growing followers, steady tour bookings, cross-promotion with vehicle posts.

**Quote:** *"The people who read my rides are exactly the people who want to book one."*

---

## P5 — Sameer Khan, the Community Moderator

| Attribute | Detail |
|---|---|
| **Age / Location** | 38, Hyderabad |
| **Occupation** | Part-time community moderator, full-time IT admin |
| **Tech comfort** | High |
| **Devices** | Desktop (control-panel) |
| **AutoHub roles** | `MODERATOR` |

**Goals**
- Keep discussions civil and content policy-compliant.
- Review reported posts, comments, reviews, and listings quickly.
- Take fair, auditable actions (hide, remove, warn, ban).

**Frustrations**
- Reactive, manual moderation without a queue.
- No audit trail for actions taken.
- Spam and XSS attempts slipping through rich-text content.

**Needs from AutoHub**
- A moderation queue fed by Report Reasons master.
- Permissions like `content:moderate`, `report:review`, `user:suspend`.
- Sanitized rich text and clear audit logging.

**Key journeys**
1. Opens moderation queue in control-panel, sorted by severity and age.
2. Reviews a reported comment, hides it, and records the reason.
3. Suspends a repeat-offender account (banned users lose posting rights).

**Success looks like:** Reported content resolved < 24h, clean feed, full audit trail.

**Quote:** *"Give me a queue, the context, and a paper trail — I'll keep it clean."*

---

## P6 — Deepa Rao, the Platform Admin

| Attribute | Detail |
|---|---|
| **Age / Location** | 45, Mumbai |
| **Occupation** | Head of Operations, AutoHub |
| **Tech comfort** | High |
| **Devices** | Desktop (control-panel) |
| **AutoHub roles** | `SUPER_ADMIN` (Deepa), delegates `ADMIN` |

**Goals**
- Configure all Masters that power the platform's dropdowns and taxonomy.
- Manage users, assign roles, and enforce least-privilege RBAC.
- Oversee KYC approvals, listing approvals, and platform health.

**Frustrations**
- Hard-coded reference data requiring engineering for every change.
- Over-privileged accounts creating security risk.
- No single console for operations.

**Needs from AutoHub**
- Full **Masters CRUD** (14 master types per spec).
- **RBAC & user management**: create roles, map permissions (`resource:action`), assign to users.
- Dashboards for KYC queue, listing approvals, and moderation SLAs.

**Key journeys**
1. Adds a new Vehicle Make + Models + Variants via Masters CRUD.
2. Creates a `MODERATOR` role mapping and assigns it to Sameer.
3. Reviews the KYC queue and approves/rejects with reasons.

**Success looks like:** Self-service taxonomy, least-privilege access, smooth operations.

**Quote:** *"I should be able to run the platform without filing an engineering ticket."*

---

## Persona → Feature Priority Matrix

| Feature area | P1 Enthusiast | P2 Seller | P3 Buyer | P4 Blogger/Guide | P5 Moderator | P6 Admin |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Auth & signup | High | High | High | High | High | High |
| Car/bike posts + rich text | High | Med | Med | Med | Low | Low |
| 20-image upload | High | High | Low | High | Low | Low |
| Reviews & comments | High | Med | High | Med | Med | Low |
| Marketplace listings | Low | High | High | Med | Med | Med |
| Buyer/Seller KYC | Low | High | High | Med | Low | High |
| Travel blog | Med | Low | Low | High | Low | Low |
| Tour guide | Low | Low | Low | High | Low | Med |
| Community groups/feeds | High | Med | Med | High | Med | Low |
| Moderation/reporting | Low | Low | Low | Low | High | High |
| Masters CRUD | Low | Low | Low | Low | Low | High |
| RBAC & user mgmt | Low | Low | Low | Low | Med | High |
