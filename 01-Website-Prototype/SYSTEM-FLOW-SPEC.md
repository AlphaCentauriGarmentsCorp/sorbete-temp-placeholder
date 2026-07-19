# SORBETES — SYSTEM FLOW SPEC
**As-built, verified against source (42 pages). Not intent — actual `href` / `window.location` targets.**
_Last validated: July 8, 2026_

---

## 1. HIGH-LEVEL FLOW

**Legend:** `[Page]` = file. `→` = wired link. `⟶` = conditional / JS redirect. `✕` = broken / missing target.

### 1.1 Public entry
```
[Home] ──"Get Quote" CTA / sticky "Get instant quote"──→ [Get Quote.html]  (scroll-scrub builder = Fill-Form path)
[Home] ──"Build your quote" / price card────────────────→ [Get Quote.html]
[Home] ──"See your brand on our tee"────────────────────→ [Mockup]
[Home] ──nav "Get quote" pill (some pages)──────────────→ [Quick Quote]     ← INCONSISTENT target (see §5)
[Home] ──nav "Start an order"───────────────────────────→ #  ✕ DEAD
[Home] ──nav "Log in"───────────────────────────────────→ #  ✕ DEAD
[Any public page] ──"Chat with us"──────────────────────→ opens sheet (Messenger/Viber/WhatsApp, external)
```

### 1.2 The three order paths
```
[Choose Between Options]                       ← ORPHAN: no public inbound link (see §4)
   ├─ "Answer a few questions" → [GWQ]
   ├─ "Fill out the form directly" → [Fill Form Directly.dc.html]   ✕ FILE DOES NOT EXIST
   └─ "Use the walk-in form" → [Walk-in Form]

PATH A — Guided Walkthrough:
[GWQ] (13 Qs, 1 conditional) ⟶ localStorage:sorbetes_gwq_answers
   → [GWQ Loader Quotation] → [GWQ Product Details] → [GWQ Uploaded Files] → [GWQ Pricing]
   → [Payment.dc.html?src=gwq]

PATH B — Fill Form Directly (the scroll-scrub builder is the REAL step 1):
[Get Quote.html] ──"Continue order →"── ⟶ localStorage:sorbetes_fillform_summary
   → [Product Details] → [Fill Form Directly Upload Files] → [Fill Form Directly Pricing]
   → [Payment.dc.html?src=fillform]

PATH C — Walk-in:
[Walk-in Form] (3 internal states: garment → details → confirm) ⟶ localStorage:sorbetes_walkin_summary
   → [Payment.dc.html?src=walkin]
```

### 1.3 Payment + post-payment (shared)
```
[Payment] (reads ?src= + matching localStorage) ── pay ──→ success state (in-page)
   ├─ "View my orders" → [Home Signed In]     ← assumes session that was never established (see §3)
   └─ "Back to home"  → [Home]

[Home Signed In] → [My Orders] → [My Orders Info?id=] → [Track Order?id=] (5 stages)
[Home Signed In] → [Notification] | [Signed In Chatbot] | [Account]
Bottom tab bar (Home/Orders/Chat/Account) persists across all signed-in pages.
[Account] ↔ [Address] ↔ [Password] ↔ [Sorbetes Founders Club] ↔ [Rewards]  (shared sub-nav)
```

### 1.4 Auth island (currently disconnected)
```
[Login] ── submit ──→ [Login OTP] ── 6-digit (≠000000) ──→ [Home Signed In]
[Login] → "Forgot password?" → [Forgot Password] → (success in-page) → back to [Login]
[Registration] ── agree T&C + submit ──→ [Login OTP] ──→ [Home Signed In]
[Registration] → [Terms and Conditions] → accept → [Login OTP]
[New Password] ── ORPHAN: no inbound link (reachable only by direct URL)
```

---

## 2. STATE TRANSITIONS

### Fork
| Current | Trigger | Next | Condition |
|---|---|---|---|
| Choose Between Options | tap "Answer a few questions" | GWQ | none |
| Choose Between Options | tap "Fill out the form directly" | Fill Form Directly.dc.html | none — **FAULT: target missing → 404** |
| Choose Between Options | tap "Use the walk-in form" | Walk-in Form | none |

### Path A (GWQ)
| Current | Trigger | Next | Condition |
|---|---|---|---|
| GWQ | answer question → advance | Q+1 | `wantHelp` shown only if `hasDesign == "No, not yet"` |
| GWQ | "See my quote" (last Q) | GWQ Loader Quotation | all active Qs answered · writes `sorbetes_gwq_answers` |
| GWQ Loader Quotation | 1.4s timer | GWQ Product Details | reveal quote |
| GWQ Product Details | Continue | GWQ Uploaded Files | none |
| GWQ Uploaded Files | Continue / Skip | GWQ Pricing | upload skippable |
| GWQ Pricing | "Proceed to payment" | Payment?src=gwq | none |

