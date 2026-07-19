# Sorbetes Frontend — Structure Update Spec

Maps the finished prototype (`Sorbetes Order Flow.dc.html`) onto the real
`sorbetes-frontend` React 19 + Vite app. Apply with Claude Code or by hand.

> Routing is query-param based (`?page=…`) in `src/pages/App.jsx` via
> `getPageParam()` / `navigateToPage()`. Keep that pattern — no react-router.

---

## 1. Route map (App.jsx)

| `?page=` | Component | Prototype screen | Action |
|----------|-----------|------------------|--------|
| `home` | Homepage | Home | keep |
| `our-story` | OurStory | Our Story | keep |
| `services` | Services | Services | keep |
| `portfolio*` | Portfolio* | Portfolio | keep |
| `guide`, `fabric-print-guide` | guides | Guides | keep |
| `walkthrough` | GuidedWalkthrough | **Path A — Online / Guided (scroll-scrub)** | **rework** (§3) |
| `direct-form` | DirectForm | **Path B — Online / Instant** | **rework** (§4) |
| `pricing` | Pricing | (folded into size step + quote) | keep as reference page |
| `walk-ins` | **WalkInsInfo (NEW)** | **"For Walk-Ins" address + map** | **add** (§5) |
| `walk-in` | WalkInForm (+steps) | In-store QR kiosk | keep (unchanged) |
| `founders-club*`, `get-in-touch` | — | — | keep |
| `my-orders`, `track-order`, `account` | dashboard | Signed-in dashboard | keep |
| auth: `auth`,`otp`,`forgot-password`,`new-password` | — | — | keep |

**Entry chooser:** the online start now offers **two** cards — *Online / Guided*
(`?page=walkthrough`) and *Online / Instant* (`?page=direct-form`). The old
**Walk-in Kiosk** card is removed from the online chooser; walk-in is reached from
the nav/CTA and routes to `?page=walk-ins` (the address page, §5), NOT the QR flow.

Add to `App.jsx`:
```jsx
import WalkInsInfo from './WalkInsInfo.jsx'
// …
if (page === 'walk-ins') return <WalkInsInfo />
```

---

## 2. Shared order config (single source of truth) — `src/data/orderConfig.js` (NEW)

Both Path A and Path B read from this. Prevents the two forms drifting apart.

