# 02 · Global Search

Route: `/search` (NEW, additive — agreed in DESIGN_SYSTEM.md §6). Status: building.

## 1. What the wireframe shows

- **Header bar:** back arrow · full-width search field (magnifier + placeholder
  "Search gigs, skills, or businesses") · funnel icon button on the right. Field is the
  dominant element; no title text.
- **Quick-filter chip rail** (horizontal scroll, under header, on white): dark map-pin chip
  "Near Me" · outlined chip w/ wallet icon "Budget: ₹1k" · outlined chip w/ shield-check
  "Verified Only" · outlined chip "Remote" (clipped at edge).
- **Ground below header:** light neutral.
- **"Recent Searches"** heading (title3) + blue "Clear All" link right. 2-column wrap of
  OUTLINED white chips (radius 8, hairline border, slate-800 label): Graphic Design ·
  Video Editing · MSME Marketing · Social Media.
- **"Popular Skills in Mumbai"** heading. 2×2 grid of large TINTED tiles (radius 12, h≈88,
  icon left + bold label): UI/UX Design = blue-50 tint + brush icon · Development = mint tint
  + code icon · Photography = amber-50 tint + camera icon · Content Strategy = indigo-50 tint
  + bulb icon.
- **"Top Verified Businesses"** heading + blue "View All" right. Horizontal row of cards
  (w≈260): centred 64dp initials circle (KK blue-100 / SS mint-100), bold name, then
  shield-check + "Verified" caption row.
- **"Recommended for your profile"** heading. Standard GigCard: business icon tile +
  "Arjun's Boutique" + verified check + bookmark right; title "Product Photography for Loca…"
  (1 line ellipsis); indigo skill pill "Photography, Editing"; divider; (price row cut off).
- **Bottom tab bar (student):** Home · **Discover (active: blue magnifier glyph + blue
  label)** · Gigs · Inbox · Profile. (Tab labels vary between exports — see §5.)

## 2. Mapping to live app data

| Element | Live equivalent |
|---|---|
| Search field | client-side query state; drives the list below |
| Recent Searches | local only (AsyncStorage) — no backend stores searches |
| Popular Skills tiles | static curated list (no skills endpoint) |
| Top Verified Businesses | needs a businesses list — check `src/lib/*-api.ts`; likely absent → flag |
| Recommended GigCard | `listGigs()` from `src/lib/gigs-api.ts` |
| Quick-filter chips | mirror the Gig Filters sheet state (screen 13) |

## 3. Flags
- No server-side search endpoint expected → verify; else filter client-side over `listGigs`.
- No businesses directory endpoint expected → Top Verified Businesses may need a flag or a
  derive-from-gigs approach (distinct business names on gigs).
- Recent searches persistence = new local storage, clearly local (not faked server data).

## 4. Build — at build time
## 5. Deviations — at build time (tab-label inconsistency across exports recorded in README)
