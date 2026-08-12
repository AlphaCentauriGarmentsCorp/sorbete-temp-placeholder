// src/data/garmentScrub.js — scroll-scrubbed video preview (Path A / GuidedWalkthrough).
// Four garment combos have real video + photo assets so far: Standard and Boxy fit,
// each with either collar option. Oversized (and styles without a collar) falls back to
// the existing 3D stage — see GuidedWalkthrough's use of scrubVariantFor.
//
// Each video is ~8s; timestamp.txt (from the asset drop) maps seconds → camera framing:
//   0:00 wholebody · 0:02 collar · 0:04 sleeve · 0:06 hem · 0:08 back to wholebody
// The color swatch step has no video equivalent (can't recolor a filmed garment), so
// once the "color" part is reached we swap to a static photo of the selected color and
// stay on it for the rest of the walkthrough.
//
// Design-upload preview (added 2026-08-11, see GuidedWalkthrough.jsx's designFront/
// designBack steps): once we're on a static photo anyway, the customer can upload their own
// artwork and see it laid over that same photo — front photo for front design, back photo
// (backPhotoFor(), below) for back design. This is a LIVE PREVIEW ONLY — the uploaded file
// never leaves the browser, isn't sent with the order, and isn't stored anywhere. It only
// shows up where a real photo already exists to lay it over (front: Standard fit today; back:
// wherever backPhotoFor() resolves) — Oversized fit has no photo at all, so no preview there.
//
// Category + GSM-tier subfolders (category added 2026-08-12, GSM-tier layer added same day
// right after): every front/<combo>/ and back/<fit>/ folder now nests
// <gsm-tier-slug>/<category-slug>/ underneath it — e.g.
// front/standard-standard/220-240-gsm/lights/White_std_std.webp — instead of a flat
// front/standard-standard/White_std_std.webp. makeVariant()/backPhotoFor() below resolve
// each color's category (CATEGORY_BY_COLOR) and that category's GSM tier
// (CANONICAL_FABRIC_BY_CATEGORY) to build the path. There are only 2 tier folders
// (`220-240-gsm`, `280-gsm-tier`) even though the shop has 4 fabric *options* — see that
// map's own comment in orderConfig.js for why they share one folder each instead of one per
// fabric (an earlier same-day version briefly had 4 folders with duplicated files; that was
// simplified once it turned out the paired fabrics never actually differ).

import { CATEGORY_BY_COLOR, CANONICAL_FABRIC_BY_CATEGORY } from './orderConfig.js'

const BASE = '/garment-scrub'

// 'Green' (used only in the boxy-fit photo shoots below) isn't one of the official 20
// colors on the business's reference card — see the existing comment on BOXY_STANDARD_COLORS
// for why it exists at all. CATEGORY_BY_COLOR has no entry for it, so it needs its own
// fallback here purely so its file has a category folder to live in; it stays out of
// data/orderConfig.js's SHIRT_COLORS and off every color picker.
const FALLBACK_CATEGORY_BY_COLOR = { Green: 'greens-blues' }

function categoryFor(colorName) {
  return CATEGORY_BY_COLOR[colorName] ?? FALLBACK_CATEGORY_BY_COLOR[colorName] ?? 'uncategorized'
}

// The <fabric-slug>/<category-slug> path segment for a color, e.g. '220-gsm/lights'.
function categoryPathFor(colorName) {
  const category = categoryFor(colorName)
  const fabric = CANONICAL_FABRIC_BY_CATEGORY[category] ?? '220-gsm'
  return `${fabric}/${category}`
}

// part key -> video currentTime (seconds). Any part not listed here (fabric, print
// choice/colors, placement — nothing after color that has its own camera angle) holds
// the closing wholebody frame at 8s, per the asset notes ("0:08 - same as the 0:00").
export const SCRUB_PART_TIME = {
  style: 0,
  size: 0,
  collar: 2,
  sleeve: 4,
  hem: 6,
}
export const SCRUB_DEFAULT_TIME = 8

