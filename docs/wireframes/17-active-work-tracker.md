# 17 · Active Work Tracker (student)

Route: NEW additive (`/tracker/[gigId]`) — built as `src/app/(student)/tracker/[gigId].tsx`.
Status: ✅ built — pending review.

## 1. What the wireframe shows

- Header: back · CENTRED title2 "Work Tracker" + caption-bold "GIG-ID: #YUVA-8821" · help
  icon right.
- **Gig summary card**: 64dp indigo-100 rounded-16 tile w/ blue store glyph; title3 "Create
  Instagram Content Pack"; caption "Modern Bites Cafe" + blue verified check; divider;
  2-col: caption-bold "BUDGET" over title3 "₹2,500" · caption-bold "DEADLINE" over RED bold
  "24 Oct (2 days left)".
- Card **"Milestone Progress"** (title3): HORIZONTAL 5-step stepper, circles 36dp + caption
  labels under: Assigned = GREEN filled tick · Started = GREEN filled tick · Submitted =
  BLUE RING (white centre, blue border 4dp) bold label · Review = slate-200 circle w/ slate
  dot · Paid = same grey. NO connector lines in this export (labels carry the order).
- Section row: title2 "Deliverables Checklist" + right blue bold "2/3 Done".
- Card of **ChecklistItem rows**: green filled rounded-8 tick squares for done, outline
  square for pending: "Initial 5 concept sketches" · "Brand color palette & typography" ·
  "Final 10 high-res IG posts (PNG/MP4)".
- **Washed indigo notice row**: white info circle + body "Business requested a minor change
  in the second post color scheme." + right blue bold "Chat".
- Sticky bar: primary lg w/ upload glyph "Submit Final Work"; below outline lg w/ chat glyph
  "Message Business".

## 2. Mapping
gig + application ✅; status → stepper position via GigStatus enum ✅; deliverables checklist
= no column → flag (static per gig description? no → flag); revision notice = latest
revision message/flag; "2/3 Done" = client count.

## 3. Flags (resolved at build)
- Deliverables: no required-tasks column → the checklist lists REAL submitted Deliverable
  rows (tap opens the file via Linking); empty state is the honest flag, never an invented
  task list. "2/3 Done" becomes "N submitted".
- Revision notice = latest REAL RevisionRequest.feedback; Chat deep-links to the existing
  chat route ✅.
- Business verified tick omitted (field not in payload).
- "Submit Final Work" opens the real submitGig sheet here; screen 18 restyles this flow to
  its own wireframe. "Message Business" deep-links to the real chat.

## 4. Build
- Correction to the earlier note: `MilestoneStepper` + `ChecklistItem` ALREADY existed in
  `ui/Progress.tsx` (the gallery renders them). They gained a `connectors` prop — the
  student tracker export draws NO connector lines, so the screen passes
  `orientation="horizontal" connectors={false}`. Duplicate standalone components created
  mid-build were deleted; Progress.tsx remains the single source.
- Summary card (indigo tile + storefront glyph, budget, red deadline with derived
  "(N days left)"), OPEN-status explainer, sticky bar with the two wireframe buttons.
- Screens 5 and 16 "View Tracker"/"Open Tracker" buttons are now wired to this route.

## 5. Deviations
1. Deadline countdown is derived client-side from the real deadline date.
