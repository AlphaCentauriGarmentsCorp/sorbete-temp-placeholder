// src/data/orderConfig.js
// Single source of truth for the online order flow (Path A + Path B).
// Import from both GuidedWalkthrough.jsx and DirectForm.jsx.
//
// Ported verbatim from design-reference/04-Frontend-Update-React-Code/orderConfig.js
// (the canonical, already-correct pricing engine — 60/40 split + ₱1,000 sample fee),
// plus the minor/major sample-defect fee from FRONTEND-BUILD-SPEC §4 (new since that file).

// ---------------------------------------------------------------------------
// PRICING MODEL (2026-08 revision) — mirrors app/Domain/OrderConfig.php.
// The backend is authoritative; this copy exists so the UI can quote live.
//
// Plain and Printed tees price from SEPARATE base tables. The printed table already
// has ONE front print colour baked in — that is why the first front colour reads as
// "free". It is included, not free.
//
// Print colours are charged as ONE pool across every placement:
//     chargeable = (front + back + sleeve) - 1      // the baked-in colour
//     charge     = chargeable * PRINT_COLOR_FEE
//
// The old flat "+₱25 Front + back" surcharge is GONE — back print is per-colour now,
// so keeping it would double-charge.
//
// Only Plain and Printed have standard pricing. Everything else is priceClass: null
// and available: false — quoted case-by-case by the team.
// ---------------------------------------------------------------------------

export const STYLES = [
  { id: 'plain-tee',   label: 'Plain Tee',       sub: 'Blank tee · no print', priceClass: 'plain',   available: true,  hasPrint: false, printOptional: false, isPant: false },
  { id: 'printed-tee', label: 'Printed Tee',     sub: 'Custom-print tee',     priceClass: 'printed', available: true,  hasPrint: true,  printOptional: false, isPant: false },
  { id: 'long-sleeve', label: 'Long Sleeve Tee', sub: 'Quoted on request',    priceClass: null,      available: false, hasPrint: true,  printOptional: true,  isPant: false },
  { id: 'hoodie',      label: 'Hoodie',          sub: 'Quoted on request',    priceClass: null,      available: false, hasPrint: true,  printOptional: true,  isPant: false },
  { id: 'jogger',      label: 'Jogger Pants',    sub: 'Quoted on request',    priceClass: null,      available: false, hasPrint: true,  printOptional: true,  isPant: true  },
  { id: 'cargo',       label: 'Cargo Pants',     sub: 'Quoted on request',    priceClass: null,      available: false, hasPrint: true,  printOptional: true,  isPant: true  },
]

// Only these can be newly ordered today.
export const ORDERABLE_STYLES = STYLES.filter((s) => s.available)

// Fit shown for tees only (not pants). In Path A it renders INLINE under Style.
export const FITS = ['Standard', 'Boxy', 'Oversized']

// Sizes are SINGLE-SELECT (sample = one size). Production quantity comes later.
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']

// Boxy and Oversized share ONE price tier — not two separate ones.
const FIT_TIER = { Standard: 'Standard', Boxy: 'Oversized', Oversized: 'Oversized' }

// Per-piece base price: priceClass → fit tier → size.
export const BASE_PRICES = {
  plain: {
    Standard:  { XS: 200, S: 200, M: 200, L: 210, XL: 210, '2XL': 230, '3XL': 230 },
    Oversized: { XS: 220, S: 220, M: 220, L: 230, XL: 230, '2XL': 250, '3XL': 250 },
  },
  printed: {
    Standard:  { XS: 300, S: 300, M: 300, L: 310, XL: 310, '2XL': 330, '3XL': 330 },
    Oversized: { XS: 330, S: 330, M: 330, L: 340, XL: 340, '2XL': 360, '3XL': 360 },
  },
}

// Per-size price table for a given style + fit, or null when the style is quoted
// case-by-case. Use this instead of the legacy flat SIZE_PRICES below.
export const sizePricesFor = (styleId, fit = 'Standard') => {
  const cls = styleById(styleId).priceClass
  if (!cls) return null
  return BASE_PRICES[cls][FIT_TIER[fit] || 'Standard']
}

// @deprecated legacy flat table (plain tee only) — kept so older callers keep working.
export const SIZE_PRICES = {
  Standard:  BASE_PRICES.plain.Standard,
  Boxy:      BASE_PRICES.plain.Oversized,
  Oversized: BASE_PRICES.plain.Oversized,
}
export const SIZE_PRICED_STYLES = STYLES.filter((s) => s.priceClass).map((s) => s.id)

