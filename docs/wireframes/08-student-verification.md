# 08 · Student Verification Flow

Route: NEW additive (`/verify`). Header shows centred "Step 3 of 5" + help icon; 5-segment
step bar directly under the header (3 filled).

## 1. What the wireframe shows

- Title1 "Select your skills" + body "Choose categories where you have real-world
  experience." (skills step shown; other steps of the 5 share the chrome).
- **"Popular Skills"** heading; wrap of SOLID-BLUE pill chips (white bold labels): Graphic
  Design, Social Media, Content Writing, Video Editing, Data Entry, Web Development,
  Photography, Marketing, Product Photography, Sales. (All shown selected = state demo.)
- Divider. **"Work Radius"** heading; card: caption-bold "Preferred Radius" + blue title3
  "15 km" + locate glyph right; label "Distance" + blue SLIDER (track slate-200, 24dp round
  thumb); caption "You'll see micro-gigs within 15 km of your college/home."
- **"College Verification"** heading; file row card: 56dp slate-200 rounded tile w/ id-card
  glyph + bold "student_id_front.jpg" + caption "2.4 MB • Uploaded" + DARK-NAVY filled tick
  circle right.
- Sticky bar: outline "Back" (flex 1) + primary "Continue" (flex 1.4).

## 2. Mapping
`StudentProfile.isVerified` ✅; skills → `StudentProfile.skills` ✅. Work radius → NO column
(§5 ⚠️). Student-ID upload → NO file endpoint → flag (row can render an already-uploaded
state only if we fake it — we must not; show picker disabled + flag).

## 3. Flags: radius column, document upload, verification submission endpoint.
## 4. New components owed: `StepProgress` (5-segment bar), `Slider` (blue), `FileRow`.
## 5. At build time.
