# 22 · Saved Gigs — ❌ NO BACKEND (register). Route NEW additive (`/saved`). Status: ✅ built (ship-empty per user decision) — pending review.

## 1. What the wireframe shows

- Header: title1 "Saved Gigs" + body "Opportunities you're interested in"; search icon
  right.
- Check-mark rail: "✓ All Gigs" + outlined "Design" "Marketing" "Tech" "Writing".
- **GigCard ×5, bookmark glyph FILLED/active**: Blue Tokai Coffee / Social Media Manager for
  Cafe / pill "Instagram, Content Strategy" / ₹4,500 · 1 week · 1.2 km · Zudio Retail /
  Product Photography / "Photography, Editing" / ₹8,000 · 3 days · 3.5 km · Sharma & Co. CA /
  Data Entry Assistant / "Excel, Bookkeeping" / ₹2,500 · 2 days · 0.8 km · Unstop / Campus
  Brand Ambassador / "Marketing, Events" / ₹5,000 · 1 month · 2.1 km · TechSprint Startup /
  Flutter App Bug Fixes / "Flutter, Dart" / ₹12,000 · 5 days · "Remote".
- Tab bar: Home · Discover · **Saved (ACTIVE blue filled bookmark)** · Messages · Profile.

## 2. Mapping — NONE. No SavedGig model/route (§5 ❌).
## 3. Flags — DECISION MADE (user, screen-21 review): **ship-empty + flagged**.
The screen renders the exact wireframe chrome (header + search action, check-mark skill
rail, Saved tab active) over a neutral InfoBanner + honest EmptyState ("Nothing saved
yet"). No fake cards; bookmark taps elsewhere keep their explanatory banners. When the
backend gains a SavedGig join table + endpoints, the list slots real GigCards in via
toGigCardData.

## 4. Build
`src/app/(student)/saved.tsx` (route `/saved`); tab-nav gained `saved`; the tab bar uses
the per-export Saved variant (My Gigs slot → Saved bookmark, matching how Earnings swaps
Messages). Skill rail chips are interactive state over the empty list — honest chrome.

## 5. Deviations
1. List content = flag banner + EmptyState instead of the five mock GigCards (decision
   above).
