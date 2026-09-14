# 32 · Select Student Confirmation ("Confirm Selection")

Route: NEW additive (`/assign/[applicationId]`).

## 1. What the wireframe shows

- Header: back · title2 "Confirm Selection".
- Card: 64dp initials circle "SR" + title1 "Siddharth Rao"; caption row grad-cap glyph +
  "IIT Bombay • 3rd Year"; caption row star glyph + bold "4.9 (12 gigs completed)".
- Card: overline "GIG SUMMARY"; title2 "E-commerce Product Photography"; divider; 2×2
  caption-bold/value: BUDGET ₹4,500 · DEADLINE "24 Oct, 2023" · LOCATION "Powai, Mumbai" ·
  TYPE "On-site".
- Overline "DELIVERABLES"; card w/ 3 rows of 24dp OUTLINE ROUNDED-SQUARE checkboxes: "50
  High-res product shots" · "Basic color correction" · "Raw files delivery".
- Washed banner: shield glyph + bold "Protected Payment" + body "Funds are held securely by
  YuvaConnect and only released after you approve the work." (→ gradient Banner).
- Sticky bar: row body "Total to Deposit" + right title1 bold "₹4,500"; primary lg "Assign
  Gig"; centred blue link "Cancel".

## 2. Mapping assign = application select / gig status ASSIGNED ✅ (verify endpoint);
   deposit/payment create ✅? (Payment model exists); deliverables checklist = no column →
   flag; "gigs completed" count = derive.
## 3. Flags: deliverables, escrow semantics (Payment status flow), completed count.
## 4–5. At build time.
