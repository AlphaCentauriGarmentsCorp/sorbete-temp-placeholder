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

// Catalog colors available PER FABRIC/GSM — kept for FabricPrintGuide.jsx's own reference
// page only (it genuinely wants to show which colors each fabric comes in). As of
// 2026-08-11, none of the three order-BUILDING screens read from this anymore — they all
// use SHIRT_COLORS below instead (the owner's explicit call — see CLAUDE.md §7/§12,
// "gamitin mo sa order online path yung establish na natin na 20 colors"). Do not wire this
// back into an order-building screen without checking with the owner first.
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

// The official fabric catalog's own category structure ("Sorbetes-Fabric-Catalog.pdf",
// Alpha Centauri, 2026) — 9 collections total, Hoodie Collection excluded here since
// hoodies aren't an orderable style yet (see STYLES below, priceClass: null). `slug` is
// the folder name used under public/garment-scrub/**/<slug>/ (2026-08-12 reorg — see
// CATEGORY_BY_COLOR below and garmentScrub.js's own path-building).
export const COLOR_CATEGORIES = [
  { slug: '280-gsm',      label: '280 GSM',        sub: 'Heavyweight Cotton Series' },
  { slug: 'greens-blues', label: 'Greens & Blues', sub: '220-240 GSM · Cool Tones' },
  { slug: 'neutrals',     label: 'Neutrals',       sub: '220-240 GSM · Earth & Stone Tones' },
  { slug: 'warm-tones',   label: 'Warm Tones',     sub: '220-240 GSM · Reds, Oranges & Golds' },
  { slug: 'lights',       label: 'Lights',         sub: '220-240 GSM · Whites, Yellows & Pastels' },
  { slug: 'pastels',      label: 'Pastels',        sub: '220-240 GSM · Soft & Muted Pastels' },
  { slug: 'earth-tones',  label: 'Earth Tones',    sub: '220-240 GSM · Natural & Organic Hues' },
  { slug: 'brights',      label: 'Brights',        sub: '220-240 GSM · Bold Statement Colors' },
]

// The shop's own 4 fabric options (FABRICS below) fold into just 2 real catalog GSM tiers —
// the catalog draws no distinction between the two fabrics in each pair, so today they offer
// literally the same colors: '220 GSM' + 'CVC 240 GSM' both pull from the 7 hue-family
// categories above; 'CVC 280 GSM' + 'Premium 280 GSM' both pull from the '280-gsm' category
// alone. Briefly (2026-08-12) each pair had its own physically-duplicated folder+files; that
// was simplified the same day, once it turned out to just double file count for zero real
// difference — now there's ONE folder per GSM tier (`220-240-gsm`, `280-gsm-tier`) shared by
// both fabrics in the pair, not one per fabric. If the two fabrics in a pair ever need
// genuinely different photos, this is the one mapping to revisit — it'd mean splitting the
// shared tier folder back into two, one per fabric, and updating this map accordingly.
export const FABRIC_SLUGS = {
  '220 GSM': '220-240-gsm',
  'CVC 240 GSM': '220-240-gsm',
  'CVC 280 GSM': '280-gsm-tier',
  'Premium 280 GSM': '280-gsm-tier',
}
export const CANONICAL_FABRIC_BY_CATEGORY = {
  'greens-blues': '220-240-gsm', 'neutrals': '220-240-gsm', 'warm-tones': '220-240-gsm',
  'lights': '220-240-gsm', 'pastels': '220-240-gsm', 'earth-tones': '220-240-gsm', 'brights': '220-240-gsm',
  '280-gsm': '280-gsm-tier',
}