// Colors are per-combo (the photoshoot only covers each combo's own palette) — these
// are NOT the same list as data/orderConfig.js's fabric-based COLORS_BY_FABRIC, and
// intentionally don't try to reconcile the two (the source filenames themselves have
// inconsistent naming between the two shoots, e.g. "off_white" vs "offwhite").
// `hex` is the business's official 20-color reference card (name/HEX/RGB) — the exact
// swatch color customers see elsewhere in the app — not sampled from the photos anymore
// (the original pixel-sampled values approximated shadow/lighting in the photoshoot).
const STANDARD_COLORS = [
  ['Ash Gray', 'Ash_Gray_std_std.webp', '#5B5B5B'],
  ['Black', 'Black_std_std.webp', '#111111'],
  ['Brown', 'Brown_std_std.webp', '#332211'],
  ['Christmas Green', 'Christmas_Green_std_std.webp', '#1C7A2F'],
  ['Cream', 'Cream_std_std.webp', '#FDFBD4'],
  ['Dark Royal Blue', 'Dk_Royal_Blue_std_std.webp', '#041848'],
  ['Emerald Green', 'emeraldgreen_std_std.webp', '#046007'],
  ['Fatigue', 'fatigue_std_std.webp', '#41411D'],
  ['Ivory', 'ivory_std_std.webp', '#FFFEF2'],
  ['Light Royal Blue', 'Lt_Royal_Blue_std_std.webp', '#1C3F87'],
  ['Mocha', 'Mocca_std_std.webp', '#C6A38A'],
  ['Mustard Gold', 'mustard_gold_std_std.webp', '#CD7F32'],
  ['Navy Blue', 'Navy_Blue_std_std.webp', '#00022E'],
  ['Off White', 'offwhite_std_std.webp', '#F2F1EE'],
  ['Pink', 'Pink_std_std.webp', '#F7B0BB'],
  ['Red', 'Red_std_std.webp', '#780606'],
  ['Royal Blue', 'Royal_blue_std_std.webp', '#02066F'],
  ['Silver Gray', 'silver_gray_std_std.webp', '#C0C0C0'],
  ['Special Gray', 'spcl_gray_std_std.webp', '#A9A9A9'],
  ['White', 'White_std_std.webp', '#FFFFFF'],
  // Lights category, completed 2026-08-12 (see orderConfig.js's SHIRT_COLORS for the same
  // 11 colors' hex/Pantone reference).
  ['Regent Yellow', 'regent_yellow_std_std.png', '#F6EB61'],
  ['Corn Yellow', 'Corn_yellow_std_std.png', '#D6DCE5'],
  ['Lemon Yellow', 'Lemon_yellow_std_std.png', '#D5FFA4'],
  ['Light Yellow', 'Light_yellow_std_std.png', '#F3E900'],
  ['Lime Green', 'Lime_green_std_std.png', '#93F9C2'],
  ['Light Mint Green', 'lt_mint_green_std_std.png', '#D1FAFA'],
  ['Source Green', 'source_green_std_std.png', '#BAD2BA'],
  ['Mint Green', 'mint_green_std_std.png', '#9EE3D8'],
  ['Sea Green', 'sea_green_std_std.png', '#59ACC1'],
  ['Sky Blue', 'sky_blue_std_std.png', '#829AC4'],
  ['Powder Mint', 'powder_mint_std_std.png', '#D4F8FF'],
]

