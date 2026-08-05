// src/data/garmentScrub.js — scroll-scrubbed video preview (Path A / GuidedWalkthrough).
// Two garment combos have real video + photo assets so far: Standard fit with either
// collar option. Everything else (other fits, styles without a collar) falls back to
// the existing 3D stage — see GuidedWalkthrough's use of SCRUB_VARIANTS.
//
// Each video is ~8s; timestamp.txt (from the asset drop) maps seconds → camera framing:
//   0:00 wholebody · 0:02 collar · 0:04 sleeve · 0:06 hem · 0:08 back to wholebody
// The color swatch step has no video equivalent (can't recolor a filmed garment), so
// once the "color" part is reached we swap to a static photo of the selected color and
// stay on it for the rest of the walkthrough.

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

function makeVariant(key, video, colorDir, colors) {
  return {
    key,
    video: `${BASE}/${video}`,
    colors: colors.map(([name, file, hex]) => ({ name, hex, src: `${BASE}/${colorDir}/${file}` })),
  }
}

// Keyed by the exact form.collar label (data/orderConfig.js COLLARS) — both variants
// are Standard fit; there's no Boxy/Oversized coverage yet.
export const SCRUB_VARIANTS = {
  'Standard ribbed crew': makeVariant('standard-standard', 'standard-standard.mp4', 'standard-standard', STANDARD_COLORS),
  'Pro Club-style thick rib': makeVariant('standard-proclub', 'standard-proclub.mp4', 'standard-proclub', PROCLUB_COLORS),
}

/**
 * Is there a filmed variant for the current form? Only Standard fit + a collar we
 * have footage for, on a style that shows a collar at all (plain/printed tee, long
 * sleeve — sh.collar mirrors data/orderConfig.js's showFor()).
 */
export function scrubVariantFor(form, sh) {
  if (!sh.collar || form.fit !== 'Standard') return null
  return SCRUB_VARIANTS[form.collar] || null
}

export function timeForPart(partKey) {
  return SCRUB_PART_TIME[partKey] ?? SCRUB_DEFAULT_TIME
}