export const COLLARS = [
  { label: 'Standard ribbed crew',     sub: 'Classic 1×1 rib · included',   addPerPc: 0 },
  { label: 'Pro Club-style thick rib', sub: 'Heavier collar · +₱25 / pc',   addPerPc: 25 },
]
export const SLEEVES = [
  { label: 'Standard cuff', sub: 'Clean set-in cuff · included', addPerPc: 0 },
  { label: 'Ribbed cuff',   sub: '1×1 rib cuff · +₱15 / pc',     addPerPc: 15 },
]
// Side slits REMOVED. Tee hems both included. Pants use "Leg opening".
export const HEMS_TEE = [
  { label: 'Standard open hem',     sub: 'Clean folded hem · included',   addPerPc: 0 },
  { label: 'Standard straight hem', sub: 'Double-needle stitch · included', addPerPc: 0 },
]
export const HEMS_PANT = [
  { label: 'Elastic cuff', sub: 'Ribbed elastic leg · included', addPerPc: 0 },
  { label: 'Open leg',     sub: 'Straight open leg · included',  addPerPc: 0 },
]

// Price depends on SIZE only — fabric carries NO surcharge.
export const FABRICS = [
  { label: '220 GSM — Lightweight',      sub: 'Classic fit · everyday tee',  value: '220 GSM' },
  { label: 'Classic Tee — CVC 240 GSM',  sub: 'Classic fit · everyday',      value: 'CVC 240 GSM' },
  { label: 'Classic Tee — CVC 280 GSM',  sub: 'Classic fit · heavier drape', value: 'CVC 280 GSM' },
  { label: 'Premium Tee — 280 GSM',      sub: 'Premium hand-feel line',      value: 'Premium 280 GSM' },
]

// Catalog colors available PER FABRIC/GSM. Plus a free custom hex picker in the UI.
export const COLORS_BY_FABRIC = {
  '220 GSM':         ['Black', 'White', 'Navy', 'Heather Grey', 'Red'],
  'CVC 240 GSM':     ['Black', 'White', 'Navy', 'Sage Green', 'Maroon', 'Heather Grey', 'Red', 'Royal Blue', 'Mustard', 'Forest'],
  'CVC 280 GSM':     ['Black', 'White', 'Navy', 'Sage Green', 'Maroon', 'Heather Grey'],
  'Premium 280 GSM': ['Black', 'White', 'Bone', 'Chocolate', 'Olive'],
}
export const COLOR_HEX = {
  Black:'#111111', White:'#f4f4f0', Navy:'#1e2a44', 'Heather Grey':'#b8b6ae', Red:'#c1272d',
  'Sage Green':'#9caf88', Maroon:'#6b2436', 'Royal Blue':'#2b4c9b', Mustard:'#e0a32e',
  Forest:'#2f5d3a', Bone:'#e7e0cf', Chocolate:'#4a352a', Olive:'#6b6a3a',
}

// The business's official 20-color reference card (name + HEX) — one universal palette
// used by the walk-in flow's color picker, not tied to fabric/GSM like COLORS_BY_FABRIC
// above (which is a smaller, per-fabric list for the online guided/instant paths).
export const SHIRT_COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Off White', hex: '#F2F1EE' },
  { name: 'Ivory', hex: '#FFFEF2' },
  { name: 'Cream', hex: '#FDFBD4' },
  { name: 'Pink', hex: '#F7B0BB' },
  { name: 'Light Royal Blue', hex: '#1C3F87' },
  { name: 'Royal Blue', hex: '#02066F' },
  { name: 'Dark Royal Blue', hex: '#041848' },
  { name: 'Navy Blue', hex: '#00022E' },
  { name: 'Emerald Green', hex: '#046007' },
  { name: 'Christmas Green', hex: '#1C7A2F' },
  { name: 'Fatigue', hex: '#41411D' },
  { name: 'Mustard Gold', hex: '#CD7F32' },
  { name: 'Red', hex: '#780606' },
  { name: 'Brown', hex: '#332211' },
  { name: 'Mocha', hex: '#C6A38A' },
  { name: 'Ash Gray', hex: '#5B5B5B' },
  { name: 'Special Gray', hex: '#A9A9A9' },
  { name: 'Silver Gray', hex: '#C0C0C0' },
]

