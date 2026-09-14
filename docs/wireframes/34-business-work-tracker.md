# 34 · Business Active Work Tracker

Route: shares `/tracker/[gigId]` with 17, business branch (or NEW — decide at build).

## 1. What the wireframe shows

- Header: back · title2 "Work Tracker" + caption "Instagram Content Pack".
- Card: 56dp initials circle "AR" + title3 "Arjun Reddy" + blue verified + caption "IIT
  Bombay • 3rd Year"; right MINT pill star "4.9".
- Card **"Project Status"** (title3): VERTICAL stepper, circles 32dp LEFT-aligned, labels
  under each: Assigned GREEN tick · Work Started GREEN tick · Submitted for Review BLUE RING
  (bold label) · Approved & Paid slate dot. (Vertical, no connectors.)
- Title1 "Deliverables" + caption "3 files submitted"; single card w/ 3 tight rows: GREEN
  tick · GREEN tick · OUTLINE circle: High-res Social Media Templates · Brand Style Guide
  (PDF) · Source Files (Figma/PSD).
- **Solid-ish blue-wash card**: blue doc glyph + title3 "V1 Submission"; 3-line body "I have
  completed the first set of templates based on the brand guidelines we discussed. Please
  let me know if any revisions are needed."; row: outline "Review Files" + blue text w/ chat
  glyph "Message Arjun".
- Sticky bar TWO flex buttons: GREEN "Request Revision" · BLUE "Approve & Pay".

## 2. Mapping status ✅; submission text = message/submission (verify); approve&pay =
   Payment create + status APPROVED/PAID ✅ (razorpay wired in gig/[id] today); request
   revision = status REVISION_REQUESTED ✅ (verify endpoint).
## 3. Flags: submission/files storage; vertical no-connector stepper variant.
## 4–5. At build time.
