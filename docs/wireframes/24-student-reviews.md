# 24 · Student Reviews ("Reviews & Ratings")

Route: NEW additive (`/reviews/[userId]` or `/reviews`).

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

## 3. Flags: review tags, half-star rendering (RatingStars already half-accurate ✅).
## 4–5. At build time.
