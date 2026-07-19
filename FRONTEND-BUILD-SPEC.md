# Sorbetes Ordering & Auth System — Consolidated Frontend Build Spec

**Purpose:** single reconciled reference for whoever (AI or human) builds the real `sorbetes-frontend` React app. Every decision below is pulled from a specific existing source doc — nothing here is a new decision. Where sources disagree, this doc states which one wins and why.

---

## Status: all decisions locked

**Auth: Google-only — confirmed.** No email/password fallback. This was the one open item from `Sorbetes_Flowchart_v8.pdf`; it's resolved as of this doc. Direct consequence: the `otp`, `forgot-password`, and `new-password` routes in §1 are dropped, not built — they only existed to support password-based auth.

---

## Scope for this build: frontend only

**Fresh start.** This is a brand-new empty repo — no existing app, no scaffold, no conventions to inherit. Scaffold a new Vite + React 19 project from scratch. `FRONTEND_UPDATE.md` in the reference bundle was written as if an app already existed (it references an `App.jsx` with query-param routing and a set of existing pages) — treat those as *suggested conventions to adopt*, not descriptions of files you'll find. There's nothing to reconcile against; you're establishing the structure.

**No backend exists yet either.** Everything in this spec that implies a server — Google OAuth session creation, order state persistence, payment proof review, SMS notifications, PayMongo — has no API to call right now. Build the frontend against **mocked/stubbed data and local state** that mirrors the real shapes (e.g. the order state machine in §6), with integration points clearly marked (e.g. `// TODO: replace with real API call`) so a backend can be wired in later without restructuring the frontend. Don't attempt to actually implement Google's OAuth server-side handshake, real SMS sending, or real payment verification — fake the response shape and move on.

---

## Existing logic to port, not reinvent

The HTML prototypes aren't just visual references — several already contain real, working interaction logic that should be **read and ported**, not re-derived from scratch or guessed at from screenshots:

