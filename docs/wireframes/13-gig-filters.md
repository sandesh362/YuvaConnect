# 13 · Gig Filters — MODAL BOTTOM SHEET over /feed (decision 4, no route)

## 1. What the wireframe shows

- Sheet header: X left · centred title2 "Filters" · blue bold "Reset" right.
- **"Distance Radius"** title2 + right blue bold "Within 15 km"; label row "Distance" +
  "15 km"; blue slider; caption "Showing gigs near Powai, Mumbai"; divider.
- **Title2 "Skills"** + body "Select skills you want to use"; wrap chips: SELECTED = SOLID
  BLUE white bold (Graphic Design, Social Media); idle = white outline (Content Writing,
  Photography, Data Entry, Video Editing); divider.
- **Title2 "Budget Range (₹)"**; two fields side by side: "Min" wallet glyph 500 · "Max"
  wallet glyph 5000; preset chip row: outline "Under ₹1k" · SELECTED washed-white w/ dark
  check "₹1k - ₹5k" · outline "₹5k+"; divider.
- **Title2 "Gig Duration"**; 2×2 RADIO list: ● blue ring-dot "Single Day" (selected) · ○
  "1-3 Days" · ○ "1 Week" · ○ "1 Month+"; divider; (further content below fold).
- Sticky bar: full-width primary "Show 42 Gigs" (live count).

## 2. Mapping
skills/budget/duration filter client-side over listGigs result (no server filter params
expected → verify); distance = no geo → slider renders but is inert or hidden (flag);
count = filtered length.

## 3. Flags: distance slider, server-side filtering.
## 4. New: `Sheet` (modal bottom sheet) + `Slider` + `RadioRow` components.
## 5. At build time.