// The business's official 20-color reference card (name + HEX) — one universal palette,
// the same 20 regardless of fabric/GSM. As of 2026-08-11, ALL THREE order-building paths
// use this (GuidedWalkthrough and DirectForm's own fallback color step, plus WalkInForm,
// which always did) — see SHIRT_COLOR_HEX below for the derived name->hex lookup the online
// paths use for their 3D/SVG fallback tint.
//
// `category` (added 2026-08-12) maps each color to its closest match in the official fabric
// catalog, by nearest hex distance to that category's own swatch — NOT by name alone, since
// several names repeat across categories with genuinely different hex (e.g. the catalog has
// four different "Black"/"Jet Black" swatches, and 280 GSM's own "Royal Blue" is actually a
// teal, #00A88E — not a blue at all). `pantone`/`catalogHex` record which exact catalog
// swatch each color was matched against, for reference when generating future assets.
// Two genuine ties (identical hex across categories) worth knowing about, not silently
// buried: Black (#111111) ties Earth Tones' and Brights' "Jet Black" (#060606) — filed under
// Earth Tones. White (#FFFFFF) ties Lights, Earth Tones' "Cloudy White", and Brights — filed
// under Lights, for cohesion with Off White/Ivory/Cream/Pink/Mocha, which all land there too.
export const SHIRT_COLORS = [
  { name: 'Black',            hex: '#111111', category: 'earth-tones',  pantone: 'Black 6 C',        catalogHex: '#060606' },
  { name: 'White',            hex: '#FFFFFF', category: 'lights',       pantone: '11-4001 TPG',      catalogHex: '#FFFFFF' },
  { name: 'Off White',        hex: '#F2F1EE', category: 'lights',       pantone: '663 C',            catalogHex: '#FCFCFC' },
  { name: 'Ivory',            hex: '#FFFEF2', category: 'lights',       pantone: '7499 C',           catalogHex: '#EAE9EE' },
  { name: 'Cream',            hex: '#FDFBD4', category: 'lights',       pantone: '11-0104 TPG',      catalogHex: '#FFF8E5' },
  { name: 'Pink',             hex: '#F7B0BB', category: 'lights',       pantone: '236 C',            catalogHex: '#F19EC2' },
  { name: 'Light Royal Blue', hex: '#1C3F87', category: 'greens-blues', pantone: '662 C',            catalogHex: '#001A70' },
  { name: 'Royal Blue',       hex: '#02066F', category: 'brights',      pantone: 'Blue 072 C',       catalogHex: '#0000CE' },
  { name: 'Dark Royal Blue',  hex: '#041848', category: 'greens-blues', pantone: '282 C',            catalogHex: '#041E42' },
  { name: 'Navy Blue',        hex: '#00022E', category: 'neutrals',     pantone: '4146 C',           catalogHex: '#1B1C34' },
  { name: 'Emerald Green',    hex: '#046007', category: 'greens-blues', pantone: '341 C',            catalogHex: '#007A53' },
  { name: 'Christmas Green',  hex: '#1C7A2F', category: 'greens-blues', pantone: '7736 C',           catalogHex: '#006B38' },
  { name: 'Fatigue',          hex: '#41411D', category: '280-gsm',      pantone: '5743 C',           catalogHex: '#3E4827' },
  { name: 'Mustard Gold',     hex: '#CD7F32', category: 'warm-tones',   pantone: '7414 C',           catalogHex: '#C16C18' },
  { name: 'Red',              hex: '#780606', category: '280-gsm',      pantone: '1815 C',           catalogHex: '#7C2529' },
  { name: 'Brown',            hex: '#332211', category: '280-gsm',      pantone: '4625 C',           catalogHex: '#4F2C1D' },
  { name: 'Mocha',            hex: '#C6A38A', category: 'lights',       pantone: '480 C',            catalogHex: '#C8A696' },
  { name: 'Ash Gray',         hex: '#5B5B5B', category: 'warm-tones',   pantone: '4131 C',           catalogHex: '#484A5B' },
  { name: 'Special Gray',     hex: '#A9A9A9', category: 'neutrals',     pantone: '4282 C',           catalogHex: '#B2AAAC' },
  { name: 'Silver Gray',      hex: '#C0C0C0', category: 'pastels',      pantone: 'Cool Gray 2 C',    catalogHex: '#CECFD0' },

  // Added 2026-08-12 — the Lights category's remaining 11 colors, real photos shot for all
  // 4 front combos + both back fits (see garmentScrub.js). This completes Lights (17/17).
  // Unlike the original 20, `hex` here IS the catalog's own value (catalogHex duplicates it)
  // — there's no separate "business reference card" value to reconcile against for these.
  // "Light Mint Green" spelled out rather than the catalog's "Lt. Mint Green", matching how
  // "Light Royal Blue"/"Dark Royal Blue" above already spell theirs out instead of abbreviating.
  { name: 'Regent Yellow',    hex: '#F6EB61', category: 'lights', pantone: '604 C',  catalogHex: '#F6EB61' },
  { name: 'Corn Yellow',      hex: '#D6DCE5', category: 'lights', pantone: '2002 C', catalogHex: '#D6DCE5' },
  { name: 'Lemon Yellow',     hex: '#D5FFA4', category: 'lights', pantone: '372 C',  catalogHex: '#D5FFA4' },
  { name: 'Light Yellow',     hex: '#F3E900', category: 'lights', pantone: '3945 C', catalogHex: '#F3E900' },
  { name: 'Lime Green',       hex: '#93F9C2', category: 'lights', pantone: '2253 C', catalogHex: '#93F9C2' },
  { name: 'Light Mint Green', hex: '#D1FAFA', category: 'lights', pantone: '317 C',  catalogHex: '#D1FAFA' },
  { name: 'Source Green',     hex: '#BAD2BA', category: 'lights', pantone: '5595 C', catalogHex: '#BAD2BA' },
  { name: 'Mint Green',       hex: '#9EE3D8', category: 'lights', pantone: '324 C',  catalogHex: '#9EE3D8' },
  { name: 'Sea Green',        hex: '#59ACC1', category: 'lights', pantone: '2226 C', catalogHex: '#59ACC1' },
  { name: 'Sky Blue',         hex: '#829AC4', category: 'lights', pantone: '2141 C', catalogHex: '#829AC4' },
  { name: 'Powder Mint',      hex: '#D4F8FF', category: 'lights', pantone: '290 C',  catalogHex: '#D4F8FF' },

  // Added 2026-08-13 — every remaining catalog color, all 8 non-Hoodie categories, 112
  // colors, so the color step can show the FULL catalog instead of only the ~31 colors that
  // already had real photos. Most of these have NO photo yet — that's now an expected,
  // handled state (see GuidedWalkthrough.jsx's colorHasPhoto / GarmentScrub.jsx's
  // last-known-good fallback), not a gap to close before shipping this. `hex` is always the
  // catalog's own value here (catalogHex duplicates it), same as the 2026-08-12 Lights batch
  // — there's no separate "business reference card" value to reconcile for a color nobody
  // has picked/named before.
  //
  // NAME COLLISIONS: the catalog itself repeats ~20 names across categories with genuinely
  // different hex (its own line items, not a data error) — e.g. three different "Mustard"s,
  // three different "Cream"s. Per the owner's explicit call, every colliding name is
  // suffixed "(Category)" so both/all stay individually pickable instead of one silently
  // overwriting another in CATEGORY_BY_COLOR/SHIRT_COLOR_HEX (both keyed by plain `name`).
  // ⚠️ One asymmetry this creates, unavoidably: the 31 colors above were already shipped
  // under plain (unsuffixed) names tied to real photo filenames on disk — renaming any of
  // them would break those file paths. So where a NEW color collides with one of THOSE, only
  // the new one gets suffixed (e.g. "Royal Blue (280 GSM)" here, while the original "Royal
  // Blue" above stays plain) — the existing name always wins the plain form.
  //
  // TRUE DUPLICATES (identical name AND hex across two catalog pages — the literal same
  // swatch listed twice) are added ONCE, not twice: Jet Black/White (already covered by the
  // existing Black/White above), Neutrals' Midnight Blue (identical hex to Neutrals' own
  // Navy Blue), and Earth Tones' Khaki/Army Green (each identical to Brights' own listing of
  // the same name+hex — added once, under Earth Tones).
  //
  // Genuinely DIFFERENT names that happen to share a hex (e.g. "Dark Green" / "Bottle
  // Green", both #183028) are NOT deduplicated — the catalog lists them as distinct named
  // line items, so each gets its own pickable entry.

  // --- 280 GSM (16 new; Fatigue/Red/Brown already covered above) ---
  { name: 'Cream (280 GSM)',   hex: '#F2F0A1', category: '280-gsm', pantone: 'Yellow 0131 C', catalogHex: '#F2F0A1' },
  { name: 'Mocha (280 GSM)',   hex: '#BAA58D', category: '280-gsm', pantone: '4253 C',        catalogHex: '#BAA58D' },
  { name: 'Mustard (280 GSM)', hex: '#9F7D23', category: '280-gsm', pantone: '7557 C',        catalogHex: '#9F7D23' },
  { name: 'Rust (280 GSM)',    hex: '#864A33', category: '280-gsm', pantone: '7581 C',        catalogHex: '#864A33' },
  { name: 'Bright Red',        hex: '#BA0020', category: '280-gsm', pantone: '3517 C',        catalogHex: '#BA0020' },
  { name: 'Lt. Grey',          hex: '#A2AAAD', category: '280-gsm', pantone: '429 C',         catalogHex: '#A2AAAD' },
  { name: 'Dk. Gray',          hex: '#333F48', category: '280-gsm', pantone: '432 C',         catalogHex: '#333F48' },
  { name: 'Royal Blue (280 GSM)', hex: '#00A88E', category: '280-gsm', pantone: '3581 C',     catalogHex: '#00A88E' },
  { name: 'China Blue (280 GSM)', hex: '#6A6A8E', category: '280-gsm', pantone: '4141 C',     catalogHex: '#6A6A8E' },
  { name: 'Powder Blue (280 GSM)', hex: '#B9D9EB', category: '280-gsm', pantone: '290 C',     catalogHex: '#B9D9EB' },
  { name: 'Dk. Yellow',        hex: '#D69A2D', category: '280-gsm', pantone: '7563 C',        catalogHex: '#D69A2D' },
  { name: 'Lt. Yellow',        hex: '#F1B434', category: '280-gsm', pantone: '143 C',         catalogHex: '#F1B434' },
  { name: 'Mint Blue',         hex: '#99D9EA', category: '280-gsm', pantone: '630 C',         catalogHex: '#99D9EA' },
  { name: 'Dark Green',        hex: '#183028', category: '280-gsm', pantone: '5535 C',        catalogHex: '#183028' },
  { name: 'Peach (280 GSM)',   hex: '#F4C1C4', category: '280-gsm', pantone: '692 C',         catalogHex: '#F4C1C4' },
  { name: 'Violet (280 GSM)',  hex: '#662483', category: '280-gsm', pantone: '2607 C',        catalogHex: '#662483' },

  // --- Greens & Blues (15 new; Emerald/Christmas/Lt.+Dk. Royal Blue already covered) ---
  { name: 'Avocado Green',        hex: '#66BB44', category: 'greens-blues', pantone: '369 C',  catalogHex: '#66BB44' },
  { name: 'Bottle Green',         hex: '#183028', category: 'greens-blues', pantone: '5535 C', catalogHex: '#183028' },
  { name: 'Lt. Apple Green',      hex: '#8EDD65', category: 'greens-blues', pantone: '2292 C', catalogHex: '#8EDD65' },
  { name: 'Lt. Fatigue',          hex: '#006B4F', category: 'greens-blues', pantone: '5753 C', catalogHex: '#006B4F' },
  { name: 'Milo Green',           hex: '#05A31D', category: 'greens-blues', pantone: '3529 C', catalogHex: '#05A31D' },
  { name: 'Fatigue (Greens & Blues)', hex: '#4E4934', category: 'greens-blues', pantone: '7771 C', catalogHex: '#4E4934' },
  { name: 'Military Fatigue',     hex: '#6D654F', category: 'greens-blues', pantone: '4227 C', catalogHex: '#6D654F' },
  { name: 'Aqua Green',           hex: '#00A9C9', category: 'greens-blues', pantone: '3115 C', catalogHex: '#00A9C9' },
  { name: 'Apple Green',          hex: '#7CCC6E', category: 'greens-blues', pantone: '2269 C', catalogHex: '#7CCC6E' },
  { name: 'Blue Green',           hex: '#5998C4', category: 'greens-blues', pantone: '2170 C', catalogHex: '#5998C4' },
  { name: 'Jade Green',           hex: '#00A3B8', category: 'greens-blues', pantone: '322 C',  catalogHex: '#00A3B8' },
  { name: 'China Blue (Greens & Blues)', hex: '#5C88DA', category: 'greens-blues', pantone: '2718 C', catalogHex: '#5C88DA' },
  { name: 'Lt. Aqua Blue #3',     hex: '#005698', category: 'greens-blues', pantone: '2185 C', catalogHex: '#005698' },
  { name: 'Dk. China Blue',       hex: '#3B3FB6', category: 'greens-blues', pantone: '2369 C', catalogHex: '#3B3FB6' },
  { name: 'Dk. Aqua Blue',        hex: '#006298', category: 'greens-blues', pantone: '2186 C', catalogHex: '#006298' },

  // --- Neutrals (16 new; Navy Blue/Special Gray already covered; Midnight Blue skipped —
  // identical hex #1B1C34 to Navy Blue above, same category, true duplicate) ---
  { name: 'Peacock Blue',       hex: '#326295', category: 'neutrals', pantone: '653 C',           catalogHex: '#326295' },
  { name: 'Blue Violet',        hex: '#8BB8E8', category: 'neutrals', pantone: '278 C',            catalogHex: '#8BB8E8' },
  { name: 'Lavender (Neutrals)', hex: '#A68ACA', category: 'neutrals', pantone: '2086 C',          catalogHex: '#A68ACA' },
  { name: 'Violet (Neutrals)',  hex: '#2E1A47', category: 'neutrals', pantone: '2695 C',           catalogHex: '#2E1A47' },
  { name: 'Burgundy',           hex: '#5D2A2C', category: 'neutrals', pantone: '490 C',            catalogHex: '#5D2A2C' },
  { name: 'Khaki Brown',        hex: '#8C857B', category: 'neutrals', pantone: '403 C',            catalogHex: '#8C857B' },
  { name: 'Choco Brown (Neutrals)', hex: '#623412', category: 'neutrals', pantone: '732 C',        catalogHex: '#623412' },
  { name: 'Khaki (Neutrals)',   hex: '#96856E', category: 'neutrals', pantone: '4270 C',           catalogHex: '#96856E' },
  { name: 'Gray #56',           hex: '#403A60', category: 'neutrals', pantone: '4265 C',           catalogHex: '#403A60' },
  { name: 'Brown (Neutrals)',   hex: '#7B4931', category: 'neutrals', pantone: '7602 C',           catalogHex: '#7B4931' },
  { name: 'Medium Gray',        hex: '#788FA4', category: 'neutrals', pantone: '2164 C',           catalogHex: '#788FA4' },
  { name: 'Charcoal Gray',      hex: '#5B618F', category: 'neutrals', pantone: '2110 C',           catalogHex: '#5B618F' },
  { name: 'Acid Gray',          hex: '#C6C4D2', category: 'neutrals', pantone: '5305 C',           catalogHex: '#C6C4D2' },
  { name: 'Acid Black',         hex: '#53565A', category: 'neutrals', pantone: 'Cool Gray 11 C',   catalogHex: '#53565A' },
  { name: 'Medium Blue',        hex: '#489FDF', category: 'neutrals', pantone: '2171 C',           catalogHex: '#489FDF' },
  { name: 'Black (Neutrals)',   hex: '#212721', category: 'neutrals', pantone: 'Black 3 C',        catalogHex: '#212721' },

  // --- Warm Tones (22 new; Mustard/Ash Gray already covered — Warm Tones' own "Mustard"
  // 7414C is the exact catalog source "Mustard Gold" above was already matched against) ---
  { name: 'Maroon (Warm Tones)', hex: '#6F263D', category: 'warm-tones', pantone: '209 C',  catalogHex: '#6F263D' },
  { name: 'Coke Red',            hex: '#A50034', category: 'warm-tones', pantone: '207 C',  catalogHex: '#A50034' },
  { name: 'Top Dye',             hex: '#B3B0C4', category: 'warm-tones', pantone: '5295 C', catalogHex: '#B3B0C4' },
  { name: 'Red Orange',          hex: '#BA0C2F', category: 'warm-tones', pantone: '200 C',  catalogHex: '#BA0C2F' },
  { name: 'Fuchsia',             hex: '#AC145A', category: 'warm-tones', pantone: '215 C',  catalogHex: '#AC145A' },
  { name: 'Fuchsia Pink',        hex: '#DA1884', category: 'warm-tones', pantone: '219 C',  catalogHex: '#DA1884' },
  { name: 'Old Rose (Warm Tones)', hex: '#D1889A', category: 'warm-tones', pantone: '4071 C', catalogHex: '#D1889A' },
  { name: 'Lt. Old Rose',        hex: '#D08689', category: 'warm-tones', pantone: '2446 C', catalogHex: '#D08689' },
  { name: 'Rust Lt.',            hex: '#FF5C36', category: 'warm-tones', pantone: '2436 C', catalogHex: '#FF5C36' },
  { name: 'Melon Peach',         hex: '#FF8DA1', category: 'warm-tones', pantone: '1775 C', catalogHex: '#FF8DA1' },
  { name: 'Ponkana',             hex: '#F4633A', category: 'warm-tones', pantone: '2026 C', catalogHex: '#F4633A' },
  { name: 'Tangerine',           hex: '#F32301', category: 'warm-tones', pantone: '2028 C', catalogHex: '#F32301' },
  { name: 'Dk. Mustard',         hex: '#835D32', category: 'warm-tones', pantone: '7575 C', catalogHex: '#835D32' },
  { name: 'Rust (Warm Tones)',   hex: '#E35F50', category: 'warm-tones', pantone: '2448 C', catalogHex: '#E35F50' },
  { name: 'Carrot Orange',       hex: '#F87C56', category: 'warm-tones', pantone: '2024 C', catalogHex: '#F87C56' },
  { name: 'Yellow Gold (Warm Tones)', hex: '#E78D2D', category: 'warm-tones', pantone: '3588 C', catalogHex: '#E78D2D' },
  { name: 'Feu Gold',            hex: '#F8B700', category: 'warm-tones', pantone: '3514 C', catalogHex: '#F8B700' },
  { name: 'Egg Yellow',          hex: '#F1C400', category: 'warm-tones', pantone: '7406 C', catalogHex: '#F1C400' },
  { name: 'Luminous Green',      hex: '#9BE198', category: 'warm-tones', pantone: '2267 C', catalogHex: '#9BE198' },
  { name: 'Canary Yellow (Warm Tones)', hex: '#F7EA48', category: 'warm-tones', pantone: '101 C', catalogHex: '#F7EA48' },
  { name: 'Neon Green (Warm Tones)', hex: '#A4D233', category: 'warm-tones', pantone: '2299 C', catalogHex: '#A4D233' },
  { name: 'Grass Green',         hex: '#1B806D', category: 'warm-tones', pantone: '2244 C', catalogHex: '#1B806D' },

  // --- Lights: 0 new — already the first fully-covered category (17/17), see §7. ---

  // --- Pastels (16 new; Silver Gray already covered) ---
  { name: 'Canvas',              hex: '#F2EDD7', category: 'pastels', pantone: '7527 C', catalogHex: '#F2EDD7' },
  { name: 'Lilac',                hex: '#FCCDFB', category: 'pastels', pantone: '2365 C', catalogHex: '#FCCDFB' },
  { name: 'Dk. Peach',            hex: '#FFB7CD', category: 'pastels', pantone: '190 C',  catalogHex: '#FFB7CD' },
  { name: 'Beige',                hex: '#E9D2B5', category: 'pastels', pantone: '7528 C', catalogHex: '#E9D2B5' },
  { name: 'Peach (Pastels)',      hex: '#FFC7C2', category: 'pastels', pantone: '706 C',  catalogHex: '#FFC7C2' },
  { name: 'Lt. Peach',            hex: '#FFDDE2', category: 'pastels', pantone: '698 C',  catalogHex: '#FFDDE2' },
  { name: 'Melon',                hex: '#FF9BBF', category: 'pastels', pantone: '1915 C', catalogHex: '#FF9BBF' },
  { name: 'Baby Pink',            hex: '#FFDEE7', category: 'pastels', pantone: '705 C',  catalogHex: '#FFDEE7' },
  { name: 'Dk. Pink',             hex: '#FF94AE', category: 'pastels', pantone: '190 C',  catalogHex: '#FF94AE' },
  // ⚠️ Catalog data error, kept as printed (see CLAUDE.md §7): Powder Pink's listed hex is a
  // pale yellow, not pink — its own Pantone (691 C) is a real soft pink. Not resolved yet;
  // the owner needs to decide whether to follow the printed hex or the printed name.
  { name: 'Powder Pink',          hex: '#FFEFA5', category: 'pastels', pantone: '691 C',  catalogHex: '#FFEFA5' },
  { name: 'Cannon Sunset',        hex: '#FFA38B', category: 'pastels', pantone: '1625 C', catalogHex: '#FFA38B' },
  { name: 'Lt. Aqua Blue',        hex: '#67C9F5', category: 'pastels', pantone: '298 C',  catalogHex: '#67C9F5' },
  { name: 'Lt. Khaki (Pastels)',  hex: '#C6BDA1', category: 'pastels', pantone: '7535 C', catalogHex: '#C6BDA1' },
  { name: 'Powder Blue (Pastels)', hex: '#A7D2EE', category: 'pastels', pantone: '291 C', catalogHex: '#A7D2EE' },
  { name: 'Misty',                hex: '#D7BEAF', category: 'pastels', pantone: '4755 C', catalogHex: '#D7BEAF' },
  { name: 'Medium Pink',          hex: '#FFAFCC', category: 'pastels', pantone: '671 C',  catalogHex: '#FFAFCC' },

  // --- Earth Tones (14 new; Black already covers this category's "Jet Black" exactly).
  // Khaki and Army Green below are each identical (name AND hex) to Brights' own listing of
  // the same swatch — added once here, not duplicated under Brights too. Choco Brown repeats
  // TWICE within this one catalog category with different hex (a real internal catalog
  // duplicate, not a mistake on our end) — disambiguated by Pantone code since "(Earth
  // Tones)" alone can't tell the two apart. ---
  { name: 'Cloudy White',           hex: '#FFFFFF', category: 'earth-tones', pantone: 'P 179-1 C', catalogHex: '#FFFFFF' },
  { name: 'Choco Brown (Earth Tones, 2318C)', hex: '#83694E', category: 'earth-tones', pantone: '2318 C', catalogHex: '#83694E' },
  { name: 'Lt. Khaki (Earth Tones)', hex: '#D3BA86', category: 'earth-tones', pantone: '466 C',   catalogHex: '#D3BA86' },
  { name: 'Mocha Mousse',           hex: '#8F5F10', category: 'earth-tones', pantone: '126 C',    catalogHex: '#8F5F10' },
  { name: 'Lime Stone',             hex: '#5D9644', category: 'earth-tones', pantone: '362 C',    catalogHex: '#5D9644' },
  { name: 'Khaki (Earth Tones)',    hex: '#BD9D59', category: 'earth-tones', pantone: '465 C',    catalogHex: '#BD9D59' },
  { name: 'Soft Cream',             hex: '#FFEFC1', category: 'earth-tones', pantone: '7401 C',   catalogHex: '#FFEFC1' },
  { name: 'Army Green',             hex: '#549438', category: 'earth-tones', pantone: '363 C',    catalogHex: '#549438' },
  { name: 'Mocha (Earth Tones)',    hex: '#9F691D', category: 'earth-tones', pantone: '1255 C',   catalogHex: '#9F691D' },
  { name: 'Choco Brown (Earth Tones, 4695C)', hex: '#6D4837', category: 'earth-tones', pantone: '4695 C', catalogHex: '#6D4837' },
  { name: 'Pink (Earth Tones)',     hex: '#FF5DA7', category: 'earth-tones', pantone: '212 C',    catalogHex: '#FF5DA7' },
  { name: 'Old Rose (Earth Tones)', hex: '#FFB3AC', category: 'earth-tones', pantone: '169 C',    catalogHex: '#FFB3AC' },
  { name: 'Cream (Earth Tones)',    hex: '#F9DF94', category: 'earth-tones', pantone: '121 C',    catalogHex: '#F9DF94' },
  { name: 'Dk. Ash Gray',           hex: '#505059', category: 'earth-tones', pantone: '446 C',    catalogHex: '#505059' },

  // --- Brights (13 new; Royal Blue already covered. Jet Black/White/Khaki/Army Green all
  // skipped here — each is an identical name+hex duplicate of an entry already added above,
  // under Black/White/Earth Tones respectively.) ---
  { name: 'Canary Yellow (Brights)', hex: '#FEEB1C', category: 'brights', pantone: 'Yellow C',    catalogHex: '#FEEB1C' },
  { name: 'Lavender (Brights)',      hex: '#9C6EC2', category: 'brights', pantone: '2583 C',      catalogHex: '#9C6EC2' },
  { name: 'Maroon (Brights)',        hex: '#982525', category: 'brights', pantone: '187 C',       catalogHex: '#982525' },
  { name: 'Gray',                    hex: '#8C8C8C', category: 'brights', pantone: 'Cool Gray 7 C', catalogHex: '#8C8C8C' },
  { name: 'Yellow Gold (Brights)',   hex: '#FFBF00', category: 'brights', pantone: '116 C',       catalogHex: '#FFBF00' },
  { name: 'Dk. Violet',              hex: '#5C2080', category: 'brights', pantone: '2613 C',      catalogHex: '#5C2080' },
  { name: 'Dk. Bloody Red',          hex: '#D70000', category: 'brights', pantone: '485 C',       catalogHex: '#D70000' },
  { name: 'Navy Blue (Brights)',     hex: '#1B2050', category: 'brights', pantone: '2767 C',      catalogHex: '#1B2050' },
  { name: 'Dk. Choco Brown',         hex: '#432700', category: 'brights', pantone: '4625 C',      catalogHex: '#432700' },
  { name: 'Rust Brown',              hex: '#91210C', category: 'brights', pantone: '1807 C',      catalogHex: '#91210C' },
  { name: 'Mustard (Brights)',       hex: '#FFB500', category: 'brights', pantone: '1235 C',      catalogHex: '#FFB500' },
  { name: 'Neon Green (Brights)',    hex: '#44FF44', category: 'brights', pantone: '802 C',       catalogHex: '#44FF44' },
  { name: 'Mint Green (Brights)',    hex: '#A8DA92', category: 'brights', pantone: '2253 C',      catalogHex: '#A8DA92' },
]

