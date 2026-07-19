# Sorbetes Apparel Website — Handoff

_Last updated: July 6, 2026_

## Pages
- **Home.dc.html** — main landing page. Hero, trust strip, numbers bar, "Not a Middleman" proof section, in-house brand proof, portfolio teaser, how-ordering-works, testimonials, price anchor card, final CTA. Sticky mobile action bar + chat sheet (Messenger → Viber → WhatsApp) + copy-quote-summary toast, global on every page.
- **Portfolio.dc.html** — filterable case-study grid (12 seeded projects + one empty-state category "Live-selling brands" to show the empty design). Filter chips, tap-to-expand detail sheet (photos, spec table, "what we solved", "Get this spec quoted" → deep-links into Quick Quote with style/qty/colors/brand preselected).
- **Mockup.dc.html** — logo-on-tee mockup playground: upload PNG logo, multiply-blend onto flat-lay tee, drag/resize, tee color switcher (white/black/ash), print-size guide overlay, copy mockup summary.
- **Quick Quote.dc.html** — secondary ballpark calculator (style/qty/colors → per-piece + total). Links out to the full builder for buyers who want to spec everything.
- **Get Quote.html** — **the primary quote destination**, restored from the user's own `sorbetes-quote-builder V3.html` (plain HTML, not a DC — do not regenerate from scratch, only patch). Sticky scroll-scrubbed fitting stage with the model image (Josh), 5 scroll steps (Fit & fabric → Collar → Sleeves → Hem & packaging → Print & quantity), dark order-slip bar. Model image is embedded inline as a data URI (external `uploads/Josh Model.png` reference didn't paint in this renderer — SVG `<image>` needed both `href` and `xlink:href`, and even then didn't reliably load externally, so it's baked in as base64 JPEG).

## Nav (site-wide)
Wordmark: **Sorbetes** (not "Sorbetes Mfg"). Desktop row: Our Story · Services · Portfolio · Guides · Founder's Club · Contact · Get Quote · Log in · Start an Order. Below ~1080px width, collapses to a hamburger + bottom sheet with the same links. Several links (Our Story, Services, Guides, Founder's Club, Contact, Log in, Start an Order) are **placeholder `#` links** — pages don't exist yet.

## CTA routing convention
- Nav "Get quote", hero/price-anchor "Build your quote", final CTA bands, Mockup's "Get a quote with this design" → **Get Quote.html** (full builder)
- Sticky bottom bar "Get instant quote" (every page) → **Get Quote.html** (full scroll-scrub builder — this is the primary CTA)
- Portfolio's "Get this spec quoted" → **Quick Quote.dc.html** (ballpark, supports `?style=&qty=&colors=&from=` query params for preselection)
- Quick Quote's "Use the full builder →" → **Get Quote.html**

## Canonical pricing (must match everywhere)
- Classic Tee — CVC, 240 GSM — **₱290/pc**
- Classic Tee — CVC, 280 GSM — **₱305/pc**
- Premium Tee — 280 GSM — **₱320/pc**
- Extra print colors: +₱20/pc for 2nd color, +₱40/pc total for 3rd (flat, no volume tiers)
- Min. order: 50 pcs. Free etiketa + free ziploc packing always included. 1-color print is free.
- No quantity-based per-piece discounts — qty only scales the total, not the per-piece rate.

Quick Quote and Get Quote.html were cross-checked against this list; Home/Portfolio/Mockup copy references it too (price anchor card, trust strip, copy-summary text).

## Known gaps / open items
- Placeholder chat handles/numbers (Messenger `m.me/sorbetesmfg`, Viber/WhatsApp `+639000000000`) — need real handles.
- All photo/video slots are drag-and-drop `<image-slot>` placeholders (from `image-slot.js`) — client fills these in directly in the browser; nothing to code.
- Nav destinations beyond Portfolio/Get Quote/Quick Quote are stubs (`#`).
- `Get Quote.html` is hand-authored HTML (not a Design Component) per the user's original file — keep edits surgical (str_replace-style), don't rewrite via dc_write.

## File map
```
Home.dc.html          — landing page (DC)
Portfolio.dc.html      — case grid + filters (DC)
Mockup.dc.html         — logo mockup tool (DC)
Quick Quote.dc.html    — ballpark calculator (DC)
Get Quote.html         — full scroll-scrub builder (plain HTML, user-authored, model image inlined)
image-slot.js          — starter component for drag-drop image placeholders
uploads/               — user-provided assets (logo, Josh Model.png, original builder upload)
screenshots/           — debug captures, safe to ignore/delete
```
