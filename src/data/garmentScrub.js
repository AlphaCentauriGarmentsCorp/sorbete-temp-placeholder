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

const BASE = '/garment-scrub'

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
  return found ? `${BASE}/back/${entry.dir}/${found[1]}` : null
}

// Assets live under three subfolders (see public/garment-scrub/README.md): videos/,
// front/<combo>/ (color-swap photos, front view), and back/<fit>/ (back view, see above).
function makeVariant(key, video, colorDir, colors) {
  return {
    key,
    video: `${BASE}/videos/${video}`,
    colors: colors.map(([name, file, hex]) => ({ name, hex, src: `${BASE}/front/${colorDir}/${file}` })),
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
