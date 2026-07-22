# AutoHub — Product Vision

> Single source of truth for product direction. Aligns with the AutoHub Canonical Build Spec. All names, roles, and rules referenced here are FIXED by that spec.

## 1. Vision Statement

**AutoHub** is a community-first platform where car and bike enthusiasts discover vehicles, share reviews, buy and sell with confidence, and plan road trips — all in one trusted place. We combine rich automotive content, a safe KYC-backed marketplace, and a travel layer (blogs and tour guides) so that the passion for vehicles extends beyond ownership into the journeys people take.

> "From the first review to the final road trip — AutoHub is where automotive life happens."

## 2. Problem Statement

Today, the automotive enthusiast journey is fragmented across disconnected tools:

| Pain Point | Current Reality | Impact |
|---|---|---|
| Scattered information | Reviews on forums, specs on OEM sites, opinions on social media | Buyers can't form a confident view |
| Unsafe peer-to-peer selling | Classifieds with no identity verification | Fraud, scams, wasted time |
| Low-trust content | Anonymous comments, spam, fake reviews | Community credibility erodes |
| No journey layer | Buying a vehicle and using it (trips, tours) are separate experiences | Missed engagement and retention |
| Weak moderation | Manual, inconsistent, reactive | Toxic content, brand risk |

AutoHub unifies these into a single, moderated, identity-aware platform.

## 3. Target Users

AutoHub serves five primary user groups. Detailed profiles live in [`personas.md`](./personas.md).

1. **Car & bike enthusiasts** — create posts, write reviews, engage with the community.
2. **Sellers** — list vehicles in the marketplace after seller KYC.
3. **Buyers** — browse listings, contact sellers after buyer KYC, transact safely.
4. **Travel bloggers & tour guides** — publish trip stories and offer guided tours.
5. **Community moderators & platform admins** — keep content safe and manage the platform via the control-panel.

## 4. Value Proposition

| Pillar | What we deliver | Why it matters |
|---|---|---|
| **Posts (Cars & Bikes)** | Rich-text posts with up to 20 validated images, reviews, and comments | Deep, trustworthy vehicle knowledge |
| **Travel** | Travel blog + tour-guide bookings tied to vehicles/regions | Extends value from ownership to experience |
| **Community** | Groups, follows, feeds, reputation | Sticky engagement and belonging |
| **Marketplace** | Buy/sell listings gated by buyer & seller KYC | Safe, fraud-resistant transactions |
| **Control-panel** | Masters, RBAC, user management, moderation | Operational control and quality |

**Unique value:** AutoHub is the only platform that connects *content → community → commerce → journeys* with identity verification at the core.

## 5. Product Pillars

```
        AutoHub Platform
  ┌──────────┬──────────┬──────────┬──────────┬──────────┐
  │  Posts   │  Travel  │Community │Marketplace│ Control  │
  │ cars &   │ blog &   │ groups & │ buy/sell  │ panel:   │
  │ bikes    │ tour     │ follows  │ + KYC     │ masters, │
  │ +reviews │ guide    │ + feeds  │           │ RBAC,    │
  │ +comments│          │          │           │ user mgmt│
  └──────────┴──────────┴──────────┴──────────┴──────────┘
```

## 6. Success Metrics & KPIs

### North Star Metric
**Weekly Active Trusted Contributors** — verified users who post, review, comment, list, or book at least once per week.

### KPI Tree

| Category | KPI | Target (12 months) | Measurement |
|---|---|---|---|
| **Acquisition** | Registered users | 100,000 | Cumulative signups |
| Acquisition | Signup → first action conversion | ≥ 45% | Funnel analytics |
| **Engagement** | Weekly active users (WAU) | 25,000 | Distinct users/week |
| Engagement | Posts published / month | 8,000 | Catalog events |
| Engagement | Reviews + comments / month | 40,000 | Engagement events |
| Engagement | Avg. session duration | ≥ 6 min | Client analytics |
| **Trust & Safety** | KYC completion rate (sellers) | ≥ 80% | Identity context |
| Trust & Safety | Reported content resolved < 24h | ≥ 95% | Moderation queue SLA |
| Trust & Safety | Fraudulent listings caught pre-publish | ≥ 90% | Moderation metrics |
| **Marketplace** | Active listings | 15,000 | Listing status = ACTIVE |
| Marketplace | Listing → contact conversion | ≥ 12% | Funnel analytics |
| Marketplace | Buyer KYC completion | ≥ 60% | Identity context |
| **Travel** | Travel posts / month | 1,500 | Travel events |
| Travel | Tour bookings / month | 800 | Booking records |
| **Retention** | 30-day retention | ≥ 35% | Cohort analysis |
| **Quality** | Median image-upload success rate | ≥ 98% | Media metrics |
| **Platform** | API p95 latency | < 400 ms | APM |

## 7. Scope

### In Scope (v1.0)

- Identity & authentication (email/password, JWT sessions).
- RBAC across 8 roles (`SUPER_ADMIN`, `ADMIN`, `MODERATOR`, `SELLER`, `BUYER`, `AUTHOR`, `MEMBER`, `GUEST`) and `resource:action` permissions.
- Control-panel Masters CRUD (Make, Model, Variant, Fuel Type, Body Type, Transmission, Category, Location/City, Currency, Tour Category, Review Tag, Report Reason, Role, Permission).
- Car & bike posts with rich-text editor (react-quill) and 20-image uploader (JPEG/PNG/WEBP, ≤5 MB, ≥640×480).
- Reviews & comments (comment requires signup).
- Marketplace listings with lifecycle and approval.
- Buyer & seller KYC forms and review workflow.
- Travel blog and tour-guide listings.
- Community groups, follows, and feeds.
- Search / feed, notifications.
- Moderation & reporting workflows.
- Two frontends: `web-app` (public) and `control-panel` (admin), React + Bootstrap.

### Out of Scope (v1.0)

| Out-of-scope item | Rationale | Revisit |
|---|---|---|
| In-app payments / escrow | Regulatory + PCI complexity; marketplace is contact-to-transact first | v2.0 |
| Native mobile apps (iOS/Android) | Responsive web first | v2.0 |
| Real-time chat / messaging | Notifications + contact reveal cover v1 | v1.5 |
| AI-generated vehicle valuations | Needs data maturity | v2.0 |
| Multi-language / i18n | English-first launch | v1.5 |
| Auction-style listings | Fixed-price only in v1 | v2.0 |
| Insurance / financing integrations | Partner-dependent | v2.0 |
| Video uploads | Images only in v1 | v1.5 |

## 8. Guiding Principles

1. **Trust by design** — identity verification and moderation are foundational, not add-ons.
2. **Content quality over quantity** — validation, moderation, and reputation guard the feed.
3. **One platform, many journeys** — content, commerce, and travel reinforce each other.
4. **Admin efficiency** — the control-panel makes operators fast and safe.
5. **Secure by default** — least-privilege RBAC, input validation, no secrets in client.

## 9. Release Milestones (aligned to Sprint Plan)

| Sprint | Theme | Headline outcome |
|---|---|---|
| S0 | Foundation | Repo, Docker, CI, auth skeleton, design system |
| S1 | Identity & RBAC | Signup/login, roles, user mgmt, masters CRUD |
| S2 | Catalog | Car/bike posts, rich text, 20-image upload |
| S3 | Engagement | Reviews, comments, moderation |
| S4 | Marketplace & KYC | Listings, buyer/seller KYC, approvals |
| S5 | Travel & Community | Travel blog, tour guide, groups, feeds |

See [`backlog.md`](./backlog.md) and the agile sprint plan for detailed mapping.
