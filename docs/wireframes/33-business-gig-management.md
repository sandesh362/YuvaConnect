# 33 · Business Gig Management ("Manage Gigs")

Route: `/(business)/my-gigs` (+ `gig/[id]`) rebuild in place.

## 1. What the wireframe shows

- Header: title1 "Manage Gigs" + body "Track and manage your posted opportunities"; 48dp
  white circle bell right.
- 3 StatCards: blue briefcase "3 / Active" · indigo people "24 / Applicants" · GREEN wallet
  "₹8.5k / Spent" (compact ₹ format).
- **MINT segmented control**: Active (ACTIVE) · Drafts · Completed.
- **Gig cards**: title2 2-line + right status pill (mint "ACTIVE" / light-blue "IN
  PROGRESS"); caption row archive glyph + bold-caption "E-commerce • Photography"; divider;
  2-col caption-bold headers APPLICANTS | BUDGET with values: blue people + body "12
  Students" | title3 "₹3,500"; actions row: SOLID BLUE flex "View Applicants" + 48dp slate
  square pencil + 48dp AMBER square white pause glyph.
- Card 2 (IN PROGRESS): caption "Marketing • 2 weeks left"; INNER washed card: 48dp SOLID
  BLUE initials circle "AS" white + bold "Arjun Sharma" + caption "IIT Bombay • 3rd Year" +
  right BLUE filled chat glyph; actions: outline flex "Track Progress" + GREEN flex
  "Message".
- Card 3 partial: slate tile ? glyph + "Data Entry for Inventory Audit" + blue "Finish…".
- **Full-width blue bar button** at very bottom (edge-to-edge, no margin): "+ Post New Gig".

## 2. Mapping my gigs ✅; statuses ✅; assigned student inner card = application w/ status
   ASSIGNED/IN_PROGRESS ✅; pause/edit = no endpoints? verify (edit = update gig ✅ maybe;
   pause ❌); spent = payments ✅.
## 3. Flags: pause/close gig, drafts segment (no DRAFT status).
## 4–5. At build time.
