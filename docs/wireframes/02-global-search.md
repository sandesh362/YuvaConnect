# 02 · Global Search

Route: `/search` (NEW, additive — agreed in DESIGN_SYSTEM.md §6). Status: ✅ built — pending review.

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

## 4. Build

| File | Change |
|---|---|
| `src/app/(student)/search.tsx` | **new** — the screen |
| `src/lib/tab-nav.ts` | **new** — tab→route map shared by every tab-bar screen; keys whose screen has not shipped yet map to `null` = quiet no-op (tab stays visible per wireframe, tap never crashes, never fakes a destination) |
| `src/theme/icons.ts` | new semantic glyphs (all validated): brush, code, bulb, laptop, storefront, stopwatch, link, rocket, cloudUpload, shuffle, megaphone, palette, pen, trendUp, alarm, clipboardFilled, gauge, checkmarkDone, locate, locateFilled, shareIos, moreVertical, personRemove |

Behaviour: text query filters the fetched open gigs client-side (title, description,
business name, skills); "Budget: ₹1k" is a REAL server filter (`maxBudget=1000`); "Remote"
filters the free-text `location` for remote wording; recent searches persist in
AsyncStorage (`yuvaconnect:recent-searches`, cap 6); popular tiles set the query; business
cards set the query to the business name; results render through the canonical `GigCard`.

## 5. Deviations (all flagged, nothing faked)

1. **No server text search.** Live `GET /api/gigs` accepts only `skill / minBudget /
   maxBudget / sortBy` → client-side filtering over the fetched list.
2. **"Near Me" and "Verified Only" cannot filter** (no geo; `gigInclude` omits
   `isVerified`). They toggle, and raise an explanatory `InfoBanner` instead of pretending.
3. **"Top Verified Businesses"** is derived from the businesses present on the open-gig
   feed; because verification is not in the payload the card shows an open-gig count
   instead of a "Verified" badge, plus one neutral InfoBanner saying so.
4. **Bookmark hidden on GigCards** everywhere until the Saved Gigs decision (screens
   22/37) — no SavedGig backend exists, so the icon must not pretend to persist.
5. **Funnel icon** collapses/expands the quick-filter rail here; the full Filters sheet
   arrives with screen 13.
6. **Messages tab** is a no-op until screen 5 ships `/messages`.
7. Tab-label sets differ between exports (see README); canonical student set kept:
   Home · Discover · My Gigs · Messages · Profile.