### Path B (Fill Form)
| Current | Trigger | Next | Condition |
|---|---|---|---|
| Get Quote.html | adjust builder | (live price recompute) | writes `sorbetes_fillform_summary` on Continue |
| Get Quote.html | "Continue order →" | Product Details | none |
| Product Details | Continue | Fill Form Directly Upload Files | none |
| Fill Form Directly Upload Files | Continue / Skip | Fill Form Directly Pricing | upload skippable |
| Fill Form Directly Pricing | "Proceed to payment" | Payment?src=fillform | none |

### Path C (Walk-in)
| Current | Trigger | Next | Condition |
|---|---|---|---|
| Walk-in Form | garment → details → confirm | (internal React state) | no navigation |
| Walk-in Form | "Proceed to payment" | Payment?src=walkin | writes `sorbetes_walkin_summary` |

### Payment
| Current | Trigger | Next | Condition |
|---|---|---|---|
| Payment | load | render summary | reads `?src` → matching localStorage |
| Payment | "Pay now" | in-page success | none (no validation, no auth check) |
| Payment (success) | "View my orders" | Home Signed In | none |

### Auth
| Current | Trigger | Next | Condition |
|---|---|---|---|
| Login | submit | Login OTP | none (credentials not validated) |
| Login OTP | submit | Home Signed In | 6 digits AND ≠ `000000` (demo rule) |
| Registration | submit | Login OTP | T&C checkbox = true |
| Forgot Password | submit | in-page "check inbox" | none |

### Dashboard
| Current | Trigger | Next | Condition |
|---|---|---|---|
| Home Signed In | tap order / See all | My Orders | none |
| My Orders | tap order | My Orders Info?id=N | none |
| My Orders Info | "Track this order" | Track Order?id=N | none |
| Track Order | load | render stage | stage from static `statusMap[id]` (0–4), no live data |

---

## 3. USER PERMISSIONS (as-built)

**Guest (no session concept exists in code):**
- CAN: browse all public pages; run Quick Quote; run Get Quote.html builder; run all 3 order paths end-to-end; **reach and complete `Payment`**; land on `Home Signed In` and all dashboard/settings pages by direct link.
- CANNOT: nothing is actually blocked. There is no auth guard on any page.

**Authenticated user:**
- No distinct capability. `Login OTP` success and `Payment` success **both** route to `Home Signed In`, but neither sets a persisted session flag. "Authenticated" and "guest who reached the dashboard" are indistinguishable states.

**Where auth is REQUIRED:** **Nowhere.** No page checks a session. This is the central architectural gap.

