# 14 · Gig Details View

Route: `/(student)/gig/[id]` (rebuilt in place). Status: ✅ built — pending review.

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

## 3. Flags (resolved at build)
- Duration stat is DERIVED from the real deadline ("N Days", hint says so) — no duration
  column exists.
- Distance + map → text-only pilot treatment (posted `gig.location`, Remote detected by
  regex); no fake km, no fake map.
- Bookmark → icon renders (header + sticky bar), tap explains the missing SavedGig
  collection (screen-22 decision still pending).
- Deliverables card → section OMITTED (no requirements column; submitted deliverables are
  a different model) — omission preferred over invention.
- Verified tick + "Member since 2023" → no fields in the payload → caption reads
  "MSME on YuvaConnect"; View Profile link omitted (no public business-profile route).
- Business rating row renders ONLY when getUserRatings returns totalRatings > 0.

## 4. Build
Rebuilt on the new system with the lifecycle PRESERVED inside wireframe visuals:
OPEN+no application → "Apply for this Gig" opens a real Sheet form (applyToGig);
OPEN+applied → status pill; ASSIGNED → Start Gig (startGig, errors surface inline —
includes the "business must fund first" 409); IN_PROGRESS/REVISION_REQUESTED →
Submit/Resubmit sheet (real uploadImage + submitGig); SUBMITTED → review pill;
APPROVED/PAID/CLOSED → routes to the screen-6 /rate flow. Tracker/submission polish
arrives with screens 17/18.

## 5. Deviations
1. Hero image row: the payload has no gig photo field → the header carries the icon pair
   only (bookmark/share), no invented hero image.
2. Share uses RN Share with an honest fallback notice on platforms without it.
