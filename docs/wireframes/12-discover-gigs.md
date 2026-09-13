# 12 · Discover Gigs

Route: `/(student)/feed` (rebuilt in place). Status: ✅ built — pending review.

## 1. What the wireframe shows

- **Header:** title1 "Find your next opportunity" + 40dp initials avatar right (SR); row
  green pin + caption-bold blue-green "Powai, Mumbai".
- Read-only SearchBar row (no filter square here).
- Quick chip rail: dark-pin "Near me" · wallet "Budget: ₹1k" · "Desig…" · shield "Verifi…"
  (clipped) — same rail language as Global Search.
- **Solid blue Banner**: sparkle glyph left + bold "92% Skill Match" + caption "Gigs matching
  your Graphic Design profile" + chevron-right circle right.
- Title2 "Nearby Gigs" + body caption "Gigs within 5km of your location".
- **GigCard ×4** identical to screen 11 (Krupa Florals & Decor ₹3,500 4 days 1.2 km · The
  Bombay Bistro ₹5,000 1 day 0.8 km · Sahil General Stores ₹1,200 2 days 2.4 km · TechNova
  Solutions ₹8,000 1 week 4.1 km).
- Tab bar: Home · Discover (ACTIVE blue filled compass) · My Gigs · Messages · Profile.

## 2. Mapping
list = listGigs ✅; "92% Skill Match" banner = matchScore NOT exposed → flag (hide banner or
wire backend per §5 rec); "Nearby/5km" = no geo → flag (render as plain section title);
chips = Filters sheet state preview.

## 3. Flags (resolved at build)
- "92% Skill Match": backend matchScore NOT exposed → the % is COMPUTED CLIENT-SIDE from
  the real overlap between saved StudentProfile.skills and each gig's skillsRequired, and
  the banner says so ("computed from your saved skills"). The feed sorts by it. No saved
  skills → the banner is replaced by a CTA strip to /skills. Never a fabricated number.
- "Nearby Gigs / within 5km": no geo → wireframe title kept, caption states the real
  sorting ("distance sorting ships with geo support").
- Chips: Budget ₹1k (maxBudget=1000) and Design (skill=Design) are REAL server params;
  Near me + Verified Only use the approved toggle+explainer InfoBanner pattern.

## 4. Build
Rebuilt `src/app/(student)/feed.tsx`: ScreenHeader with real-name avatar, device-local
location row from screen 10 (tap → /location), read-only search strip → /search, chip
rail, match Banner (sparkles glyph), vertical GigCard list via the shared
toGigCardData mapper, student tab bar activeKey="discover".

## 5. Deviations
1. Match % is a client-side computation (documented above) rather than the backend
   matchScore the export implies — the only way to render it without faking.