export const PRINT_COLOR_FEE = 20
export const FREE_PRINT_COLORS = 1   // one colour is already inside the printed base
export const MAX_PRINT_COLORS = 12   // guard rail on the "Others (5+)" number input

// FRONT print colours — the 1st is already paid for inside the printed base price,
// so it reads as free to the customer.
export const PRINT_COLOR_OPTIONS = [
  { n: 1, label: '1 color',  sub: 'Included in base price' },
  { n: 2, label: '2 colors', sub: 'Adds one screen · +₱20 / pc' },
  { n: 3, label: '3 colors', sub: 'Adds two screens · +₱40 / pc' },
  { n: 4, label: '4 colors', sub: 'Adds three screens · +₱60 / pc' },
  { n: 5, label: 'Others',   sub: '5+ colors · +₱20 per color after 1st' },
]

// BACK print colours — no free colour here; the included one was spent on the front.
export const BACK_PRINT_COLOR_OPTIONS = [
  { n: 1, label: '1 color',  sub: '+₱20 / pc' },
  { n: 2, label: '2 colors', sub: '+₱40 / pc' },
  { n: 3, label: '3 colors', sub: '+₱60 / pc' },
  { n: 4, label: '4 colors', sub: '+₱80 / pc' },
  { n: 5, label: 'Others',   sub: '5+ colors · +₱20 per color' },
]

// @deprecated single-placement helper — use printCharge(form) instead.
export const printColorSurcharge = (n) => (n > 1 ? PRINT_COLOR_FEE * (n - 1) : 0)

const clampColors = (v, min) => Math.max(min, Math.min(MAX_PRINT_COLORS, Number(v) || 0))

// Normalised colour counts per placement. Falls back to the legacy `printColors`
// field so orders built before this revision still price identically.
export function printColors(f) {
  if (!f?.hasDesign) return { front: 0, back: 0, sleeve: 0, total: 0 }

  const wantsBack = f.placement === 'Front + back'

  // A design always carries at least one front colour. Likewise, asking for a back print
  // without naming a colour count means one colour — never zero, which would hand out the
  // back print free. An explicit 0 is still honoured. "Front only" never carries back.
  const front = clampColors(f.printColorsFront ?? f.printColors ?? 1, 1)
  const sleeve = clampColors(f.printColorsSleeve ?? 0, 0)
  const back = wantsBack ? clampColors(f.printColorsBack ?? 1, 0) : 0

  return { front, back, sleeve, total: front + back + sleeve }
}

// One pool across every placement, minus the single colour baked into the base.
export function printCharge(f) {
  const { total } = printColors(f)
  return total === 0 ? 0 : PRINT_COLOR_FEE * Math.max(0, total - FREE_PRINT_COLORS)
}

// Shown for non-tee styles that can be plain OR printed (Long Sleeve, Hoodie, Jogger, Cargo).
export const PRINT_CHOICES = [
  { id: 'none', label: 'Plain — no print',  sub: 'No design, keep it blank' },
  { id: 'has',  label: 'Yes, has a design', sub: 'I’ll pick print details next' },
]

// Placement itself no longer carries a surcharge — back print is priced PER COLOUR,
// so the old flat +₱25 would double-charge. Picking "Front + back" reveals a second
// colour selector; that selector is what costs money.
export const PLACEMENTS = [
  { label: 'Front only',   sub: 'Single placement · included',   addPerPc: 0 },
  { label: 'Front + back', sub: 'Adds back print · +₱20 / color', addPerPc: 0 },
]

export const MIN_QTY = 50
export const SAMPLE_FEE = 1000 // added to the grand total on the quote

// ---- sample-defect handling (FRONTEND-BUILD-SPEC §4) ---------------------
// After the physical sample, the SELLER (not the client) classifies any requested
// change as minor or major:
//   minor → fixed in-house, NO additional fee → proceed to 60% downpayment.
//   major → client pays another ₱1,000 sample fee (separate, not credited) and a new
//           sample is remade before proceeding (state machine loops to sample_fee_to_pay).
export const SAMPLE_DEFECT_FEE = SAMPLE_FEE
export const DEFECT_CLASSES = [
  { id: 'minor', label: 'Minor — fixed in-house', sub: 'No extra fee · proceed to downpayment', fee: 0 },
  { id: 'major', label: 'Major — remake sample',  sub: `New ₱${SAMPLE_DEFECT_FEE.toLocaleString('en-PH')} sample fee · not credited`, fee: SAMPLE_DEFECT_FEE },
]
export const defectFee = (classification) => (classification === 'major' ? SAMPLE_DEFECT_FEE : 0)

