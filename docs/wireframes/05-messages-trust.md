# 05 · Messages & Trust Center

Route: `/(shared)/chat/[gigId]` exists (rebuild in place). Thread list = NEW additive
(`/messages`).

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

## 3. Flags
- Real-time delivery: API is REST poll — no socket; flag (poll interval, not fake realtime).
- "Request Payment" quick action: needs a payment-request endpoint → flag or hide.

## 4–5. At build time.