**Can authenticated users re-enter order flows?** Not via UI — `Home Signed In` has **no "New order" / "Reorder" control** (verified: it exposes Notifications, Account, My Orders, Founder's Club, Chatbot, bottom tabs only). Re-entry is possible **only by manually navigating** to `Choose Between Options` / `Get Quote.html`.

---

## 4. ENTRY & RE-ENTRY POINTS

**Start a new order (public):**
- `Get Quote.html` — via Home CTAs + sticky bars. ✓ (this is Path B only)
- `Quick Quote` — via some nav pills. ✓ (ballpark only; no "continue to order" beyond the same builder handoff)
- `Choose Between Options` (the 3-way fork) — **MISSING ENTRY POINT.** No public page links to it. Reachable only by back-navigation from `GWQ` / `Walk-in Form`.
- Public nav **"Start an order"** → `#` — **MISSING ENTRY POINT (dead link on every page).**

**Restart an order:** No "start over" control on any flow page. Restart = manual nav. Stale `localStorage` summaries persist and will be read by the next `Payment` visit regardless of path (**cross-path bleed risk**).

**Enter flows from dashboard:** **MISSING ENTRY POINT** — no order CTA in `Home Signed In` or `My Orders`.

**Reach Login from public site:** nav "Log in" → `#` — **MISSING ENTRY POINT.** `Login` reachable only by direct URL or from `Registration`.

---

## 5. EDGE CASES & LOGIC GAPS

1. **Broken path (critical):** `Choose Between Options` → `Fill Form Directly.dc.html` — file does not exist. The Fill-Form path's real step 1 is `Get Quote.html`. The fork's middle option 404s.
2. **Auth never enforced:** guests complete `Payment`; `Payment`-success and `Login-OTP`-success both dump into `Home Signed In` with no session. Dashboard fully reachable unauthenticated.
3. **Orphan fork:** `Choose Between Options` has no inbound public link, so the intended "pick your path" screen is effectively unreachable in normal use — most users only ever see Path B (`Get Quote.html`).
4. **No new-order / reorder from dashboard:** explicit UX dead-end after login / payment.
5. **Dead nav controls:** "Start an order" and "Log in" are `#` on all public pages.
6. **CTA target inconsistency:** sticky bars → `Get Quote.html`; some desktop nav pills → `Quick Quote`. Two different "get a quote" destinations, no rule.
7. **localStorage cross-path bleed:** `Payment` trusts `?src=`; if a user runs Path A then opens a stale `?src=fillform` (or vice-versa), it renders a mismatched summary. No clearing of prior summaries.
8. **Orphan page:** `New Password` has no inbound link (`Forgot Password` success does not route to it).
9. **`Get Quote v2.html`** is a parallel experimental artifact (immersive scroll-scrub redesign, awaiting model video), not wired into any flow.
10. **Track Order is static:** stage derived from a hardcoded `statusMap`; unknown `id`s fall back to a default order — no "order not found" state.
11. **OTP demo rule** (`000000` = fail, any other 6 digits = pass) is placeholder logic that must be replaced.
12. **Walk-in has no upload / file step** though it can involve custom print — asymmetry vs Paths A / B.

---

## 6. NORMALIZED FLOW (corrected)

### 6.1 Required link fixes
```
Choose Between Options → "Fill out the form directly" → [Get Quote.html]   (was ✕ missing file)
Public nav "Start an order" (all pages)             → [Choose Between Options]
Public nav "Log in" (all pages)                     → [Login]
Home / sticky / price CTAs                          → [Choose Between Options]  (single order entry)
Nav "Get quote" pill                                → [Quick Quote]  (ballpark only — keep distinct + labeled)
Forgot Password (success) → email link              → [New Password] → [Login]
```

### 6.2 Insert the auth gate (choose ONE, apply globally)
**Model spec'd: guest-checkout with account capture at payment.**
```
… any Pricing → [Payment]
[Payment] step 0 (NEW): "Sign in or continue as guest"
   ├─ Sign in → [Login] → [Login OTP] → return to [Payment] with session
   ├─ Register → [Registration] → [Login OTP] → return to [Payment] with session
   └─ Guest → collect email+phone inline → proceed
[Payment] pay → success → set session=true → [Home Signed In]
```
Auth REQUIRED boundary = the pay action. Everything upstream (quote building) stays guest-open. Dashboard pages (`Home Signed In`, `My Orders*`, `Account*`, settings) REQUIRE `session=true`; unauthenticated hits → redirect `[Login]`.

**Alternative model (if preferred): hard login before Payment** — every `Pricing → Payment` transition redirects guests to `[Login]` first, then back to `[Payment]`.

### 6.3 Close the re-entry gaps
```
[Home Signed In] add primary CTA "＋ New order" → [Choose Between Options]
[My Orders Info]  add "Reorder" → [Choose Between Options] preloaded from that order
Every flow page add persistent "✕ / Save & exit" → [Home Signed In] (if session) else [Home]
```

### 6.4 State-integrity fixes
- On entering any Path (GWQ / Get Quote / Walk-in), **clear the other two** `localStorage` summaries.
- `Payment` must assert `?src` matches a **freshly written** summary (timestamp); else route to `[Choose Between Options]`.
- `Track Order` unknown `id` → "Order not found" state, not silent default.

### 6.5 Canonical normalized graph
```
[Home]
  → (Start an order) → [Choose Between Options]
        ├─ Guided   → [GWQ] → [GWQ Loader] → [GWQ Product Details] → [GWQ Upload] → [GWQ Pricing] ┐
        ├─ Fill form → [Get Quote.html] → [Product Details] → [FF Upload] → [FF Pricing] ──────────┤
        └─ Walk-in  → [Walk-in Form] ────────────────────────────────────────────────────────────┘
                                                                                                   ↓
                                                                              [Payment] —auth gate—→ pay
                                                                                                   ↓
                                                                                    session=true → [Home Signed In]
                                                                                        ├─ [My Orders] → [Order Info] → [Track Order]
                                                                                        ├─ ＋New order → [Choose Between Options]
                                                                                        ├─ [Notification] · [Chatbot]
                                                                                        └─ [Account]→[Address]→[Password]→[Founder's Club]→[Rewards]
  → (Log in) → [Login] → [Login OTP] → [Home Signed In]
```

---

## 7. OPEN DECISIONS (blocking §6 implementation)
1. **Auth model:** guest-checkout-with-capture (§6.2) **vs.** hard-login-before-Payment.
2. **Fork middle option:** point "Fill out the form directly" at the scroll-scrub `Get Quote.html` **vs.** build a separate plain form.

**Safe to fix immediately, regardless of the above:** the broken `Fill Form Directly.dc.html` link, and the two dead nav controls ("Start an order", "Log in").
