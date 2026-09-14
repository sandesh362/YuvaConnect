# 05 · Messages & Trust Center

Route: `/(shared)/chat/[gigId]` exists (rebuild in place). Thread list = NEW additive
(`/messages`) — has NO wireframe, so it stays out of the 37; the Messages tab remains a
quiet no-op until a wireframe or a product decision defines it. Status: ✅ built — pending review.

## 1. What the wireframe shows

- **Header:** back · 40dp initials avatar (MS, indigo-500 fill, white initials) · bold name
  "Modern Solutions" + blue verified check · caption "Online" · kebab icon right.
- **Gig context bar** (washed slate-blue, inside header block): left column caption-bold
  "Social Media Content Pack" + bold "Budget: ₹4,500"; right OUTLINE pill button
  "View Tracker".
- **Thread:** centred caption "Today". Incoming bubble: slate-200 fill, radius 12 (tail corner
  sharper top-left), max-w ~70%, body slate-800, timestamp caption INSIDE bottom-left.
  Outgoing bubble: SOLID BLUE fill, white text, right-aligned, timestamp inside bottom-right.
- **Trust notice card** mid-thread: white, hairline border, blue shield glyph left + bold
  2-line copy "Keep payments and important communication within YuvaConnect to stay
  protected."
- **Composer bar** (white, top hairline): plus-circle icon · placeholder "Type your
  message..." · 48dp SOLID BLUE circle with white send glyph.
- **Quick-action rail** under composer: horizontal outlined chips with leading icons:
  image glyph "Share Portfolio" · clipboard glyph "View Deliverable" · wallet glyph
  "Request…" (clipped = "Request Payment").

## 2. Mapping
`Message` model + messages API ✅ (per register). "View Tracker" → work-tracker screen (17/34).
Quick actions: Share Portfolio → profile/portfolio; View Deliverable → submission screen;
Request Payment → flag if no endpoint.

## 3. Flags (resolved at build)
- Realtime: REST only → 15s poll (`refetchInterval`), documented in-code, never presented
  as live socket delivery.
- Presence "Online" + verified tick: NO backing fields → header subtitle shows the
  counterparty ROLE ("Business" / "Student") instead. Flagged, not faked.
- "Request Payment": no endpoint → explainer InfoBanner (approved flag pattern).
- "View Tracker" / "View Deliverable": screens 17/18 not shipped → visible, quiet no-ops
  (tab-bar rule).
- Kebab: no menu defined anywhere → routes to /support (report / help), a real destination.

## 4. Build
Rebuilt `src/app/(shared)/chat/[gigId].tsx` in place on the new system: custom header row
(back · initials avatar · name · role caption · kebab), washed gig context bar with
"View Tracker", day-grouped thread (Today / Yesterday / date) with incoming slate-200 and
outgoing solid-blue bubbles carrying the timestamp inside the bubble, the mid-thread trust
notice card, composer (plus-circle toggles the rail · input · 48dp blue send circle) and the
outlined quick-action rail (Share Portfolio → profile · View Deliverable → no-op ·
Request Payment → banner). No new components needed; bubbles are local to this screen
because nothing else in the 37 renders chat bubbles.

## 5. Deviations
1. Trust notice sits after the 4th message (deterministic) rather than at a hand-placed
   position in a mock thread.
2. Bubble corner radii: 4dp on the tail corner per side, as the export draws.
