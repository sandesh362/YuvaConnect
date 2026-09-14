# 24 · Student Reviews ("Reviews & Ratings")

Route: NEW additive (`/reviews`, optional `?userId=`, defaults to me) — built as
`src/app/(student)/reviews.tsx`. Status: ✅ built — pending review.

## 1. What the wireframe shows

- Header: back · title2 "Reviews & Ratings" · share icon right.
- **Summary card**: left display 48-extrabold "4.9" + row of 5 DARK-NAVY stars (4 full +
  half) + caption "Based on 24 gigs"; right HISTOGRAM: 5 rows label 5…1 + amber bars (5 =
  ~85% wide, 4 = ~12%, 3 = ~5%, 2/1 = 0) on slate-200 tracks; divider; MINT tag pills: On
  Time · Pro Communication · High Quality · Reliable.
- Row: title2 "Recent Feedback" + right blue bold "Newest" w/ sort glyph.
- **Review cards**: 48dp mint initials circle + bold business "Mehta Kirana Store" +
  overline caption "Verified MSME" + right title3 bold "₹2,500"; title3 gig title
  "Inventory Management & Digitization"; caption "Completed 12 Oct 2023"; 4-line body; row
  of 5 small DARK stars. 2nd: PS "Pixel Studio" / Verified Business / ₹4,800 / "Product
  Photography for E-commerce" / 28 Sep 2023 / body / 4 stars + 1 outline.
- Footer row: DARK shield-half glyph + caption "All reviews are from verified local
  businesses".
- Tab bar: Home · Discover · Gigs · Chat · **Profile (ACTIVE)**.

## 2. Mapping
GET /api/users/:id/ratings ✅ (register); histogram = client aggregate of ratings; tags =
no column → flag; gig amount on review = join via application/gig ✅ maybe.

## 3. Flags (resolved at build)
- Mint tag pills (On Time / Pro Communication…): no column, and comments are NEVER parsed
  to fake them → the slot carries a flag caption instead.
- Review cards omit ₹ amount / "Verified MSME" overline / completion date — the Rating
  payload has none; the shown date is the real rating date, labelled "Rated …".
- Footer trust line reworded to a supportable claim: "All reviews come from businesses you
  completed gigs with" (ratings are participant-only server-side — a fact).
- Half-star rendering ✅ via RatingStars (navy via starColor override from screen 6).

## 4. Build
Real GET /api/users/:id/ratings drives everything: summary (48dp average + navy stars +
"Based on N ratings"), client-aggregate amber histogram on slate tracks, Recent Feedback
with a REAL sort cycle (Newest → Oldest → Highest, shuffle glyph), review cards with mint
initials avatars, real gig titles, real comments, small navy stars, and RN Share in the
header (silent fallback where unsupported). Empty state when totalRatings = 0. Entry point:
the profile's Rating stat is now pressable → /reviews. Tab bar activeKey="profile" per the
export.

## 5. Deviations
1. Sort is a tap-cycling control (newest/oldest/highest) — the export shows only "Newest".
2. Summary caption says "ratings" not "gigs" (a user rates once per gig, but the honest
   noun is the record that exists).
