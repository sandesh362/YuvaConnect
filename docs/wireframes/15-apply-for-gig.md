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

## 3. Flags (resolved at build)
- Application schema is { proposal, relevantExperience, availability } only. Est. Days and
  Portfolio Links have NO columns → composed into the proposal as labelled lines
  ("Estimated days: …", "Portfolio: …") — same honest composition as screens 4/6.
- Step bar 2/5 is decorative semantics from the export (the real flow is one form); kept
  because the wireframe draws it, flagged here.
- "Applying as Verified Student" uses the REAL StudentProfile.isVerified — falls back to
  "Applying as Student" when unverified.

## 4. Build
- `Sheet` gained `leftIcon` ('close' | 'arrowBack') and `onInfo` (right info action).
- The apply sheet on `/gig/[id]` rebuilt to the wireframe: washed gig strip (title ·
  storefront + business · blue price), StepProgress 2/5, "Your Proposal" intro, the four
  labelled fields incl. the two-column Availability / Est. Days row, Portfolio Links, the
  protected-application info card, and the sticky footer ("Applying as …" + shield + name
  over the full-width Submit Application button).

## 5. Deviations
1. Info icon tap raises the protection copy as a notice (the sheet already shows it in the
   white card; the icon adds the same text on demand).
