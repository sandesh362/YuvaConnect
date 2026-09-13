# 06 · Ratings & Reviews Flow

Route: NEW additive (`/rate/[gigId]`); read-side reviews live on screens 24/34.
`rating-modal.tsx` exists legacy — replaced by this screen per wireframe.

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

## 3. Flags
- Review tag chips: no backend field → flag (omit from payload, or join into comment text).
- Navy star colour on input vs amber on display = deliberate in exports; keep as shown.

## 4–5. At build time.