// name -> category slug, for anywhere (garmentScrub.js) that needs to resolve a color's
// category without importing the full SHIRT_COLORS objects.
export const CATEGORY_BY_COLOR = Object.fromEntries(SHIRT_COLORS.map((c) => [c.name, c.category]))

// Added 2026-08-12 — restores per-fabric color restriction (owner's explicit call,
// reversing the 2026-08-11 "one universal list" decision above once the fabric catalog
// categorization made a real per-fabric pool possible again). A color is available for a
// fabric when its category's GSM tier (CANONICAL_FABRIC_BY_CATEGORY) matches that fabric's
// own tier (FABRIC_SLUGS) — e.g. picking '220 GSM' or 'CVC 240 GSM' shows all 28 colors in
// the seven 220-240 GSM hue-family categories; picking 'CVC 280 GSM' or 'Premium 280 GSM'
// shows only the 3 colors in the '280-gsm' category (Fatigue, Red, Brown) — a real, sharp
// drop from 31 to 3, not a bug if you see it happen.
export function colorsForFabric(fabricValue) {
  const tier = FABRIC_SLUGS[fabricValue]
  return SHIRT_COLORS.filter((c) => CANONICAL_FABRIC_BY_CATEGORY[c.category] === tier)
}

// Same check by color NAME instead of a SHIRT_COLORS object — for filtering
// garmentScrub.js's per-combo photo arrays, which include names not in SHIRT_COLORS at all
// (e.g. 'Green', the non-canonical Boxy-shoot leftover — always kept available rather than
// silently vanishing, since it was never part of this categorization in the first place).
export function isColorAvailableForFabric(colorName, fabricValue) {
  const category = CATEGORY_BY_COLOR[colorName]
  if (!category) return true
  return CANONICAL_FABRIC_BY_CATEGORY[category] === FABRIC_SLUGS[fabricValue]
}

