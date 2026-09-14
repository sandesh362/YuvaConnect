# 08 · Student Verification Flow

Route: NEW additive (`/verify`) — built as `src/app/(student)/verify.tsx`.
Header shows centred "Step 3 of 5" + help icon; 5-segment step bar directly under the
header (3 filled). Status: ✅ built — pending review.

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

## 3. Flags (resolved at build)
- Skills → REAL: `StudentProfile.skills` via `updateProfile()`.
- Work radius → NO column → AsyncStorage `yuvaconnect:work-radius`, explained by an
  InfoBanner ("device-local until the backend gains the column").
- College ID → upload is REAL (`POST /api/upload`) but StudentProfile has no document
  column → returned URL stored device-local (`yuvaconnect:student-doc`), same banner.
- Continue = save (real side effects); navigation to the next onboarding step waits for
  screen 9's `/skills` (quiet no-op rule).

## 4. New shared components (all validated, reused by later screens)
- `StepProgress` — segmented wizard bar (5 steps here; 4 on Post-a-Gig).
- `Slider` — view-based blue range slider, no new dependency, web+native.
- `FileRow` — document row (slate tile + name + meta + navy tick), reused by screens
  19 and 26.

## 5. Deviations
1. The wireframe shows the ID already uploaded; the screen renders an upload button
   until a real upload happens, then the FileRow uploaded state.
2. File size caption derives from the picked asset (2.4 MB fallback matches the export).