```js
export const STYLES = [
  { id: 'plain-tee',    label: 'Plain Tee',       addPerPc: 0,  hasPrint: false, printOptional: false },
  { id: 'printed-tee',  label: 'Printed Tee',     addPerPc: 0,  hasPrint: true,  printOptional: false },
  { id: 'long-sleeve',  label: 'Long Sleeve Tee', addPerPc: 70, hasPrint: true,  printOptional: true  },
  { id: 'hoodie',       label: 'Hoodie',          addPerPc: 0,  hasPrint: true,  printOptional: true  },
  { id: 'jogger',       label: 'Jogger Pants',    addPerPc: 0,  hasPrint: true,  printOptional: true, isPant: true },
  { id: 'cargo',        label: 'Cargo Pants',     addPerPc: 0,  hasPrint: true,  printOptional: true, isPant: true },
]

// Fit shown for tees only (not pants); rendered INLINE under Style in Path A.
export const FITS = ['Standard', 'Boxy', 'Oversized']

// Per-size base price. Size is SINGLE-SELECT (sample = one size). Qty comes later.
// Long Sleeve Tee adds +70/pc on top. Prices shown for Plain/Printed/Long-Sleeve tees.
export const SIZE_PRICES = {
  Standard:  { XS:200, S:200, M:200, L:210, XL:210, '2XL':230, '3XL':230 },
  Boxy:      { XS:220, S:220, M:220, L:230, XL:230, '2XL':250, '3XL':250 },
  Oversized: { XS:220, S:220, M:220, L:230, XL:230, '2XL':250, '3XL':250 },
}

export const COLLARS = [
  { label: 'Standard ribbed crew',       addPerPc: 0 },
  { label: 'Pro Club-style thick rib',   addPerPc: 25 },
]
export const SLEEVES = [
  { label: 'Standard cuff', addPerPc: 0 },
  { label: 'Ribbed cuff',   addPerPc: 15 },
]
// Side slits REMOVED. Tee hems both included. Pants use "Leg opening".
export const HEMS_TEE  = ['Standard open hem', 'Standard straight hem']
export const HEMS_PANT = ['Elastic cuff', 'Open leg']

// Price depends on SIZE only — fabric carries NO surcharge.
export const FABRICS = ['220 GSM', 'CVC 240 GSM', 'CVC 280 GSM', 'Premium 280 GSM']

// Catalog colors available PER FABRIC/GSM (condition the color list on GSM).
export const COLORS_BY_FABRIC = {
  '220 GSM':          ['Black','White','Navy','Heather Grey','Red'],
  'CVC 240 GSM':      ['Black','White','Navy','Sage Green','Maroon','Heather Grey','Red','Royal Blue','Mustard','Forest'],
  'CVC 280 GSM':      ['Black','White','Navy','Sage Green','Maroon','Heather Grey'],
  'Premium 280 GSM':  ['Black','White','Bone','Chocolate','Olive'],
}
// Plus a free custom hex picker (HSV).

// Print colors: +20/pc per color after the 1st. "Others" = 5+, number input.
export const printColorSurcharge = (n) => (n > 1 ? 20 * (n - 1) : 0)

export const PLACEMENTS = [
  { label: 'Front only',   addPerPc: 0 },
  { label: 'Front + back', addPerPc: 25 },
]

export const SAMPLE_FEE = 1000  // added to grand total on the quote

// REMOVED from the flow entirely: Print Method step, Fulfillment step,
// Design-file upload step. Do not re-add.
```

### Pricing function (use in both paths + quote)
```js
export function pricePerPc(f) {
  const base = (SIZE_PRICES[f.fit] || SIZE_PRICES.Standard)[f.size] || 0
  const style = STYLES.find(s => s.id === f.style)?.addPerPc || 0
  const collar = COLLARS.find(c => c.label === f.collar)?.addPerPc || 0
  const sleeve = SLEEVES.find(c => c.label === f.sleeve)?.addPerPc || 0
  const place  = PLACEMENTS.find(p => p.label === f.placement)?.addPerPc || 0
  const print  = f.hasDesign ? printColorSurcharge(f.printColors || 1) : 0
  return base + style + collar + sleeve + place + print
}
export const quoteTotals = (f, qty) => {
  const perPc = pricePerPc(f)
  const total = perPc * qty
  return { perPc, total, grandTotal: total + SAMPLE_FEE, sampleFee: SAMPLE_FEE,
           dp: Math.round((total + SAMPLE_FEE) * 0.6), bal: (total + SAMPLE_FEE) - Math.round((total + SAMPLE_FEE) * 0.6) }
}
```

---

## 3. Path A — `GuidedWalkthrough.jsx` rework (scroll-scrub)

Current file is a fixed 1920-canvas scaled design (~3200 lines). Replace its
step model with the prototype's **scroll-driven video scrub**:

- **One sticky video/model stage**, progress tied to scroll position (rAF, 1:1
  read + eased draw). Per-part **zoom framing**: Collar → neckline, Sleeve → cuff,
  Hem → hem; Style/Fit/Size → full body; Fabric/Color/Print → torso.
- **Sections & order:** Apparel → Fabric & Color → Print & Design (3 sections).
  Parts within Apparel: Style (with **Fit shown inline** once a fit-capable style
  is picked) → Size → Collar → Sleeve → Hem.
- **Conditions:** fit hidden for pants; collar/sleeve only for tees; hem label =
  "Leg opening" for pants; for Long Sleeve/Hoodie/Jogger/Cargo insert a **Print**
  step ("Plain — no print" vs "Yes, has a design") — Plain skips print
  colors/placement. Printed Tee always shows full print.
