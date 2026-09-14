# 19 · Revision Requested

Route: NEW additive (`/revision/[gigId]`) — built as `src/app/(student)/revision/[gigId].tsx`
(the wireframe is a distinct screen, so it got its own route; the tracker's revision notice
now deep-links here). Status: ✅ built — pending review.

## 1. What the wireframe shows

- Header: back · title2 "Revision Requested" + caption-bold "Gig #YC-8821".
- **AMBER washed banner** (radius 12): dark edit-off glyph left + bold "Action Required" +
  body "The business has requested changes to your last submission."
- Card: 48dp initials circle "RK" + bold "Rajesh Kumar" + caption-bold "Owner, Kumar
  Graphics" + right amber pill "Pending"; divider; caption-bold "Business Feedback"; 5-line
  body paragraph (hex #2563EB mentioned); washed slate row: RED alarm glyph + caption "Revised
  deadline:" + RED bold "Tomorrow, 06:00 PM".
- Title1 "Required Changes" + body "Complete these to resubmit".
- **Checklist card with hairline-separated rows**: 24dp outline circle + body + caption sub
  ("Update primary blue to #2563EB" / "Check slide 1, 2, and 5") · ("Increase font size on
  Slide 3" / "Minimum 24pt for headlines") · BLUE filled tick + "Fix alignment on footer
  logo" (no sub).
- Title3 "Previous Submission"; file row card: 56dp slate tile w/ image glyph + bold
  "instagram_carousel_v1.pdf" + caption "2.4 MB • Submitted 2 days ago" + right BLUE eye
  glyph.
- Sticky bar: primary lg w/ upload glyph "Submit Revised Work"; centred text link w/ chat
  glyph "Message Rajesh".

## 2. Mapping
revision feedback text = message/revision endpoint? (verify); required-changes checklist =
no model → flag (parse from feedback? no — flag); revised deadline = no column → flag;
previous file = no upload store → flag.

## 3. Flags (resolved at build)
- Feedback card = REAL latest RevisionRequest (text + requestedAt); amber "Pending" pill
  derives from the real gig.status.
- Previous Submission = REAL latest Deliverable (FileRow; tap opens the file). File size is
  not stored → meta shows the real submitted timestamp instead of a fake "2.4 MB".
- Required-changes task list: NO model → honest flag card pointing at the feedback text;
  tasks never parsed or invented.
- Revised deadline: NO column → row shows the REAL gig deadline + explainer caption.
- "Owner, {business}" caption: business-title field doesn't exist → composed from the real
  business name.

## 4. Build
New route; tracker revision row became a Pressable deep-linking here. Sticky bar:
"Submit Revised Work" → /submit/[gigId] (screen 18) + "Message {first name}" TextLink →
chat (both real destinations).

## 5. Deviations
1. Eye glyph on the file row → whole-row tap opens the file (FileRow's interaction model).
2. Checklist card replaced by the flag card (see §3) — omission over invention.
