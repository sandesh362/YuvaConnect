# 37 · Saved Talent ("Talent Pool") — ❌ NO BACKEND (register).
Route NEW additive (`/talent`).

## 1. What the wireframe shows

- Header: title1 "Talent Pool" + body "Verified students you've saved for future work";
  sort-lines icon right.
- Search row: magnifier + "Search saved talent..." + 44dp MINT rounded-12 square w/ dark
  sliders glyph right.
- **Talent cards**: 56dp initials circle + title3 name + blue verified + caption "IIT Bombay
  • B.Tech"; TWO StatBoxes side by side: star caption "Rating" + title3 **"$rating"** (EXPORT
  BUG — render real avgRating) · help-circle caption "Match" + title3 "98%"; MINT pills UI
  Design/React/Python; divider; row: caption-bold "Availability" + GREEN bold value
  ("Immediate"/"Part-time"/"Weekends") + right outline pill "Invite to Gig".
  ×4 (Arjun Mehta 98 Immediate · Priya Sharma 94 Part-time · Rohan Das 91 Weekends · Ananya
  Iyer 89).
- Tab bar BUSINESS: Home · Gigs · Post · **Talent (ACTIVE filled people)** · Profile.

## 2. Mapping — NONE for saved list (§5 ❌); match % ❌; availability ✅ enum; invite = no
   endpoint → flag.
## 3. Flags: SavedTalent model, match %, invite; $rating bug → real value.
   DECISION NEEDED: ship as honest empty state or hide tab (same question as 22).
## 4–5. At build time.
