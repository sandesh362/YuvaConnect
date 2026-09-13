# 22 · Saved Gigs — ❌ NO BACKEND (register). Route NEW additive (`/saved`).

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
## 3. Flags — screen can only ship as an honest EMPTY state ("Nothing saved yet") until a
   join table + 3 endpoints exist; bookmark taps elsewhere must not pretend to persist.
   DECISION NEEDED from user: hide tab+screen, or ship empty-state version.
## 4–5. At build time.
