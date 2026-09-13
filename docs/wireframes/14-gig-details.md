# 14 · Gig Details View

Route: `/(student)/gig/[id]` (rebuild in place).

## 1. What the wireframe shows

- Header: back · bookmark icon button · share icon button (right pair).
- Title1 28-extrabold gig title; row: blue bold business name + verified check + "•" +
  star glyph + bold "4.9" + caption "(12 reviews)".
- **2×2 StatBox grid**: Budget ₹2,500 · Duration "3 Days" · Location "2.4 km (Remote)" ·
  Deadline "Oct 24" in RED.
- Title2 "About the Gig" + 4-line body paragraph.
- Title2 "Required Skills" + MINT pills: Graphic Design, Social Media, Canva, Creative
  Writing.
- Card "Deliverables": 4 rows of 20dp OUTLINE circles + body labels (10 High-quality Square
  Posts (PNG/JPG) · 5 Animated Stories (MP4) · Source Files (Canva/Figma link) · Caption &
  Hashtag Suggestions).
- Row: title2 "Work Location" + right blue bold "Andheri East, Mumbai"; **map image** radius
  12 w/ OSM attribution.
- Washed business card: 48dp blue initials circle "DS" + bold "Design Studio Pro" + caption
  "Verified MSME • Member since 2023" + right blue "View Profile".
- Sticky bar: 56dp outline square bookmark button + primary flex "Apply for this Gig".

## 2. Mapping
gig fields ✅ (budget/deadline/location/skills); duration → derive from deadline (§5 ⚠️);
"2.4 km" + map → no geo → DEVIATION text-only (flag); business rating/reviews ✅
/users/:id/ratings; bookmark → no SavedGig → flag (icon renders, tap explains);
deliverables list → no column → flag (derive from description or hide).

## 3. Flags: distance, map, bookmark persistence, deliverables, member-since.
## 4–5. At build time.