// Groups an already-filtered color list (SHIRT_COLORS entries, or garmentScrub.js's own
// {name, hex, src} photo objects — anything with a `.name`) into { slug, label, colors }
// buckets, in COLOR_CATEGORIES' own order, for display with section headers instead of one
// flat grid. Colors with no known category (e.g. 'Green', the non-canonical Boxy-shoot
// leftover) land in a trailing "Other" bucket rather than silently disappearing.
export function groupColorsByCategory(colors) {
  const groups = COLOR_CATEGORIES
    .map((cat) => ({ ...cat, colors: colors.filter((c) => CATEGORY_BY_COLOR[c.name] === cat.slug) }))
    .filter((g) => g.colors.length > 0)
  const uncategorized = colors.filter((c) => !CATEGORY_BY_COLOR[c.name])
  if (uncategorized.length) groups.push({ slug: 'uncategorized', label: 'Other', colors: uncategorized })
  return groups
}

// Name -> hex, derived from SHIRT_COLORS above — for anywhere that needs to tint by color
// name against the full 20-color list (the online paths' own color picker below, and the
// 3D-stage/flat-SVG fallback tint for fits with no filmed footage). Deliberately NOT the
// same lookup as COLOR_HEX above, which only covers COLORS_BY_FABRIC's smaller per-fabric
// names and stays as-is for FabricPrintGuide.jsx's own separate use.
export const SHIRT_COLOR_HEX = Object.fromEntries(SHIRT_COLORS.map((c) => [c.name, c.hex]))

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

