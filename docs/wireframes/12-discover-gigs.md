# 12 · Discover Gigs

Route: `/(student)/feed` (rebuild in place).

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

## 3. Flags: skill-match %, distance, radius copy.
## 4–5. At build time.
