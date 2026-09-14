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

## 3. Flags (resolved at build)
- Distance slider: no geo → renders per wireframe, is display-only, caption + apply-time
  banner say so.
- Duration radio: Gig model has no duration column → rows render, selection recorded,
  apply-time banner flags that it cannot filter yet.
- Skills + budget filter CLIENT-SIDE over the real feed (server only exposes
  skill/minBudget/maxBudget/sortBy on listGigs; the sheet is deliberately local state so
  Reset is instant and the "Show N Gigs" count is live).

## 4. Build
- NEW `Sheet` ui component: Modal + scrim + radius-24 top + handle + X · centred title ·
  right action header + scrollable body + sticky footer — reused by Apply for Gig (15).
- NEW `RadioRow` ui component: blue ring+dot radio rows.
- `/feed` gains the sheet behind a "Filters" action on the Nearby Gigs section header;
  applied filters combine with the quick chips; empty state offers "Reset filters".
- Preset chips (Under ₹1k / ₹1k–₹5k / ₹5k+) use the soft selected skin and sync the
  Min/Max fields both ways (typing clears the preset).

## 5. Deviations
1. Sheet entry point is the section-header "Filters" link (the feed wireframe shows no
   filter square); the chip rail remains the quick-filter preview, per the export.
2. "Show 42 Gigs" counts the live filtered draft over the loaded feed.
