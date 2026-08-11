# garment-scrub assets

Referenced from `src/data/garmentScrub.js`. Three folders, one job each:

- **`videos/`** — the scroll-scrub videos, one per fit+collar combo. All 4 combos are filmed:
  `standard-standard.mp4`, `standard-proclub.mp4`, `boxy-standard.mp4`, `boxy-proclub.mp4`.
- **`front/`** — front-view color-swap photos (shown once scroll reaches the "color" step —
  a video can't be recolored live, so we swap to a static photo). One subfolder per combo,
  named to match: `standard-standard/`, `standard-proclub/`, `boxy-standard/`,
  `boxy-proclub/` — **all 4 are populated as of 2026-08-11** (Boxy's two were the last
  supplied; earlier that day they were missing entirely, so picking Boxy fit and scrolling to
  the color step showed a broken image — that gap is now fully closed. Cross-checked
  file-by-file against `garmentScrub.js`'s `BOXY_STANDARD_COLORS`/`BOXY_PROCLUB_COLORS`
  lists: exact match, nothing missing, nothing extra).
- **`back/`** — back-view color photos, supplied later the same day (2026-08-11). **Organized
  by FIT ONLY** — `back/standard/` (20 files, one per color) and `back/boxy/` — deliberately
  with **no per-collar split**, unlike `front/`. This was the owner's explicit call: the back
  view doesn't visibly differ enough between Standard collar and Pro Club collar to justify
  separate photoshoots, so one back photo per fit+color is meant to be reused for both collar
  options.
  - **`back/boxy/` matches perfectly for this reuse** — `garmentScrub.js`'s
    `BOXY_STANDARD_COLORS` and `BOXY_PROCLUB_COLORS` already use the exact same 20 color
    names as each other (both say "Green", not "Christmas Green"), so every name in
    `back/boxy/` has a real match regardless of which collar the customer picked.
  - **`back/standard/` has one asymmetry worth knowing about**: it matches `STANDARD_COLORS`
    (the Standard-collar front list) exactly, including "Christmas Green" — but
    `PROCLUB_COLORS` (the Pro-Club-collar front list) uses "Green" instead of "Christmas
    Green" for that one slot (a difference between the two original photoshoots, not
    introduced here). So if a Pro-Club-collar customer picks "Green," there's no
    `back/standard/` file with that exact name — only `Christmas_green_std_std.png` exists.
    Flagged to the owner as "negligible" and accepted as-is; if it ever needs a clean fix,
    it's a one-file rename/duplicate, not a re-shoot.
  - **Minor filename inconsistency, not yet a functional problem**: "Special Gray" is
    abbreviated `spc_gray` in `back/standard/` but `spcl_gray` in `back/boxy/`. Harmless
    today since nothing programmatically pattern-matches these names yet, but worth
    normalizing before any code writes a lookup function against these filenames.

**Live features reading from these folders** (both built 2026-08-11, in `GuidedWalkthrough.jsx`):
1. The "color" step (all 4 combos) — front photo, recolored per the customer's pick.
2. The "Your front design" / "Your back design" steps — a live, in-browser-only preview of
   the customer's own uploaded artwork laid over the front (or back) photo. Never uploaded,
   saved, or sent with the order — see CLAUDE.md §7's "Design-upload live preview" section
   for the full detail, including why it's scoped this way and how the color-name gaps above
   degrade gracefully instead of showing a broken image.

**Remaining known gap**: Oversized fit has no photo (front or back) and no video — it always
falls back to the 3D model instead, so none of the folders above are ever read for it. Not a
bug, just not filmed yet.