/**
 * Human-readable print-colour summary for the quote screens' "Your specs" rows and the
 * copied/PDF quote text — e.g. "2-color front + 4-color back", or just "2-color" when
 * there's no back print.
 *
 * Deliberately derives from printColors() above, the SAME function the charge itself uses,
 * rather than reading f.printColors/f.printColorsBack raw — so the counts a customer reads
 * can never drift from the counts they're actually billed for (the clamping and the
 * "Front only means no back print" rule both live in printColors(), not here). Added
 * 2026-08-12 after the online quote screen was found showing only the FRONT count while
 * its own price breakdown right below it correctly charged front + back.
 */
export function printColorsSummary(f) {
  // hasDesign is forced on deliberately. printColors() returns all-zeros without it, and
  // callers don't consistently carry it ON the form object — WalkInForm keeps hasDesign as
  // a separate variable beside `form`, while QuoteSummary receives `{ ...form, hasDesign }`
  // already merged. Both branch to a "Plain (no print)" label themselves before calling
  // this, so by the time we're here a design definitely exists; forcing it makes this safe
  // to call with either shape instead of silently rendering "0-color" (which it did, caught
  // on the walk-in kiosk the same day this helper was added).
  const { front, back } = printColors({ ...f, hasDesign: true })
  return back > 0 ? `${front}-color front + ${back}-color back` : `${front}-color`
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

// The minimum-quantity disclosure line, shared verbatim by BOTH quote screens
// (QuoteSummary.jsx for the two online paths, WalkInForm.jsx's own panel for the kiosk).
// Lives here rather than being written out twice because the two copies had already drifted
// once — the kiosk's said "not just today's sample piece" while the online one stopped at
// "full production run". This is the §3 disclosure gate's actual wording, so it matters that
// every path says the same thing. "the sample piece" rather than "today's" so it reads
// correctly online too, not just standing in the store.
export const QUOTE_MIN_NOTE_TAIL =
  '— this quote covers the full production run, not just the sample piece.'

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

// Walk-in-only "Modify with our artist?" add-on (2026-08-13). Rides on the sample fee as
// one number, rather than its own line item — reads f.wantsArtistConsult, which lives in
// the form blob the exact same way hasDesign already does. This reverses the earlier
// "deliberately not carried over from the prototype" call (see CLAUDE.md §7/§11) and the
// "Design-file upload step. Do not re-add." note that used to be here — the owner asked
// for both back, scoped to the walk-in kiosk only for now (not the two online paths).
export const ARTIST_CONSULT_FEE = 500
// Gated on hasDesign too, same as printColors() — otherwise switching to a no-print style
// while the toggle is still "on" would keep silently billing the ₱500.
export const artistConsultFee = (f) => (f?.hasDesign && f?.wantsArtistConsult ? ARTIST_CONSULT_FEE : 0)

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
  const sampleFee = SAMPLE_FEE + artistConsultFee(f)
  const grandTotal = total + sampleFee
  const dp = Math.round(grandTotal * 0.6)
  return { perPc, total, sampleFee, grandTotal, dp, bal: grandTotal - dp }
}

export const peso = (n) => '₱' + Number(n || 0).toLocaleString('en-PH')
