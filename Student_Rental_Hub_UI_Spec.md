# Student Rental Hub — UI Specification

**Stack:** React (frontend) · Express/Node (API) · MongoDB · Socket.io (real-time)
**Scope:** Page-by-page breakdown of the P2P rental marketplace — verification gate, listing catalog, cart/checkout, referral program, and real-time negotiation. (Housing directory / roommate matchmaker excluded from this build.)

---

## 1. Landing Page (`/`)

**Purpose:** First touchpoint for unauthenticated visitors; explain the platform and funnel toward signup.

**Sections:**
- Hero banner — tagline ("Rent & Share — Verified Students Only"), CTA buttons: *Get Started* / *Browse as Guest*
- Trust strip — "Verified with your college email" badge row
- How it works — 3-step visual (Verify → List/Search → Chat & Meet)
- Category preview cards — Textbooks, Electronics, Cycles, Furniture, Utilities
- Referral banner (small, dismissible) — "Invite a classmate, both get credit" → links to `/referrals` (visible to logged-in users only; hidden for guests)
- Footer — About, Contact, Terms, supported campus/college logos

**Notes:** Guest browsing shows read-only listings; any action (message, list, save, add to cart) redirects to login.

---

## 2. Sign Up (`/signup`)

**Purpose:** Enforce the institutional verification gate.

**Fields:** Full name, college email (`.edu` / whitelisted college domain only — inline validation), password, confirm password, college/institution dropdown, optional **referral code** field (auto-filled if user arrived via a referral link).

**Flow:**
1. Form submit → OTP/verification link sent to college email
2. Verification pending screen ("Check your inbox") with resend timer
3. On confirm → redirect to profile setup
4. If a valid referral code was applied, show a small confirmation toast ("Referral applied — credit pending your first rental")

**States to design:** invalid domain error, weak password hint, already-registered email, invalid/expired referral code (non-blocking — signup proceeds without credit).

---

## 3. Login (`/login`)

**Purpose:** JWT-based auth entry point.

**Fields:** Email, password, "Remember me," Forgot password link.

**Notes:** Show inline error for unverified accounts with a "resend verification" action. Successful login issues JWT → redirect to Dashboard.

---

## 4. Profile Setup / Onboarding (`/onboarding`)

**Purpose:** Quick setup right after first verification.

**Steps:**
1. Profile photo + bio + phone (optional)
2. Notification preferences
3. Confirm home campus (pre-filled from college/institution selected at signup; editable — drives default Campus filter in Marketplace)

**Notes:** Fully skippable except college verification itself.

---

## 5. Dashboard / Home Feed (`/dashboard`)

**Purpose:** Authenticated landing page.

**Layout:**
- Top nav: Logo, Search bar, Marketplace link, **Cart icon (item count badge)**, Messages icon (badge count), Notifications icon, Profile avatar
- Left sidebar (desktop) / bottom nav (mobile): My Listings, Saved Items, My Bookings, **Invite Friends**, Settings
- Main feed: nearby listings (scoped to selected campus), recommended items, "recently viewed"
- Quick-action floating button: *+ New Listing*

---

## 6. Marketplace / Browse Listings (`/marketplace`)

**Purpose:** Core P2P rental catalog.

**Components:**
- **Campus selector (top of filter sidebar, sticky):** dropdown/pill showing user's home campus by default, with a toggle for **"My campus only" / "Nearby campuses" / "All campuses"**; selection persists across sessions and updates the URL query param (`?campus=`)
- Filter sidebar: category (textbooks, electronics, cycles, furniture, utilities), price range, rental duration, distance/campus, availability toggle
- Sort bar: Newest, Price low–high, Nearest
- Grid of listing cards: photo, title, price/rental period, lister's verified badge, **campus tag** (shown when viewing beyond home campus), distance, save (heart) icon, **quick "Add to Cart" icon** (for instantly rentable/available items)
- Pagination or infinite scroll
- Empty state: "No listings match — widen your filters" with a one-tap **"Search all campuses"** action when the campus filter is restrictive

---

## 7. Listing Detail Page (`/listing/:id`)

**Purpose:** Full item view and the entry point into negotiation or direct booking.

**Layout:**
- Image carousel (left) / details panel (right)
- Title, price, rental duration options (calendar picker for subscription-style rentals), category tag, **campus/pickup-campus badge**
- Description, condition, pickup location
- Lister card: photo, name, verified badge, college, response time, rating
- Primary CTAs: *Message Lister* (opens/creates chat thread) and **Add to Cart** (select rental dates, then add — enabled when the lister allows direct booking without negotiation)
- Secondary: *Save*, *Report listing*
- Availability calendar showing booked/blocked dates
- Similar listings carousel at bottom (biased toward same campus)

**States:** Add to Cart button disabled + tooltip when item is already in cart, currently unavailable for chosen dates, or listing requires negotiation-only booking.

---

## 8. Cart (`/cart`)

**Purpose:** Review and check out one or more items before confirming a rental request.

