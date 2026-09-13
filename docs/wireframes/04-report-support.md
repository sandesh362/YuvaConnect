# 04 · Report & Support

Route: `/(shared)/report/[gigId]` exists; the support hub is NEW additive (`/support`).

## 1. What the wireframe shows

- Header: back · title "Support & Help" + caption "We're here to help you" · info icon right.
- Washed banner: shield glyph + "Your safety is our priority. Most issues are resolved within
  24 hours." (→ gradient Banner per decision).
- "Select Category" heading. **2×2 grid of tall selectable cards** (h≈190, radius 12): icon
  top-left + label under it. Report User = red person-off glyph, slate label · **selected
  "Payment Issue"** = blue wallet glyph, BLUE label, 1.5px blue border · Verification = teal
  shield-check · Other = slate help-square. Unselected = white + hairline border.
- "Reason" label + input placeholder "e.g. Payment not received for Gig #421".
- "Description" label + input placeholder "Please provide as much detail as possible...".
- "Attachments (Optional)" label + half-width upload tile: blue cloud-upload glyph, body
  "Upload Screenshots or Documents", overline caption "Max 5MB • JPG, PNG, PDF".
- "Frequently Asked Questions" heading + accordion card: expanded row "How do I release a
  payment?" (minus icon) with body "Once the student submits the final deliverables and you
  approve them, the 'Pay' button will become active in your Work Tracker."; collapsed rows
  "What if the work is not satisfactory?" (+) and "Verification taking too long?" (+).
- Sticky bar: full-width primary "Submit Ticket" with send icon.

## 2. Mapping
`Report` model + reports API exist (per §5 register ✅). Category/reason/description map to a
report creation call; attachments = NO upload endpoint → flag (tile renders, non-functional
or hidden). FAQ = static local copy.

## 3. Flags
- Attachment upload: no file-upload endpoint in live API → flag, render tile disabled or hide.
- Accordion component does not exist yet → new `Accordion` ui component.

## 4–5. At build time.