// REMOVED from the flow entirely: Print Method step, Fulfillment step,
// Design-file upload step. Do not re-add.

// ---- helpers -------------------------------------------------------------

export const styleById = (id) => STYLES.find((s) => s.id === id) || STYLES[0]
export const isPant = (id) => !!styleById(id).isPant
export const showsPrice = (styleId) => SIZE_PRICED_STYLES.includes(styleId)
export const hemsFor = (styleId) => (isPant(styleId) ? HEMS_PANT : HEMS_TEE)
export const colorsFor = (fabric) => COLORS_BY_FABRIC[fabric] || []

// Which parts to show for a given style + print choice.
export function showFor(styleId, printChoice) {
  const s = styleById(styleId)
  const printDesign = s.printOptional ? printChoice === 'has' : s.hasPrint
  return {
    fit: !s.isPant,
    collar: ['plain-tee', 'printed-tee', 'long-sleeve'].includes(styleId),
    sleeve: !s.isPant,
    needsPrintChoice: s.printOptional,
    printDesign,
    isPant: s.isPant,
  }
}

export const basePrice = (f) => sizePricesFor(f.style, f.fit)?.[f.size] ?? null

// Returns null for styles with no standard pricing. Treat null as "quote required",
// NEVER as zero — a null here means a human has to price it.
export function pricePerPc(f) {
  const base = basePrice(f)
  if (base == null) return null

  const collar = COLLARS.find((c) => c.label === f.collar)?.addPerPc || 0
  const sleeve = SLEEVES.find((c) => c.label === f.sleeve)?.addPerPc || 0
  return base + collar + sleeve + printCharge(f)
}

// Itemised per-piece lines for the quote screen. Front and back print are shown on
// SEPARATE lines for the customer, even though the engine bills them from one pool —
// the split is presentational, the total is not.
export function priceBreakdown(f) {
  const base = basePrice(f)
  if (base == null) return { quoteRequired: true, perPc: null, lines: [] }

  const { front, back, sleeve } = printColors(f)
  const frontCharge  = PRINT_COLOR_FEE * Math.max(0, front - FREE_PRINT_COLORS)
  const backCharge   = PRINT_COLOR_FEE * back
  const sleeveCharge = PRINT_COLOR_FEE * sleeve

  const collar = COLLARS.find((c) => c.label === f.collar)?.addPerPc || 0
  const cuff   = SLEEVES.find((c) => c.label === f.sleeve)?.addPerPc || 0

  const plural = (n) => (n === 1 ? 'color' : 'colors')
  const lines = [{ key: 'base', label: 'Base price', amount: base }]

  if (front > 0) {
    lines.push({
      key: 'printFront',
      label: `Front print · ${front} ${plural(front)}`,
      amount: frontCharge,
      note: front === 1 ? 'Included in base price' : null,
    })
  }
  if (back > 0)   lines.push({ key: 'printBack',   label: `Back print · ${back} ${plural(back)}`,      amount: backCharge })
  if (sleeve > 0) lines.push({ key: 'printSleeve', label: `Sleeve print · ${sleeve} ${plural(sleeve)}`, amount: sleeveCharge })
  if (collar > 0) lines.push({ key: 'collar',      label: f.collar, amount: collar })
  if (cuff > 0)   lines.push({ key: 'cuff',        label: f.sleeve, amount: cuff })

  return {
    quoteRequired: false,
    perPc: base + collar + cuff + frontCharge + backCharge + sleeveCharge,
    lines,
  }
}

export function quoteTotals(f, qty) {
  const perPc = pricePerPc(f) ?? 0
  const total = perPc * (Number(qty) || 0)
  const grandTotal = total + SAMPLE_FEE
  const dp = Math.round(grandTotal * 0.6)
  return { perPc, total, sampleFee: SAMPLE_FEE, grandTotal, dp, bal: grandTotal - dp }
}

export const peso = (n) => '₱' + Number(n || 0).toLocaleString('en-PH')
