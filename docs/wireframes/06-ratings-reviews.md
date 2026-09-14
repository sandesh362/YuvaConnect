# 06 · Ratings & Reviews Flow

Route: NEW additive (`/rate/[gigId]`) — built as `src/app/(shared)/rate/[gigId].tsx`.
Read-side reviews live on screens 24/34. `rating-modal.tsx` remains legacy until those
screens replace it. Status: ✅ built — pending review.

## 1. What the wireframe shows

- **Header (sheet-like):** X close left · title "Rate Experience" + caption "Gig ID: #YC-8821".
- **Hero:** centred 96dp mint circle with DARK-NAVY filled tick; title1 "Gig Completed!"
  centred; centred body "You've successfully finished the Instagram Content Pack for Brew &
  Bean Cafe."
- **Rating card:** centred heading "How was your experience with"; row: 48dp mint initials
  circle "BB" + bold "Brew & Bean Cafe" + caption w/ pin "Indiranagar, Bengaluru"; **5 large
  40dp stars, dark-NAVY fill (4 filled + 1 outline)** — note: stars are navy here, amber on
  read-side screens; divider; left label "What went well?"; tag chips: SELECTED = indigo-100
  wash + blue check + blue label ("Reliable", "High Quality"); idle = white outline ("On
  Time", "Good Communication", "Professional"); "Additional Feedback" label + textarea
  "Tell us more about your experience..." + helper caption "Your review helps the YuvaConnect
  community."
- **Payout strip** (indigo-100 wash card): caption-bold "Earnings Released" + statValue
  "₹2,500.00" left; green pill "PAID" right.
- **Sticky bar:** full-width primary "Submit Review".

## 2. Mapping
`Rating` model + POST rating ✅ (register). Tags ("what went well") have NO column → flag
(client-only or drop). Payout strip from Payment of the gig ✅ amount; "PAID" from status.

## 3. Flags (resolved at build)
- Tags: composed into the comment as a leading "Went well: …" line (same honest
  composition as screen 4); structured tag column owed by backend.
- Server rules surfaced client-side: rating only on APPROVED/PAID/CLOSED gigs (warning
  banner otherwise), one rating per gig (getMyRating prefills + disables submit).
- Payout strip renders ONLY the gig's real Payment row; hidden when absent.

## 4. Build
- `src/app/(shared)/rate/[gigId].tsx` — new route `/rate/[gigId]`.
- `RatingStars` / `RatingInput` gained `starColor` / `emptyColor` overrides: the wireframe's
  review stars are NAVY on input and in review blocks, amber only on the small rating pills.
- `SelectableChip` gained `selectedStyle="soft"`: primary-50 wash + blue check + blue label —
  the review-tag skin, also needed by Post-a-Gig's required-skill chips (screen 28).
- Hero reuses the corrected `SuccessState` (navy tick on mint well).

## 5. Deviations
1. Counterparty caption uses the gig's `location` (the API has no business address on the
   gig payload) instead of a separate business-city field.
2. "₹2,500.00" formatting appends ".00" to the stored decimal for display parity.