const PROCLUB_COLORS = [
  ['Ash Gray', 'Ash_Gray_std_pc.webp', '#5B5B5B'],
  ['Black', 'Black_std_pc.webp', '#111111'],
  ['Brown', 'Brown_std_pc.webp', '#332211'],
  ['Cream', 'Cream_std_pc.webp', '#FDFBD4'],
  ['Dark Royal Blue', 'Dk_Royal_Blue_std_pc.webp', '#041848'],
  ['Emerald Green', 'Emerald_green_std_pc.webp', '#046007'],
  ['Fatigue', 'Fatigue_std_pc.webp', '#41411D'],
  ['Green', 'Green_std_pc.webp', '#1d5a2e'], // not on the official 20-color card — left as originally sampled
  ['Ivory', 'ivory_std_pc.webp', '#FFFEF2'],
  ['Light Royal Blue', 'Lt_Royal_Blue_std_pc.webp', '#1C3F87'],
  ['Mocha', 'mocca_std_pc.webp', '#C6A38A'],
  ['Mustard Gold', 'mustard_gold_std_pc.webp', '#CD7F32'],
  ['Navy Blue', 'Navy_Blue_std_pc.webp', '#00022E'],
  ['Off White', 'off_white_std_pc.webp', '#F2F1EE'],
  ['Pink', 'pink_std_pc.webp', '#F7B0BB'],
  ['Red', 'Red_std_pc.webp', '#780606'],
  ['Royal Blue', 'Royal_blue_std_pc.webp', '#02066F'],
  ['Silver Gray', 'silver_gray_std_pc.webp', '#C0C0C0'],
  ['Special Gray', 'special_gray_std_pc.webp', '#A9A9A9'],
  ['White', 'White_std_pc.webp', '#FFFFFF'],
  // Lights category, completed 2026-08-12. NOTE: 'light_lime_green_std_pc.png' is a filename
  // typo in the asset drop (says "lime", not "mint") — the actual photo shows the correct
  // pale mint/cyan Light Mint Green, visually confirmed before wiring this in. Left as-is on
  // disk rather than renamed, same as this file's other tolerated filename quirks.
  ['Regent Yellow', 'regent_yellow_std_pc.png', '#F6EB61'],
  ['Corn Yellow', 'corn_yellow_std_pc.png', '#D6DCE5'],
  ['Lemon Yellow', 'lemon_yellow_std_pc.png', '#D5FFA4'],
  ['Light Yellow', 'light_yellow_std_pc.png', '#F3E900'],
  ['Lime Green', 'lime_green_std_pc.png', '#93F9C2'],
  ['Light Mint Green', 'light_lime_green_std_pc.png', '#D1FAFA'],
  ['Source Green', 'source_green_std_pc.png', '#BAD2BA'],
  ['Mint Green', 'mint_green_std_pc.png', '#9EE3D8'],
  ['Sea Green', 'sea_green_std_pc.png', '#59ACC1'],
  ['Sky Blue', 'sky_blue_std_pc.png', '#829AC4'],
  ['Powder Mint', 'powder_mint_std_pc.png', '#D4F8FF'],
]

// Boxy shoot uses 'Green' where Standard used 'Christmas Green' — same inconsistency
// already noted above between shoots. Reuses PROCLUB_COLORS' non-card 'Green' hex.
const BOXY_STANDARD_COLORS = [
  ['Ash Gray', 'Ash_Gray_box_std.png', '#5B5B5B'],
  ['Black', 'Black_box_std.png', '#111111'],
  ['Brown', 'Brown_box_std.png', '#332211'],
  ['Cream', 'Cream_box_std.png', '#FDFBD4'],
  ['Dark Royal Blue', 'Dk_Royal_blue_box_std.png', '#041848'],
  ['Emerald Green', 'emerald_green_box_std.png', '#046007'],
  ['Fatigue', 'fatigue_box_std.png', '#41411D'],
  ['Green', 'Green_box_std.png', '#1d5a2e'],
  ['Ivory', 'ivory_box_std.png', '#FFFEF2'],
  ['Light Royal Blue', 'Lt_Royal_blue_box_std.png', '#1C3F87'],
  ['Mocha', 'mocca_box_std.png', '#C6A38A'],
  ['Mustard Gold', 'mustard_gold_box_std.png', '#CD7F32'],
  ['Navy Blue', 'Navy_Blue_box_std.png', '#00022E'],
  ['Off White', 'off_white_box_std.png', '#F2F1EE'],
  ['Pink', 'pink_box_std.png', '#F7B0BB'],
  ['Red', 'Red_box_std.png', '#780606'],
  ['Royal Blue', 'Royal_blue_box_std.png', '#02066F'],
  ['Silver Gray', 'silver_gray_box_std.png', '#C0C0C0'],
  ['Special Gray', 'special_gray_box_std.png', '#A9A9A9'],
  ['White', 'White_box_std.png', '#FFFFFF'],
  // Lights category, completed 2026-08-12.
  ['Regent Yellow', 'regent_yellow_box_std.png', '#F6EB61'],
  ['Corn Yellow', 'corn_yellow_box_std.png', '#D6DCE5'],
  ['Lemon Yellow', 'lemon_yellow_box_std.png', '#D5FFA4'],
  ['Light Yellow', 'light_yellow_box_std.png', '#F3E900'],
  ['Lime Green', 'lime_green_box_std.png', '#93F9C2'],
  ['Light Mint Green', 'light_mint_green_box_std.png', '#D1FAFA'],
  ['Source Green', 'source_green_box_std.png', '#BAD2BA'],
  ['Mint Green', 'mint_green_box_std.png', '#9EE3D8'],
  ['Sea Green', 'sea_green_box_std.png', '#59ACC1'],
  ['Sky Blue', 'sky_blue_box_std.png', '#829AC4'],
  ['Powder Mint', 'powder_mint_box_std.png', '#D4F8FF'],
]

