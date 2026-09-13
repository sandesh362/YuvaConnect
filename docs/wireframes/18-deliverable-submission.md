# 18 · Deliverable Submission ("Submit Work")

Route: NEW additive (`/submit/[gigId]`).

## 1. What the wireframe shows

- Header: back · title2 "Submit Work" + caption "Social Media Content Pack".
- Card **"Deliverables Checklist"** (title3): rows w/ 24dp green filled ticks (2) then 24dp
  OUTLINE circles (2): 5 Instagram Post Designs · 3 Story Templates · Caption & Hashtag Doc
  · Source Files (PSD/Figma).
- Title2 "Upload Files"; TWO half-width washed tiles h≈110: LEFT indigo-wash + 1.5px BLUE
  border, cloud glyph + WASHED label "Upload Media"; RIGHT mint-wash + teal border, link
  glyph + washed "Add Link". (Washed labels = artifact → use primaryText/teal-700.)
- Label "Message to Business" + input "Explain what you've completed in this versi…".
- Primary lg w/ send glyph "Submit for Review"; divider.
- Row: title2 "Submission History" + right caption-bold "2 Versions".
- Version card: title3 "Version 2.0" + caption "Oct 24, 02:15 PM" + right AMBER solid bar
  (56×10 radius 2) as status swatch; nested card "Version 1.0" + "Oct 22, 11:30 AM" + RED
  bar; inside it a WASHED RED feedback card: chat glyph + bold "Feedback from Business" +
  body "The brand colors in the second post are slightly off. Please use the hex codes
  provided in the brand guidelines."
- Sticky bar (slate wash): DARK shield glyph + caption-bold "Your work is protected.
  Payments are released upon approval."

## 2. Mapping
submission create = check API (likely application status update or message; NO file upload
endpoint → flag: upload tiles render but cannot persist); version history = no model →
flag; feedback = revision message text ✅ maybe.

## 3. Flags: file upload, version history model, status swatch semantics.
## 4–5. At build time.
