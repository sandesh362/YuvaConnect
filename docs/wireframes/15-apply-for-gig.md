# 15 · Apply for Gig — MODAL BOTTOM SHEET over gig/[id] (decision 4, no route)

## 1. What the wireframe shows

- Sheet header: back arrow · title2 "Apply for Gig" · info icon right.
- **Washed indigo gig strip card**: title3 "Social Media Content Pack"; caption row building
  glyph + "Aman's Gourmet Cafe"; right blue price title3 "₹4,500".
- **5-segment step bar (2 filled)** under the strip.
- Title1 "Your Proposal" + body "Tell the business why you are the best fit".
- Label "Why are you a good fit?" + textarea "Mention your specific approach to this gig...".
- Label "Relevant Experience" + input "Have you done similar work before?".
- Two-col: "Availability" clock glyph "e.g. Evenings" · "Est. Days" stopwatch glyph
  "e.g. 3 days".
- Label "Portfolio Links" + link glyph "Behance, GitHub, or Drive link".
- White info card: DARK help-circle glyph + body "Your application is protected. We never
  share your private contact details until you are selected."
- Sticky bar: top row caption-bold "Applying as Verified Student" left + right shield-check
  blue + bold "Sandesh Kumar"; full-width primary "Submit Application".

## 2. Mapping
application create ✅ (applications API); cover-letter field name per API (verify:
`message`/`coverLetter`); availability/est-days/portfolio links → check Application schema,
likely absent → flag; verified strip = user.isVerified + name ✅.

## 3. Flags: extra proposal fields vs Application schema; step-bar semantics (2/5).
## 4. Uses `StepProgress` + `Sheet`.
## 5. At build time.
