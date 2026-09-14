# 31 · Candidate Comparison ("Applicants" compare mode)

Route: NEW additive (`/compare/[gigId]`) or mode of 29 — wireframe is its own screen.

## 1. What the wireframe shows

- Header: back · title2 "Applicants" + caption "Logo Design for Chai Point" · sliders icon
  right.
- 3 StatCards: people "12 / Total" · star "88% / Avg. Match" · stopwatch "2.4y / Avg. Exp".
- **Candidate card + action row pairs**: card = same as 29 (match pill/star/gigs, divider,
  Shortlist/Message/Select); BELOW each card a 2-across row: SOLID BLUE "Shortlist" +
  outline "Reject". ×4 (Arjun Mehta 96 · Priya Sharma 89 · Rohan Das 82 · Ananya Iyer 91).
- Sticky bar: left column bold "2 Shortlisted" + caption "Reviewing finalized candidates";
  right GREEN button w/ shuffle glyph "Compare Finalists".

## 2. Mapping = 29 + reject status (verify enum); avg match/exp = client over matchScore
   (❌ not exposed) → flag.
## 3. Flags: match %, experience years (no column), reject endpoint.
## 4–5. At build time.
