# 23 · Student Portfolio & Profile

Route: `/(student)/profile` (rebuild in place).

## 1. What the wireframe shows

- **Header card** (white block): 80dp initials circle "SR" (indigo-100) with 24dp GREEN
  filled tick badge bottom-right; title1 "Sandesh Reddy"; caption "B.Tech Computer Science •
  Year 3"; caption row pin glyph + "Vile Parle, Mumbai".
- 3 StatCards: wallet "Earnings ₹18,400" · check-circle "Gigs 12" · star "Rating 4.9/5".
- Outline full-width button w/ pencil "Edit Profile".
- Title2 "Verified Skills"; WHITE pills with 24dp DARK-NAVY circle icon + slate-800 label:
  Graphic Design (brush) · Social Media (megaphone) · UI Design (palette) · Content Writing
  (pen) · Photography (camera).
- Row: title2 "Work Portfolio" + caption-bold "12 Items".
- **Portfolio cards**: overline BLUE category ("SOCIAL MEDIA") + right mint pill star "5.0";
  title3 title; caption business; divider; caption calendar "Oct 2023" + right title3 bold
  "₹2,500". ×4 (Photography 4.8 Luxe Home Decor Sep ₹4,200 · Graphic Design 5.0 TechPulse
  Aug ₹1,800 · UI Design 4.9 Corner Coffee House July ₹3,500).
- Tab bar: Home · Discover · Gigs · Messages · **Profile (ACTIVE blue filled person)**.

## 2. Mapping
user + StudentProfile ✅; earnings total ✅ /api/earnings; gigs count = applications? derive;
rating ✅ avgRating/totalRatings; PortfolioItem ✅ (category/title/business/date/amount?);
location/degree/year = NOT in schema → flag (hide rows); Edit Profile → check update
endpoint.

## 3. Flags: degree/year/location, edit endpoint, portfolio amount/date fields.
## 4–5. At build time.
