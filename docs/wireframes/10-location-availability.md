# 10 · Student Location & Availability

Route: NEW additive (`/location`) — built as `src/app/(student)/location.tsx`.
Header: back + title + caption "Step 4 of 5"; step bar 4/5 filled.
Status: ✅ built — pending review.

## 1. What the wireframe shows

- Title1 "Work Location" + body "Where do you want to find gigs?".
- Card row: 48dp indigo-100 circle w/ locate glyph + caption-bold "Current Location" + bold
  "Powai, Mumbai, Maharashtra" + chevron right.
- **Map image** (OpenStreetMap tiles, radius 12) with translucent BLUE RADIUS CIRCLE + centre
  pin; attribution caption bottom-right "Map data from OpenStreetMap".
- Row: heading "Work Radius" + right blue bold "15 km"; label "Distance" + blue slider.
- Title2 "Work Preference" + body "Choose how you prefer to work"; TWO selectable cards
  (h≈96, centred icon+label): SELECTED "On-site" = 2px blue border + blue store glyph + blue
  bold label; idle "Remote" = hairline + slate laptop glyph + slate label.
- Title2 "Availability" + body "When are you free to take up gigs?"; **day circles** 56dp:
  Mon–Fri SOLID BLUE white bold labels; Sat/Sun white + hairline + slate labels.
- Washed info row: info glyph + body "Most MSMEs prefer students available for at least 4
  hours on selected days."
- Sticky bar: primary lg "Save & Continue" + trailing arrow glyph.

## 2. Mapping
location text → StudentProfile has NO location column (§5 ⚠️ degree/year/workRadius/
workPreference all absent); availability = 3-value enum TODAY/EVENINGS/WEEKENDS only — the
7-day picker has NO home → flag. Map = no geo → text + static illustration or hide (per
decision: maps text-only for pilot) → DEVIATION, documented.

## 3. Flags (resolved at build)
- No columns for location / radius / preference / weekdays → all device-local
  (AsyncStorage `yuvaconnect:location-availability`) behind one explanatory InfoBanner.
- Map → approved pilot decision: text-only radius treatment + flag banner; no fake map.
- "Current Location" never shows a hardcoded place: stored value or "Tap to set"; tapping
  reveals a real editable field.

## 4. Build
`src/app/(student)/location.tsx`; reuses StepProgress, Slider, SelectTile (`align="center"`
variant's first real use), InfoBanner; local DayCircle (52dp round toggles, Mon–Fri default).
Save & Continue persists and replaces to /home (onboarding complete).

## 5. Deviations
1. Map image replaced by the text treatment above (documented pilot decision).
2. Day circles are 52dp rather than 56dp to fit seven across at the 320dp minimum width.
