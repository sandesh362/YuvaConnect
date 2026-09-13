# 17 · Active Work Tracker (student)

Route: NEW additive (`/tracker/[gigId]`).

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

## 3. Flags: deliverables model, revision notice source, chat deep-link exists ✅.
## 4. Stepper variant: horizontal WITHOUT connectors (differs from MilestoneStepper w/
   connectors) — add prop.
## 5. At build time.
