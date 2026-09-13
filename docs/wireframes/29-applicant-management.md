# 29 · Applicant Management ("Manage Applicants")

Route: `/(business)/applicants/[gigId]` (rebuild in place).

## 1. What the wireframe shows

- Header: back chevron · title2 "Manage Applicants"; body lines "Create Instagram Content
  Pack" + bold-caption "₹2,500 • 12 Applicants".
- **MINT segmented control**: Applied (ACTIVE) · Shortlisted · Selected.
- Row: body "12 Candidates" + right blue bold w/ sort glyph "Best Match".
- **Candidate cards** (×4): 56dp initials circle (blue-100) + title3 name + blue verified
  check + caption college; row: MINT pill lightning "98% Match" + amber star "4.9" +
  briefcase caption "12 Gigs"; divider; 3-across actions: outline "Shortlist" · blue text w/
  chat glyph "Message" · SOLID BLUE "Select".
  (Arjun Mehta IIT Bombay 98/4.9/12 · Sneha Kapoor St. Xavier's 92/4.8/8 · Rohan Das NMIMS
  85/4.7/5 · Priya Sharma HR College 82/4.9/15.)
- Tab bar BUSINESS: Home · **Gigs (ACTIVE filled briefcase)** · Post · Messages · Profile.

## 2. Mapping applications for gig ✅; shortlist status ✅? (Application.status enum check);
   match % = matchScore NOT exposed → flag (hide pill); message → chat ✅; select → 32.
## 3. Flags: match %, shortlist status value.
## 4–5. At build time.
