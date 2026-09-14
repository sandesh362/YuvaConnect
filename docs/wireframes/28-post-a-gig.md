# 28 · Post a New Gig

Route: `/(business)/post-gig` (rebuild in place) — FULL SCREEN w/ sheet-like header.

## 1. What the wireframe shows

- Header: X left · **4-segment step bar centred (1 filled)** · blue bold "Save Draft" right.
- Title2 "Basic Details" + body "Clearly describe the task to attract the right students."
- "Gig Title" input w/ value "Product Photography for Bakery".
- "Category" FLOATING-LABEL select card: caption label overlapping top border + "Photography"
  + caret.
- "Description" textarea "Looking for a student to take 15 high-quality p…".
- Divider; title2 "Skills & Requirements" + body "What expertise does the student need?";
  label "Required Skills"; chips: SELECTED = washed-white + DARK check + slate-800 ("Product
  Photography", "Adobe Lightroom"); idle outline ("Mobile Photography", "Food Styling");
  dashed-blue-text chip "Add Skill +".
- RADIO row 2-col: ● "On-site" + caption "At your business" (selected) · ○ "Remote" +
  caption "Work from home".
- Divider; title2 "Budget & Timeline" + body "Define the compensation and deadlines.";
  2-col: "Budget (₹)" wallet 2500 · floating-label "Payment type" select "Fixed Price";
  2-col: "Deadline" calendar "24 Oct 2023" · "Duration" stopwatch "3 Days".
- Divider; title2 "Deliverables" + body "List exactly what the student must submit.";
  rows: DARK tick circle + body "15 High-res edited JPEG photos" + RED trash glyph right
  (2nd row cut off).
- Sticky bar: primary lg "Review & Publish".

## 2. Mapping gig create ✅ (title/description/budget/deadline/skillsRequired); category =
   NO gig column (§5 ⚠️ BusinessProfile.category only) → flag; payment type/duration/
   deliverables list = no columns → flag; save-draft = GigStatus? no DRAFT enum → flag.
## 3. Flags: category, paymentType, duration, deliverables, draft.
## 4. New: `FloatingLabelSelect`, editable deliverable list.
## 5. At build time.
