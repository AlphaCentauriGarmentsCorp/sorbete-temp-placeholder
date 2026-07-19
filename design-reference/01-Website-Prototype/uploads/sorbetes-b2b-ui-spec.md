# SORBETES B2B — UI System Spec

## SYSTEM

A B2B custom apparel ordering website for **Sorbetes Apparel Studio**. Non-members browse the brand, then start a custom order through one of two paths — a **Guided Walkthrough** (question-by-question wizard) or a **Fill Form Directly** flow. Both paths converge to product details → file upload → pricing → payment. Signed-in members get a dashboard to track orders, use chatbot support, and manage account settings.

---

## PAGES

### 1. Public Pages *(NON-MEMBER)*
- Home Page
- Our Story
- Our Services
- Portfolio
- Portfolio / Sorbetes Archive
- Portfolio Expanded
- Guide
- Fabric Print Guide
- Founder's Club
- Founder's Club Guide
- Get in Touch (Contact)

### 2. Auth Pages *(Authentication)*
- Login
- Login / OTP
- Login / OTP Incorrect
- Registration
- Forgot Password
- Forgot Password / Confirmation
- New Password
- New Password / Confirmation
- Terms & Conditions

### 3. Order Flow Pages *(multi-step)*

**Entry / Fork**
- Choose Between Options *(Guided Walkthrough vs Fill Form Directly)*

**Walk-in Form — product select**
- Walk-in Form (T-shirt selected)
- Walk-in Form (T-shirt selected — Mockup Info)
- Walk-in Form (Hoodie selected)
- Walk-in Form (Confirmation)

**Path A — Guided Walkthrough (GWQ)**
- GWQ Questions 1–13 *(each with click / conditional / radio states)*
- GWQ / Loader Quotation
- GWQ / Product Details
- GWQ / Uploaded Files
- GWQ / Pricing 1.1 → 1.2
- GWQ / Payment

**Path B — Fill Form Directly**
- Fill Form Directly 1.1 → 1.2
- Product Details (Custom Woven Location Added)
- Fill Form Directly / Upload Files
- Fill Form Directly / Pricing → Pricing Expanded
- *(→ Payment, shared)*

### 4. Dashboard Pages *(CUSTOMER — MEMBER)*

**Signed-in Home & Support**
- Home / Signed in
- Notification
- Signed in / Chatbot
- Signed in / Chatbot 1.1
- Signed in / Chatbot reply notif
- Signed in / Chatbot reply

**Orders**
- Orders / My Orders
- Orders / My Orders Info
- Orders / Track Order 1.1 → 1.5

**User Settings**
- Account 1.1 → 1.5
- Address 1.1 → 1.3
- Password 1.1 → 1.3
- Sorbetes Founder's Club 1.1 → 1.2
- Rewards 1.1 → 1.3

---

## USER FLOW

### A — Browse (Public)
**Step 1:** Land on Home → explore Our Story, Our Services, Portfolio (→ Sorbetes Archive → Expanded item view), Guides (Guide, Fabric Print Guide), Founder's Club (→ Guide), and Get in Touch.

### B — Start an Order
**Step 2:** Open **Choose Between Options** → pick **Guided Walkthrough** *or* **Fill Form Directly**.

#### Path A — Guided Walkthrough
- **A1:** Answer Questions 1–13 (garment type, print specs, quantity — driven by click / "if yes" / radio-button states).
- **A2:** Loader runs → Quotation generated.
- **A3:** Review Product Details.
- **A4:** Upload design files.
- **A5:** Review Pricing (1.1 → 1.2).
- **A6:** Payment.

#### Path B — Fill Form Directly
- **B1:** Fill form (1.1 → 1.2).
- **B2:** Set Product Details + Custom Woven Location.
- **B3:** Upload files.
- **B4:** Review Pricing (→ Pricing Expanded).
- **B5:** Payment.

### C — Walk-in Form *(separate product-select flow)*
- **W1:** Select garment — T-shirt or Hoodie.
- **W2:** (T-shirt) Add Mockup Info.
- **W3:** Confirmation *(doubles as pre-payment review)*.
- **W4:** Payment *(shared screen)*.