// Note: 'pink_box_std.png' lives in the proclub folder despite its _std suffix — a
// filename typo in the asset drop, not a misplaced file (it's the only pink there).
const BOXY_PROCLUB_COLORS = [
  ['Ash Gray', 'Ash_Gray_box_proclub.png', '#5B5B5B'],
  ['Black', 'Black_box_proclub.png', '#111111'],
  ['Brown', 'Brown_box_proclub.png', '#332211'],
  ['Cream', 'Cream_box_proclub.png', '#FDFBD4'],
  ['Dark Royal Blue', 'Dk_Royal_Blue_box_proclub.png', '#041848'],
  ['Emerald Green', 'emerald_green_box_pc.png', '#046007'],
  ['Fatigue', 'fatigue_box_pc.png', '#41411D'],
  ['Green', 'Green_box_proclub.png', '#1d5a2e'],
  ['Ivory', 'ivory_box_pc.png', '#FFFEF2'],
  ['Light Royal Blue', 'Light_Royal_Blue_box_proclub.png', '#1C3F87'],
  ['Mocha', 'mocca_box_pc.png', '#C6A38A'],
  ['Mustard Gold', 'mustard_box_pc.png', '#CD7F32'],
  ['Navy Blue', 'Navy_blue_box_proclub.png', '#00022E'],
  ['Off White', 'offwhite_box_pc.png', '#F2F1EE'],
  ['Pink', 'pink_box_std.png', '#F7B0BB'],
  ['Red', 'Red_box_proclub.png', '#780606'],
  ['Royal Blue', 'royalblue_box_pc.png', '#02066F'],
  ['Silver Gray', 'silver_gray_box_pc.png', '#C0C0C0'],
  ['Special Gray', 'special_gray_box_pc.png', '#A9A9A9'],
  ['White', 'White_box_proclub.png', '#FFFFFF'],
  // Lights category, completed 2026-08-12. NOTE: 'source_box_pc.png' is missing "green" in
  // its filename (asset-drop typo) — visually confirmed it's the correct Source Green photo
  // before wiring this in.
  ['Regent Yellow', 'regent_yellow_box_pc.png', '#F6EB61'],
  ['Corn Yellow', 'corn_yellow_box_pc.png', '#D6DCE5'],
  ['Lemon Yellow', 'lemon_yellow_box_pc.png', '#D5FFA4'],
  ['Light Yellow', 'light_yellow_box_pc.png', '#F3E900'],
  ['Lime Green', 'lime_green_box_pc.png', '#93F9C2'],
  ['Light Mint Green', 'light_mint_box_pc.png', '#D1FAFA'],
  ['Source Green', 'source_box_pc.png', '#BAD2BA'],
  ['Mint Green', 'mint_green_box_pc.png', '#9EE3D8'],
  ['Sea Green', 'sea_green_box_pc.png', '#59ACC1'],
  ['Sky Blue', 'sky_blue_box_pc.png', '#829AC4'],
  ['Powder Mint', 'powder_mint_box_pc.png', '#D4F8FF'],
]