**Layout:**
- List of cart line items, grouped by lister: thumbnail, title, selected rental period, per-item price/deposit, quantity (where applicable), remove icon
- Per-lister subtotal (since handoff/coordination happens per-lister)
- Order summary panel: rental subtotal, deposit total, estimated service fee, referral credit applied (if any), grand total
- Rental dates editable inline per item (opens date picker, revalidates availability)
- Primary CTA: *Request Booking* — sends a booking request + auto-opens a message thread per lister to coordinate handoff (does not charge until lister confirms)
- Secondary: *Save for later* (moves item to Saved/Wishlist), *Clear cart*
- Empty state: "Your cart is empty" with a *Browse Marketplace* CTA

**States:** Item removed by lister mid-session (banner + auto-remove), date conflict on revalidation, referral credit ineligible for this order (e.g., not first rental) with explanation.

---

## 9. Create / Edit Listing (`/listing/new`, `/listing/:id/edit`)

**Purpose:** Let verified students publish items.

**Form (multi-step or single scrollable):**
1. Photos upload (drag-and-drop, min 1 / max 6)
2. Title, category, condition
3. Pricing — one-time rental fee or subscription/deposit model (deposit + per-day rate calculator)
4. Availability calendar (block dates)
5. Pickup/handoff location & preferred meeting notes, **campus (defaults to lister's home campus, editable if listing is available for pickup at another campus)**
6. Booking mode — **"Allow direct Add to Cart booking" toggle** vs. "Require message negotiation first"
7. Review & Publish

**States:** Draft saved, Published, Listing paused (toggle availability), Listing expired/archived.

---

## 10. Messaging / Real-Time Negotiation (`/messages`)

**Purpose:** Socket.io-powered chat for price/term negotiation and handoff coordination.

**Layout:**
- Left panel: conversation list (avatar, name, last message preview, unread badge, linked listing thumbnail)
- Right panel: active thread
  - Message bubbles (sent/received), timestamps, read receipts, typing indicator
  - Context header pinned at top: linked listing card with quick price + "Propose new price" action
  - Quick-action buttons: *Propose meetup*, *Share location pin*, *Mark as booked/rented*, **"View in Cart"** (when the thread originated from a cart booking request)
- Empty state: "Select a conversation" / "Message a lister to get started"

---

## 11. My Listings / Bookings Dashboard (`/dashboard/listings`)

**Purpose:** Manage owned listings and active rentals.

**Tabs:**
- **My Listings** — table/grid with status (Active, Paused, Booked, Expired), quick toggle availability, edit/delete
- **My Rentals (as renter)** — items I've rented, due-back dates, return reminders
- **Bookings Calendar** — combined calendar view of pickups/returns

---

## 12. Saved / Wishlist (`/saved`)

**Purpose:** Bookmarked listings in one view.

**Notes:** Each item shows a quick **Add to Cart** action alongside the existing remove/unsave icon.

---

## 13. Notifications (`/notifications`)

**Purpose:** Central feed for messages, booking confirmations, listing expiry, verification status, **referral credit earned**.

**Layout:** Chronological list, unread indicator, filter by type (add **"Referrals"** as a filter category), mark-all-read.

---

## 14. Profile & Trust Page (`/profile/:id` and `/profile/me`)

**Purpose:** Public-facing identity + trust signals.

**Components:**
- Photo, name, college + verified badge, join date
- Ratings/reviews from past rental interactions
- Active listings grid
- "Report user" / block option

---

## 15. Referral Program (`/referrals`)

**Purpose:** Let verified students invite classmates and track referral credit.

**Components:**
- Personal referral link/code with **Copy link** and native **Share** buttons
- Simple explainer strip: "Invite a friend → they sign up and complete a rental → you both get credit"
- Referral status list: Invited, Signed Up, Completed First Rental, Credit Earned (per-invite status chips)
- Credit balance summary with link to where credit auto-applies (Cart order summary)
- Empty state: "No invites yet" with a prompt to share the link

**States:** Referral link copied confirmation, credit expiring soon banner (if credits have an expiry), invite already registered on the platform (shown as "Already a member" rather than a failure).

---

## 16. Settings (`/settings`)

**Purpose:** Account management.

**Sections:** Account info, change password, notification preferences, linked college email, **home campus preference** (drives default Marketplace campus filter), **referral code / credit balance** (links to `/referrals`), deactivate account.

---

## 17. Admin / Moderation Panel (`/admin`) — *optional stretch scope*

**Purpose:** Handle listing reports, fake verification flags, dispute resolution.

**Components:** Flagged listings queue, user verification review, ban/suspend controls, basic usage analytics, **referral abuse monitoring** (e.g., self-referrals, fraudulent credit claims).

---

## 18. Magnetic Cursor Effect (Landing Page)

**Purpose:** A physics-based custom cursor that magnetically snaps to interactive elements, adding a polished, "premium" feel to the unauthenticated marketing surface (Landing Page hero, primary CTAs). Desktop-only, non-functional element — it enhances feel but is never load-bearing for a task.

**Where used:** Landing Page (`/`) hero section — logo mark, *Get Started* / *Browse as Guest* buttons, and the category preview cards. Not used inside the authenticated app (Dashboard, Marketplace, Cart, Messaging) to avoid interfering with dense, click-heavy UI.

**Behavior:**
- Default state: small circular dot (24–40px) that follows the pointer with lerped, velocity-based motion (stretches slightly along its direction of travel).
- Hover state (`data-magnetic` attribute on a target element): cursor expands and morphs to match the target's bounds/border-radius, and the target itself gets a subtle magnetic pull toward the pointer.
- Blend mode (`exclusion`/`difference`) keeps the cursor visible over both light and dark backgrounds; a contrast-boost filter compensates on low-contrast art.
- Automatically disabled on touch devices (falls back to normal system cursor).

### Setup

**Prerequisites this project needs:**
- React + TypeScript
- Tailwind CSS
- shadcn/ui project structure (`/components/ui` folder as the convention for installed primitives)

If the project doesn't already have these, scaffold with:
```bash
npx shadcn@latest init
```
This sets up Tailwind, TypeScript paths (`@/components/ui`), and the `components.json` config shadcn CLI expects. Keeping new UI primitives under `/components/ui` (rather than scattering them ad hoc) matters because shadcn's CLI, path aliases, and any teammates using shadcn conventions all assume that location — deviating breaks `npx shadcn add` for every future component.

**Install dependencies:**
```bash
npm install gsap vecteur
```

**Files to add:**
| File | Path |
|---|---|
| Component | `/components/ui/magnetic-cursor.tsx` |
| Usage example | `/components/demo/magnetic-cursor-demo.tsx` (or wherever page-level demos live) |

**Tailwind:** add to `index.css` (Tailwind 4) or `globals.css` (Tailwind 3):
```css
@theme inline {
  --radius-full: 999px;
}
```

### Component API

| Prop | Type | Default | Notes |
|---|---|---|---|
| `magneticFactor` | `number` | `0.2` | Strength of pull toward hovered elements |
| `lerpAmount` | `number` | `0.1` | Cursor follow smoothing |
| `hoverPadding` | `number` | `12` | Extra bounds added when morphing to a target |
| `hoverAttribute` | `string` | `'data-magnetic'` | Attribute used to mark magnetic targets |
| `cursorSize` | `number` | `24` | Default (non-hovered) cursor diameter, px |
| `cursorColor` | `string` | `'white'` | Base fill; per-element override via `data-magnetic-color` |
| `blendMode` | `'difference' \| 'exclusion' \| 'normal' \| 'screen' \| 'overlay'` | `'exclusion'` | CSS mix-blend-mode |
| `shape` | `'circle' \| 'square' \| 'rounded-square'` | `'circle'` | Default cursor shape |
| `disableOnTouch` | `boolean` | `true` | Falls back to system cursor on touch |
| `speedMultiplier` | `number` | `0.02` | Velocity → stretch scaling |
| `maxScaleX` / `maxScaleY` | `number` | `1` / `0.3` | Caps the stretch effect |
| `contrastBoost` | `number` | `1.5` | Backdrop-filter contrast fix for dim backgrounds |

**Marking a target as magnetic:** add `data-magnetic` (and optionally `data-magnetic-color`) to any interactive element, e.g. the *Get Started* button or a category preview card, and wrap the page/section in `<MagneticCursor>`.

**Integration notes for this spec:**
- Only wrap the Landing Page tree — not the whole app — since `disableOnTouch` still mounts a fixed-position tracker element that isn't needed once a user is authenticated and on mobile-first dashboard flows.
- Use `lucide-react` icons (already a dependency elsewhere in this stack, e.g. Cart/Messages/Notification icons in top nav) for any icon content inside magnetic targets.
- No image assets are required by the component itself; any hero imagery on the Landing Page is independent of this effect.

---

## Cross-Cutting UI Elements

| Element | Where used | Notes |
|---|---|---|
| Verified Badge | Profile cards, listing cards, chat header | Green checkmark tied to `.edu` verification status |
| Availability Toggle | Listing cards, My Listings | Instant on/off, reflects in Marketplace search |
| Real-time presence dot | Messages, profile | Online/offline/last seen |
| Cart icon + badge | Top nav (all authenticated pages) | Shows live item count; updates via socket/local state on Add to Cart |
| Campus selector/tag | Marketplace, Listing cards, Listing Detail, Settings | Consistent campus pill styling across all surfaces |
| Referral banner/link | Landing (logged-in), Dashboard sidebar, Settings, Notifications | Single consistent CTA copy: "Invite Friends" |
| Responsive breakpoints | All pages | Mobile bottom-nav replaces sidebar under 768px |
| Magnetic cursor | Landing Page (desktop only) | GSAP-powered custom cursor on hero CTAs/logo; disabled on touch, see §18 |

---

## Suggested Page Priority (for MVP demo)

1. Signup/Login + verification gate
2. Marketplace browse (with campus filtering) + listing detail
3. Cart + create listing
4. Messaging (real-time)
5. Dashboard, Profile, Notifications, Settings
6. Referral program