### D — Authentication
**Step 3:** Register (new user) *or* Login → OTP verify (retry on incorrect) → accept Terms & Conditions. Password recovery: Forgot Password → request confirmation → New Password → confirmation.

### E — Member Dashboard
- **Step 4:** Signed-in Home → Notifications, Chatbot support (with reply states).
- **Step 5:** My Orders → Order Info → Track Order (5 stages).
- **Step 6:** User Settings → Account / Address / Password / Founder's Club / Rewards.

---

## FEATURES PER PAGE

*Grouped by module. States (1.1, 1.2, "clicked", "if yes") = screen variations of the same page.*

### Public

**Home Page**
- Brand landing + primary CTA to start an order
- Entry point to all public sections

**Our Story**
- Brand story content

**Our Services**
- Services listing

**Portfolio / Sorbetes Archive / Portfolio Expanded**
- Work gallery → archived collection → single-item expanded view

**Guide / Fabric Print Guide**
- General help content + fabric & print reference

**Founder's Club / Founder's Club Guide**
- Membership program info + how it works

**Get in Touch**
- Contact form / details

### Auth

**Login / OTP / OTP Incorrect**
- Credential sign-in → OTP entry → error + retry state

**Registration**
- New account sign-up

**Forgot Password / Confirmation**
- Request password reset → request-sent state

**New Password / Confirmation**
- Set new password → success state

**Terms & Conditions**
- Accept T&C

### Order Flow

**Choose Between Options**
- Two-path selector: Guided Walkthrough vs Fill Form Directly

**Walk-in Form (T-shirt / Mockup Info / Hoodie / Confirmation)**
- Garment selection (t-shirt / hoodie)
- Mockup info input (t-shirt)
- Review + confirm

**GWQ Questions 1–13**
- Step-by-step question wizard
- Per-question states: click-to-select, conditional "if yes" branches, radio-button choices
- Progressively captures garment + print spec

**GWQ / Loader Quotation**
- Processing loader → generated quote

**GWQ / Product Details**
- Order spec summary

**GWQ / Uploaded Files**
- Design file upload

**GWQ / Pricing 1.1 → 1.2**
- Price breakdown (two states)

**GWQ / Payment**
- Checkout + payment

**Fill Form Directly 1.1 → 1.2**
- Direct order form (two steps)

**Product Details (Custom Woven Location Added)**
- Order spec + woven-label placement setting

**Fill Form Directly / Upload Files**
- Design file upload

**Fill Form Directly / Pricing → Pricing Expanded**
- Price breakdown (collapsed → expanded)

### Dashboard

**Home / Signed in**
- Member landing

**Notification**
- Alerts list

**Chatbot / 1.1 / reply notif / reply**
- In-app chat support with reply + notification states

**My Orders / My Orders Info**
- Order list → single-order detail

**Track Order 1.1 → 1.5**
- Order status tracker (5 stages)

**User Settings — Account 1.1–1.5**
- Profile / account management (multi-state)

**User Settings — Address 1.1–1.3**
- Address management

**User Settings — Password 1.1–1.3**
- Change password

**User Settings — Sorbetes Founder's Club 1.1–1.2**
- Club membership management

**User Settings — Rewards 1.1–1.3**
- Rewards / points

---

## LOCKED ASSUMPTIONS *(for this design pass — adjustable later)*
- **Walk-in Form is a standalone flow.** It does not merge into Guided Walkthrough or Fill Form Directly.
- **One shared Payment screen** serves all three flows (Guided, Fill Form, Walk-in). Design implication: its order-summary block must be **source-agnostic** — it receives a Quotation (Path A), a Pricing breakdown (Path B), or a Walk-in Confirmation. Build a single summary component that renders any of the three, not three separate Payment layouts.
- **Account state 1.4** treated as non-critical and skipped for this pass.

### One routing note (not a blocker)
Walk-in has no Pricing screen of its own in the source — it ends at Confirmation. Since it now feeds the shared Payment, treat **Walk-in Confirmation as the pre-payment review** (Confirmation → Payment). Add a dedicated pricing step later only if walk-in orders need a separate price display.