// Back-view color photos — organized by FIT ONLY, no per-collar split (owner's call: the
// back view doesn't differ enough between Standard and Pro Club collar to justify separate
// shoots, so one back photo per fit+color is reused across both). Consequence: Boxy's names
// match perfectly either way (BOXY_STANDARD_COLORS/BOXY_PROCLUB_COLORS already use identical
// names), but Standard fit only exactly matches STANDARD_COLORS (has "Christmas Green") —
// PROCLUB_COLORS' one differing name, "Green", has no back photo. backPhotoFor() returns
// null for that case (and for Oversized, which has none at all) rather than guessing.
const BACK_STANDARD_COLORS = [
  ['Ash Gray', 'ash_gray_std_std.png'],
  ['Black', 'Black_std_std.png'],
  ['Brown', 'brown_std_std.png'],
  ['Christmas Green', 'Christmas_green_std_std.png'],
  ['Cream', 'cream_std_std.png'],
  ['Dark Royal Blue', 'Dk_Royal_blue_std_std.png'],
  ['Emerald Green', 'emerald_green_std_std.png'],
  ['Fatigue', 'fatigue_std_std.png'],
  ['Ivory', 'ivory_std_std.png'],
  ['Light Royal Blue', 'Lt_Royal_blue_std_std.png'],
  ['Mocha', 'mocca_std_std.png'],
  ['Mustard Gold', 'mustard_gold_std_std.png'],
  ['Navy Blue', 'navy_blue_std_std.png'],
  ['Off White', 'off_white_std_std.png'],
  ['Pink', 'pink_std_std.png'],
  ['Red', 'red_std_std.png'],
  ['Royal Blue', 'royal_blue_std_std.png'],
  ['Silver Gray', 'silver_gray_std_std.png'],
  ['Special Gray', 'spc_gray_std_std.png'],
  ['White', 'white_std_std.png'],
  // Lights category, completed 2026-08-12.
  ['Regent Yellow', 'regent_yellow_std.png'],
  ['Corn Yellow', 'corn_yellow_std.png'],
  ['Lemon Yellow', 'lemon_yellow_std.png'],
  ['Light Yellow', 'light_yellow_std.png'],
  ['Lime Green', 'lime_green_std.png'],
  ['Light Mint Green', 'light_mint_green_std.png'],
  ['Source Green', 'source_green_std.png'],
  ['Mint Green', 'mint_green_std.png'],
  ['Sea Green', 'sea_green_std.png'],
  ['Sky Blue', 'sky_blue_std.png'],
  ['Powder Mint', 'powder_mint_std.png'],
]

const BACK_BOXY_COLORS = [
  ['Ash Gray', 'ash_gray_boxy.png'],
  ['Black', 'black_boxy.png'],
  ['Brown', 'brown_boxy.png'],
  ['Cream', 'cream_boxy.png'],
  ['Dark Royal Blue', 'Dk_Royal_blue_boxy.png'],
  ['Emerald Green', 'emerald_green_boxy.png'],
  ['Fatigue', 'fatigue_boxy.png'],
  ['Green', 'green_boxy.png'],
  ['Ivory', 'Ivory_boxy.png'],
  ['Light Royal Blue', 'Lt_Royal_blue_boxy.png'],
  ['Mocha', 'mocca_boxy.png'],
  ['Mustard Gold', 'mustard_gold_boxy.png'],
  ['Navy Blue', 'navy_blue_boxy.png'],
  ['Off White', 'off_white_boxy.png'],
  ['Pink', 'pink_boxy.png'],
  ['Red', 'red_boxy.png'],
  ['Royal Blue', 'Royal_blue_boxy.png'],
  ['Silver Gray', 'silver_gray_boxy.png'],
  ['Special Gray', 'spcl_gray_boxy.png'],
  ['White', 'white_boxy.png'],
  // Lights category, completed 2026-08-12.
  ['Regent Yellow', 'regent_yellow_boxy.png'],
  ['Corn Yellow', 'corn_yellow_boxy.png'],
  ['Lemon Yellow', 'lemon_yellow_boxy.png'],
  ['Light Yellow', 'light_yellow_boxy.png'],
  ['Lime Green', 'lime_green_boxy.png'],
  ['Light Mint Green', 'light_mint_green_boxy.png'],
  ['Source Green', 'source_green_boxy.png'],
  ['Mint Green', 'mint_green_boxy.png'],
  ['Sea Green', 'sea_green_boxy.png'],
  ['Sky Blue', 'sky_blue_boxy.png'],
  ['Powder Mint', 'powder_mint_boxy.png'],
]

