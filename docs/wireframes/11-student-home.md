# 11 · Student Home Dashboard

Route: `/(app)/home` (rebuild in place, student branch).

## 1. What the wireframe shows

- **Header:** title1 "Good evening, Sandesh 👋"; row: green map-pin + caption-bold "Powai,
  Mumbai" + caret; right 48dp white circle bell w/ RED count bubble "3".
- Search row: read-only SearchBar (magnifier + "Search gigs, skills or businesses") + 48dp
  SOLID-BLUE rounded-12 square with white sliders glyph (opens Filters sheet).
- **Gradient Banner** (blue→indigo, radius 16): caption-bold white "Verification Status";
  row shield-check + bold "Verified Student"; right washed link "My Portfolio" (artifact →
  white).
- Section row: title2 "Recommended for you" + blue "See All".
- **GigCard ×3** (canonical): icon tile + business name + verified + bookmark; title; ONE
  indigo skill pill; divider; price bold + duration caption under; right pin + "2.4 km away"
  caption + blue "View Gig".
  (Aura Digital Agency / Create Instagram Content Pack / Graphic Design / ₹2,500 / 3 days /
  2.4 km · The Brew Room / Product Photography for Cafe / Photography / ₹4,000 / 1 day /
  1.2 km · Raj Textiles MSME / Data Entry for Inventory / Data Entry / ₹1,800 / 5 days /
  3.5 km.)
- Section row: title2 "Near your campus" + blue "Map View"; map image (cut off).
- **Bottom tab bar:** Home (ACTIVE blue filled house) · Discover · Applied · Messages ·
  Profile.

## 2. Mapping
greeting name = auth user ✅; location text = none → show profile college or hide (flag);
unread bell = notifications unreadCount ✅; banner = isVerified ✅; recommended = listGigs
(match% unavailable → hide match chip, §5); map = flag/text-only.

## 3. Flags: distance "km away" (no geo), campus map, location label.
## 4–5. At build time.