- **Removed steps:** Print Method, Fulfillment, Design-file upload.
- **Colorway:** HSV picker + catalog swatches conditioned on chosen GSM.
- **Print colors:** 1–4 cards + **Others** (number input, 5+).
- End → **Quote** (§6) via a "See quotation" bar; per-piece price emphasized in
  the live-estimate bar over the run total.
- Options use the uniform card style (selected = black card, yellow title).

Keep `Navbar`/`Footer`, `navigate`/`navigateBack`. Import config from
`src/data/orderConfig.js` instead of hard-coded option arrays.

---

## 4. Path B — `DirectForm.jsx` rework (instant)

Same config + conditions as Path A, but as a compact scrolling form (no scrub):

- Replace `INITIAL_FORM` + `SELECT_OPTIONS` with `orderConfig.js`.
- Sections: **1 Apparel** (style, inline fit, single-select size w/ per-size price,
  collar, sleeve, hem) · **2 Fabric & Color** (fabric no-price, GSM-conditioned
  color grid + custom) · **3 Print & Design** (print-choice for non-tees → colors
  incl. Others → placement). No print-method, fulfillment, or upload.
- Option groups = compact wrap-grid cards (`flex 1 1 150px`), same visual as Path A.
- Ends on the shared **Quote** (§6).

---

## 5. `WalkInsInfo.jsx` (NEW) — "For Walk-Ins" page

Shown when the online visitor picks walk-in. In-person instruction, not the QR flow.

- Headline **"THIS ONE'S IN PERSON."**, copy explaining the in-store guided flow.
- **Address card:** 117 Mother Ignacia Ave, Diliman, Quezon City, Metro Manila.
- **Interactive Google Maps** `<iframe>` (embed `q=117 Mother Ignacia Ave…`).
- Buttons: **Get directions** (maps link, new tab) + **Get instant quote**
  (`?page=direct-form`). Footer line links Get Instant Quote / Start an Order.
- Uses `Navbar`/`Footer`; add matching `src/design/WalkInsInfo.css`.

The existing `walk-in` QR kiosk flow (`WalkInForm` + steps + `walkInAccess.js`)
stays exactly as-is — that's the on-site experience.

---

## 6. Shared Quote — `src/pages/QuoteSummary.jsx` (NEW, used by both paths)

- Spec grid shows **every input before generation**: Style/Fit, Size, Collar,
  Sleeve, Hem, Fabric, Color, Print (N-color), Placement.
- **Per-piece price emphasized** (large, gold) above the run total.
- Totals fold in the **₱1,000 sample fee** → "Total (incl. sample fee)", with
  garment subtotal + sample fee itemized and a 60% downpayment / 40% balance split.
- Actions: **Copy quote** (plain-text summary to clipboard, with `execCommand`
  fallback + "Copied to Clipboard" state) and **Save as PDF** (print-scoped to the
  quote card via an `@media print` rule; the app already depends on `jspdf` if you
  prefer programmatic export).

---

## 7. File-level checklist

**Add:** `src/data/orderConfig.js` · `src/pages/WalkInsInfo.jsx` +
`src/design/WalkInsInfo.css` · `src/pages/QuoteSummary.jsx` +
`src/design/QuoteSummary.css` · `walk-ins` route in `App.jsx`.

**Rework:** `GuidedWalkthrough.jsx` (scroll-scrub, §3) ·
`DirectForm.jsx` (config-driven, §4) · online entry chooser (drop Walk-in Kiosk
card, point walk-in CTA to `?page=walk-ins`).

**Leave as-is:** `WalkInForm.jsx` + `WalkIn*` steps + `walkInAccess.js` (QR flow),
dashboard (`MyOrders`/`TrackOrder`/`AccountSettings`), auth, Founders Club,
Homepage/OurStory/Services/Portfolio/Guides.

**Retire (after rework lands):** hard-coded `SELECT_OPTIONS` in `DirectForm.jsx`
and the per-step option arrays in `GuidedWalkthrough.jsx` — replaced by
`orderConfig.js`. Print-method / fulfillment / design-upload UI in both.
