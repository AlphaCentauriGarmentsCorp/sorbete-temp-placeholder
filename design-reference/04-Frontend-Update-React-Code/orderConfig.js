// src/data/orderConfig.js
// Single source of truth for the online order flow (Path A + Path B).
// Import from both GuidedWalkthrough.jsx and DirectForm.jsx.

export const STYLES = [
  { id: 'plain-tee',   label: 'Plain Tee',       sub: 'Blank tee · no print',   addPerPc: 0,  hasPrint: false, printOptional: false, isPant: false },
  { id: 'printed-tee', label: 'Printed Tee',     sub: 'Custom-print tee',       addPerPc: 0,  hasPrint: true,  printOptional: false, isPant: false },
  { id: 'long-sleeve', label: 'Long Sleeve Tee', sub: 'Long sleeve · +₱70 / pc', addPerPc: 70, hasPrint: true,  printOptional: true,  isPant: false },
  { id: 'hoodie',      label: 'Hoodie',          sub: 'Pullover hoodie',        addPerPc: 0,  hasPrint: true,  printOptional: true,  isPant: false },
  { id: 'jogger',      label: 'Jogger Pants',    sub: 'Jogger fit',             addPerPc: 0,  hasPrint: true,  printOptional: true,  isPant: true  },
  { id: 'cargo',       label: 'Cargo Pants',     sub: 'Cargo fit',              addPerPc: 0,  hasPrint: true,  printOptional: true,  isPant: true  },
]

// Fit shown for tees only (not pants). In Path A it renders INLINE under Style.
export const FITS = ['Standard', 'Boxy', 'Oversized']

// Sizes are SINGLE-SELECT (sample = one size). Production quantity comes later.
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL']

// Per-size base price. Long Sleeve Tee adds +₱70/pc on top (see STYLES.addPerPc).
// Per-size price is shown for Plain / Printed / Long-Sleeve tees only.
export const SIZE_PRICES = {
  Standard:  { XS: 200, S: 200, M: 200, L: 210, XL: 210, '2XL': 230, '3XL': 230 },
  Boxy:      { XS: 220, S: 220, M: 220, L: 230, XL: 230, '2XL': 250, '3XL': 250 },
  Oversized: { XS: 220, S: 220, M: 220, L: 230, XL: 230, '2XL': 250, '3XL': 250 },
}
export const SIZE_PRICED_STYLES = ['plain-tee', 'printed-tee', 'long-sleeve']

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

// Print colors: +₱20/pc per color after the 1st. "Others" = 5+ (number input).
export const PRINT_COLOR_OPTIONS = [
  { n: 1, label: '1 color',  sub: 'Included in base price' },
  { n: 2, label: '2 colors', sub: 'Adds one screen · +₱20 / pc' },
  { n: 3, label: '3 colors', sub: 'Adds two screens · +₱40 / pc' },
  { n: 4, label: '4 colors', sub: 'Adds three screens · +₱60 / pc' },
  { n: 5, label: 'Others',   sub: '5+ colors · +₱20 per color after 1st' },
]
export const printColorSurcharge = (n) => (n > 1 ? 20 * (n - 1) : 0)

// Shown for non-tee styles that can be plain OR printed (Long Sleeve, Hoodie, Jogger, Cargo).
export const PRINT_CHOICES = [
  { id: 'none', label: 'Plain — no print',  sub: 'No design, keep it blank' },
  { id: 'has',  label: 'Yes, has a design', sub: 'I’ll pick print details next' },
]

export const PLACEMENTS = [
  { label: 'Front only',   sub: 'Single placement · included', addPerPc: 0 },
  { label: 'Front + back', sub: 'Two placements · +₱25 / pc',  addPerPc: 25 },
]

export const MIN_QTY = 50
export const SAMPLE_FEE = 1000 // added to the grand total on the quote

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

export function pricePerPc(f) {
  const base = (SIZE_PRICES[f.fit] || SIZE_PRICES.Standard)[f.size] || 0
  const style = styleById(f.style).addPerPc || 0
  const collar = COLLARS.find((c) => c.label === f.collar)?.addPerPc || 0
  const sleeve = SLEEVES.find((c) => c.label === f.sleeve)?.addPerPc || 0
  const place = PLACEMENTS.find((p) => p.label === f.placement)?.addPerPc || 0
  const print = f.hasDesign ? printColorSurcharge(f.printColors || 1) : 0
  return base + style + collar + sleeve + place + print
}

export function quoteTotals(f, qty) {
  const perPc = pricePerPc(f)
  const total = perPc * (Number(qty) || 0)
  const grandTotal = total + SAMPLE_FEE
  const dp = Math.round(grandTotal * 0.6)
  return { perPc, total, sampleFee: SAMPLE_FEE, grandTotal, dp, bal: grandTotal - dp }
}

export const peso = (n) => '₱' + Number(n || 0).toLocaleString('en-PH')
