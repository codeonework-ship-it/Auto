# MOTORA — Find your next machine

An enterprise-quality, zero-dependency automobile discovery & marketplace experience for **cars and bikes**: trending searches, Elite Garage (top-10 costliest) rankings, deep filtering, full technical specifications, reviews & ratings, professional comparisons, and a six-theme visual system including the original **Mech Command** cinematic-machine theme.

> **Run it:** `node serve.mjs` (from this folder) → open **http://localhost:5500**. No install, no build step.
> Any static file server works too (`npx http-server`, nginx, GitHub Pages…). ES modules require HTTP — don't open `index.html` via `file://`.

---

## 1 · Product & design rationale

| Decision | Why |
|---|---|
| **"Editorial Garage" concept** | Magazine-grade hierarchy (kickers, ranked lists, generous whitespace) fused with engineering telemetry accents (status tags, precision numbers). Premium + youthful without dealership clichés. |
| **Procedural SVG vehicle art — zero raster images** | The brief demands images that "do not take time to load". We go further: every vehicle is drawn as inline, theme-aware SVG (gradient silhouette + blueprint ground-line). 0 network requests, 0 layout shift, works offline, and *is* the brand. `width/height` reserved → CLS = 0. |
| **Fictional catalog** (Aurelion, Ryujin, Volt Havoc…) | Publishes rich specs/prices/reviews without fabricating claims about real products, and keeps Mech Command IP-original per the brand rule. |
| **No Bootstrap / no frameworks** | The brief allows Bootstrap "only if it genuinely improves consistency". A hand-built token system on CSS custom properties is smaller (~14 KB CSS total), can't look like a default template, and makes 6-theme switching a pure paint operation. Vanilla ES-module JS (~30 KB) keeps TTI immediate. |
| **Hash-routed SPA** | Instant page transitions with skeleton states, shareable/bookmarkable filter URLs (`#/listings?type=bike&abs=1`), works from any static host. |
| **Tokens-first theming** | Themes swap `data-theme` on `<html>`; no re-render, no layout shift, AA contrast per theme (High Contrast adds borders + underlines so color is never the only signal). |

## 2 · Page map & user flows

```
#/home        Hero (search + type switch + quick links) → Most Searched (Cars|Bikes tabs)
              → Top-10 Costliest "Elite Garage" (Cars|Bikes) → Categories (car+bike)
              → Brands → Latest owner stories → Why MOTORA → Price-alert CTA
#/listings    Filter sidebar (desktop) / drawer (mobile) · type tabs · sort · grid/list
              · active-filter chips · reset · empty-state recovery
#/vehicle/:id Gallery (kbd + touch) · variants · highlights · full spec tables ·
              variants & EMI · colours · pros/cons · reviews (sort, helpful, report)
              · comments · similar vehicles
#/compare     2–4 same-type vehicles · computed leaders (Best value / Power / Efficiency)
#/reviews     Cross-catalog Driver Intelligence feed
#/saved       "Your garage" favorites
```
Core flows: *discover → narrow → understand → compare → trust reviews → save/quote.* Cross-type comparison is prevented with a plain-language explanation.

## 3 · Component inventory

Header (brand, nav, theme select, reduce-motion, immersive-motion) · Search console w/ combobox suggestions · Segmented control · Vehicle card (grid/list) · Ranked Elite-Garage row · Category & brand cards · Filter panel/drawer (focus-trapped dialog) · Active-filter chips · Sort/view toolbar · Gallery + thumbs · Highlight tiles · Spec tables (tooltipped terms) · Variant selector · Pros/cons · Rating distribution · Review card (expand, helpful, report) · Comment form · Compare table (sticky head, leader highlight) · Compare tray · Toast · Skeleton loader · Empty/error states · Newsletter · Footer.

## 4 · Theme system

`midnight` (default) · `arctic` · `carbon` · `sunset` · `mech` · `contrast` — all in [css/tokens.css](css/tokens.css).
Persisted in `localStorage` (`mv_theme`); invalid stored values fall back to default and self-heal. Mech Command adds CSS-only precision grid + clipped panel corners and an opt-in **Immersive Motion** toggle (✨, off by default). A 🐢 **Reduce motion** control complements `prefers-reduced-motion` (either kills all animation/transitions).