- **Pricing engine** — `orderConfig.js` (`pricePerPc()`, `quoteTotals()`) is the canonical calculation; already correct, just needs the minor/major sample-defect fee logic added (§4/§5).
- **Scroll-scrub builder mechanics** — `Get Quote.html` and the v8 `Sorbetes Order Flow (Standalone).html` build both implement a real scroll-linked animation engine (interpolated scroll progress, live-updating preview, live price recalculation on every option change — see `recalc()`, `tick()`, `updateTargets()` in `Get Quote.html`'s script). Port this mechanism, don't rebuild the scroll-scrub concept from a still image.
- **Guided-walkthrough conditional logic** — `GWQ.dc.html` has real branching (`hasDesign`, `wantHelp`, `canAdvance`, `isLast`) governing which questions show and when "Next" is enabled. Same pattern applies to the fit/collar/sleeve/print conditionals in `orderConfig.js` (fit hidden for pants, print step only for non-plain styles, etc.) — both are already-decided UI logic, not open to reinterpretation.
- **Mockup tool** — `Mockup.dc.html` has working drag-and-resize logic for placing a logo on the flat-lay tee image. If the logo mockup feature carries into the real app, port this rather than rebuilding drag/resize from scratch.

When in doubt about how a specific interaction should behave, the prototype's own script is the answer key — check it before guessing.

---

## Source-of-truth ranking (in case any file still conflicts)

1. **`Sorbetes_Flowchart_v8.pdf`** — highest authority. Explicitly "Revised... Supersedes v1-v7." Governs auth, payment, and order-state logic.
2. **`FRONTEND_UPDATE.md` + `orderConfig.js`** — governs page/route structure and pricing math. Already agrees with v8 on the 60/40 split — no conflict here.
3. **`03-Order-Flow-Export-Formats/Sorbetes Order Flow (v8 video-scrub - CURRENT).html`** — current UI/visual reference for the ordering flow and choose-your-path screen.
4. **Superseded — do not build from these for payment logic:** `Payment.dc.html`, `GWQ Pricing.dc.html`, `Fill Form Directly Pricing.dc.html` (all still show the old 50%/50% split). Fine to reuse for layout/visual style, not for numbers.

---

## 1. Page / route inventory
*(from `FRONTEND_UPDATE.md`, unchanged)*

| `?page=` | Component | Prototype screen | Action |
|----------|-----------|------------------|--------|
| `home` | Homepage | Home | keep |
| `our-story` | OurStory | Our Story | keep |
| `services` | Services | Services | keep |
| `portfolio*` | Portfolio* | Portfolio | keep |
| `guide`, `fabric-print-guide` | guides | Guides | keep |
| `walkthrough` | GuidedWalkthrough | Path A — Online / Guided (scroll-scrub) | rework |
| `direct-form` | DirectForm | Path B — Online / Instant | rework |
| `pricing` | Pricing | (folded into size step + quote) | keep as reference |
| `walk-ins` | WalkInsInfo (NEW) | "For Walk-Ins" address + map | add |
| `walk-in` | WalkInForm (+steps) | In-store QR kiosk | keep (unchanged) |
| `founders-club*`, `get-in-touch` | — | — | keep |
| `my-orders`, `track-order`, `account` | dashboard | Signed-in dashboard | keep |
| `auth` | — | Google sign-in trigger | keep, rework to trigger Google OAuth |
| `otp`,`forgot-password`,`new-password` | — | — | **dropped — Google-only auth confirmed, no password flow to support these** |

Entry chooser: two online cards (Guided / Instant) + Walk-in reached separately via nav → `?page=walk-ins`, not the QR flow directly.

---

## 2. Auth model — CONFIRMED
*(from `Sorbetes_Flowchart_v8.pdf`, fallback question resolved by Josh: Google-only)*

- **Google OAuth only** (Google Auth API) for all online authentication. No email/password fallback.
- No OTP, no password-reset flow to build — Google handles identity verification end to end.
- New Google sign-in → create account from Google profile (name, email) → create session.
- Returning → session created, route to intended destination (resume in-progress quote if one exists, else Dashboard).
- Guests get **no digital account/lookup** — a walk-in guest is tracked via SMS only, never a login.
- **Walk-in customers who choose to log in** follow the online authenticated flow (account-linked, Dashboard tracking) — but still use the **Walk-in payment subflow** (see below), so cash stays available at the counter.
- `otp`, `forgot-password`, `new-password` pages: **dropped, do not build.** They only existed to support password-based auth.

---

## 3. Payment flow
*(from `Sorbetes_Flowchart_v8.pdf`)*

Three payments per order, always in this order:
1. **₱1,000 sample fee** — separate, not credited toward the total.
2. **60% downpayment** — starts production, only after the client approves the physical sample.
3. **40% balance** — collected at pickup / delivery.

Channels:
- **Online:** GCash, Maya, or Bank Transfer only — **no cash option**.
- **Walk-in:** same three + **Cash at the counter**.
- Non-cash payments: client uploads proof (screenshot/receipt + reference #) → state `payment under review` → staff manually verifies amount + reference → approve or reject with reason. **PayMongo auto-confirm is deferred — build the manual-review flow, not an automated one.**
- Cash (walk-in only): staff confirms receipt on the spot.

---

## 4. Sample review / defect handling
*(from `Sorbetes_Flowchart_v8.pdf`)*

- Client reviews the physical sample and either approves or requests changes.
- **Seller** (not the client) classifies any requested change as **minor** or **major**:
  - **Minor** → fixed in-house, no additional fee, proceeds straight to the 60% downpayment step.
  - **Major** → client pays another ₱1,000 sample fee (separate, not credited) and a new sample is remade before proceeding.
- Walk-in flow: sample-ready notice goes by SMS ("please visit store"); client reviews in person on return visit. Same minor/major branching applies.

---

## 5. Pricing / order config
*(from `orderConfig.js` in `04-Frontend-Update-React-Code/` — already correct, no changes needed)*

Already implements the 60/40 split (`dp: … * 0.6`) and the ₱1,000 sample fee correctly. Use as-is for styles, fits, sizes, fabrics, collars, sleeves, print pricing. This file does **not** yet encode the minor/major sample-defect fee logic from §4 above — that's new since `orderConfig.js` was written, so it'll need adding when the sample-review step is built.

---

## 6. Order state machine
*(from `Sorbetes_Flowchart_v8.pdf`, page 8 — states in order)*

```
waiting_for_seller → sample_fee_to_pay → sample_fee_review
  → sample_production → sample_approval
    ├─ (minor / none) ─────────────────────┐
    └─ (major: new fee + remake) → sample_fee_to_pay (loop)
  → downpayment_to_pay → downpayment_review → in_production
  → ready_to_ship → delivered
```
Side states: `waiting_for_user` (info requested from client), payment `rejected` (with reason, returns to the *_to_pay step).

---

## 7. Known site bugs — not yet fixed, still relevant
*(from `SYSTEM-FLOW-SPEC.md` — carry into the rebuild so they aren't reintroduced)*

- `Choose Between Options` → "Fill out the form directly" currently points to a file that doesn't exist. Should route to the Path B / Instant builder.
- Nav "Start an order" and "Log in" are dead `#` links on every page.
- No re-entry/reorder control anywhere in the signed-in dashboard.
- `Track Order` has no "order not found" state for an unrecognized ID.
- No session is currently enforced anywhere — this should be resolved automatically once the Google-OAuth auth gate (§2) is actually built.

---

## 8. Visual/UX reference
Current-state UI reference for the ordering flow specifically: `03-Order-Flow-Export-Formats/Sorbetes Order Flow (v8 video-scrub - CURRENT).html`. For all other pages (Home, Portfolio, Mockup, auth screens, dashboard), use `01-Website-Prototype/` from the same zip — same visual system (black/yellow, Archivo type), just not yet updated with the v8 payment numbers on-screen.
