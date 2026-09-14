# 23 · Student Portfolio & Profile

Route: `/(student)/profile` (rebuilt in place). Status: ✅ built — pending review.

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

## 3. Flags (resolved at build)
- Degree/Year: NOT in schema → caption shows the real college only. Pin row shows the
  device-local location saved on screen 10 (flagged there).
- Edit endpoint EXISTS: PUT /api/profile accepts college/bio/availability/profileImageUrl
  → the Edit Profile sheet is fully real (photo via /api/upload).
- PortfolioItem stores title/description/imageUrl/createdAt only → the wireframe's blue
  category overline, business caption, ₹ amount and star pill are OMITTED (no columns);
  cards show the real fields + real month/year. An inline InfoBanner states this.
- Verified tick badge renders only when isVerified is real.
- Earnings stat = real /api/earnings total; Gigs stat = real count of my applications on
  completed gigs; Rating = real avgRating/totalRatings (em-dash without ratings).

## 4. Build
Rebuilt on the new system with ALL legacy functionality preserved: portfolio add (sheet
with title/description/real image upload) + remove (trash action, real endpoint), profile
edit sheet (college/bio/availability chips/photo), sign-out. Skill pills use white pills
with 24dp navy icon circles; icons chosen by keyword (brush/megaphone/palette/pen/camera/
film/code/trendUp, sparkles fallback). New glyph `film`. Tab bar activeKey="profile".

## 5. Deviations
1. Add-portfolio + trash controls are functionality preservations not drawn in the export
   (removing them would regress the live app).
2. Stat icons sit in tinted wells (StatBox `tinted`) per the export's icon treatment.