## 5 · Performance & accessibility checklist

- [x] No external images/fonts/libraries; total payload ≈ 60 KB uncompressed
- [x] Below-fold card art injected via IntersectionObserver (300 px margin); dimensions reserved (no CLS)
- [x] Skeleton scan states on every route; theme switch = paint only
- [x] Semantic landmarks, skip-link, logical heading order, `aria-current`, labeled controls
- [x] Combobox pattern for suggestions (`role=listbox`, arrow keys, Esc); gallery arrow-key + swipe
- [x] Filter drawer: `role=dialog`, focus moved in, Tab trapped, Esc closes, focus restored
- [x] 44×44 touch targets; visible `:focus-visible` ring in every theme
- [x] Color never sole indicator (compare leader adds ★, High Contrast underlines links)
- [x] `prefers-reduced-motion` + in-app toggle; count-ups/reveals disabled under either
- [x] Storage-disabled fallback (in-memory), JS-disabled `<noscript>` message
- [x] 320 / 375 / 414 / 768 / 1024 / 1440 px verified — no horizontal scroll

## 6 · Test plan & executed results

Functional (verified in-browser, zero console errors):

| Area | Case | Result |
|---|---|---|
| Home | Most Searched car→bike tab swap updates content | ✅ Aria → Strada 125 |
| Home | Top-10 Costliest car/bike swap, 10 ranked rows | ✅ Sovereign GT / Shogun 1400 GT |
| Home | Category card → filtered listing; quick links | ✅ |
| Search | "ryu" → 3 Ryujin models; ↓↓ + Enter opens 2nd | ✅ landed on Street 770 |
| Search | Garbage `xqz##@@` → recovery suggestions (escaped) | ✅ |
| Listings | type=car&cat=ev → exactly 3 EVs; chips shown | ✅ |
| Listings | Sort price high→low correct order | ✅ |
| Listings | Removing one chip removes only that filter | ✅ 12 cars |
| Listings | min>max price → alert, prices unfiltered | ✅ |
| Listings | Reset-all keeps type, clears rest | ✅ |
| Listings | No-result state with recovery CTA | ✅ |
| Mobile | 320 px: no h-scroll; nav + filter drawer (dialog, focus, Esc); ABS filter → 8 bikes | ✅ |
| Detail | Variant switch updates price ($720k→$860k) & power | ✅ |
| Detail | Gallery arrow-keys + swipe; thumb `aria-current` | ✅ |
| Detail | Spec groups, tooltips, review sort (low-first) works | ✅ |
| Detail | Similar vehicles same type | ✅ |
| Edge | Classica '69: no price/rating/art/reviews + DISCONTINUED handled gracefully | ✅ |
| Compare | 2 cars → leaders computed (value/power/efficiency ★) | ✅ |
| Compare | Adding a bike to a car tray blocked w/ explanation | ✅ |
| Compare | Remove → tray/table update; <2 shows explainer | ✅ |
| Saved | Toggle ♥, garage page, persists reload | ✅ |
| Themes | All 6 change page paint; persist reload (mech verified) | ✅ |
| Themes | Invalid stored theme → default + self-heal | ✅ |
| Motion | 🐢 toggle + OS preference kill animation | ✅ (CSS kill-switch) |

Remaining manual QA (recommended before production): screen-reader pass (NVDA/VoiceOver), Lighthouse CI budget, cross-browser sweep (Chrome/Edge/Firefox/Safari — only standard CSS/JS used; `color-mix` and `clip-path` degrade gracefully), 200 % zoom.

## 7 · API-readiness

`js/data.js` mirrors REST resources (`/vehicles`, `/brands`, categories, embedded `reviews`) — swap the import for `fetch()` calls and the UI is unchanged. This showcase is intentionally standalone; it can later be fed by the AutoHub backend (`/api/v1/posts`, `/reviews`, masters) in this monorepo.

---
*All vehicles, brands, prices and reviews are fictional demo data. "Mech Command" is an original visual language — no franchise names, characters or artwork are used.*