const BACK_COLORS_BY_FIT = {
  Standard: { dir: 'standard', colors: BACK_STANDARD_COLORS },
  Boxy: { dir: 'boxy', colors: BACK_BOXY_COLORS },
}

// Back-view photo for a fit+color, or null if this exact combo isn't covered (see comment
// above). Filenames here are case-sensitive on real hosting even though this dev machine's
// filesystem won't complain about a mismatch — keep this list byte-exact with what's on disk.
export function backPhotoFor(fit, colorName) {
  const entry = BACK_COLORS_BY_FIT[fit]
  if (!entry) return null
  const found = entry.colors.find(([name]) => name === colorName)
  return found ? `${BASE}/back/${entry.dir}/${categoryPathFor(colorName)}/${found[1]}` : null
}

// Assets live under three subfolders (see public/garment-scrub/README.md): videos/,
// front/<combo>/<fabric>/<category>/ (color-swap photos, front view), and
// back/<fit>/<fabric>/<category>/ (back view, see above).
function makeVariant(key, video, colorDir, colors) {
  return {
    key,
    video: `${BASE}/videos/${video}`,
    colors: colors.map(([name, file, hex]) => ({
      name, hex, src: `${BASE}/front/${colorDir}/${categoryPathFor(name)}/${file}`,
    })),
  }
}

// Keyed by the variant's own key — flat, so GarmentScrub.jsx can mount every known
// variant's <video> up front (see its file header on why nothing gets key-remounted).
export const SCRUB_VARIANTS = {
  'standard-standard': makeVariant('standard-standard', 'standard-standard.mp4', 'standard-standard', STANDARD_COLORS),
  'standard-proclub': makeVariant('standard-proclub', 'standard-proclub.mp4', 'standard-proclub', PROCLUB_COLORS),
  'boxy-standard': makeVariant('boxy-standard', 'boxy-standard.mp4', 'boxy-standard', BOXY_STANDARD_COLORS),
  'boxy-proclub': makeVariant('boxy-proclub', 'boxy-proclub.mp4', 'boxy-proclub', BOXY_PROCLUB_COLORS),
}

// form.fit -> form.collar label (data/orderConfig.js COLLARS) -> SCRUB_VARIANTS key.
// Oversized has no footage yet, so it's absent here and falls through to the 3D stage.
const VARIANT_KEY_BY_FIT_COLLAR = {
  Standard: {
    'Standard ribbed crew': 'standard-standard',
    'Pro Club-style thick rib': 'standard-proclub',
  },
  Boxy: {
    'Standard ribbed crew': 'boxy-standard',
    'Pro Club-style thick rib': 'boxy-proclub',
  },
}

/**
 * Is there a filmed variant for the current form? Needs a fit+collar combo we have
 * footage for, on a style that shows a collar at all (plain/printed tee, long sleeve
 * — sh.collar mirrors data/orderConfig.js's showFor()).
 */
export function scrubVariantFor(form, sh) {
  if (!sh.collar) return null
  const key = VARIANT_KEY_BY_FIT_COLLAR[form.fit]?.[form.collar]
  return key ? SCRUB_VARIANTS[key] : null
}

export function timeForPart(partKey) {
  return SCRUB_PART_TIME[partKey] ?? SCRUB_DEFAULT_TIME
}
