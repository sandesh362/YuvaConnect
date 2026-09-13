# 35 · Business Payments ("Payment Details")

Route: NEW additive (`/payment/[id]`).

## 1. What the wireframe shows

- Header: back · title2 "Payment Details" · help icon right.
- **Hero card centred**: 72dp mint circle w/ DARK wallet glyph; title1 "Payment Released";
  caption-bold "Transaction ID: YC-98210452"; GREEN pill "COMPLETED".
- Title3 "Gig Summary"; card: 56dp PHOTO thumb radius 12 + title3 "Instagram Product Shoot" +
  caption "Assigned to Rohan Mehta" + right BLUE verified check.
- Title3 "Payment Breakdown"; card rows: body "Gig Amount" + right body "₹4,500.00";
  "Platform Fee (5%)" + RIGHT RED "- ₹225.00"; "GST (18% on fee)" + RED "- ₹40.50"; divider;
  "Total Payout" + RIGHT GREEN BOLD "₹4,234.50".
- Title3 "Transaction Timeline"; card rows w/ 28dp DARK-NAVY filled tick circles: "Work
  Approved" + caption "14 Oct, 2023 • 02:30 PM"; "Payment Released" + "14 Oct, 2023 • 04:15
  PM"; OUTLINE clock circle slate: "Settlement in Progress" + caption "Expected by 16 Oct".
- Outline full-width w/ download glyph "Download Invoice"; centred blue link "Back to
  Dashboard".

## 2. Mapping Payment ✅ amount/status/createdAt; fee+GST = CLIENT COMPUTE (5% + 18% of fee)
   — §5 ⚠️ not stored; invoice download = no endpoint → flag; photo thumb = gig has no image
   → flag (use BusinessIcon).
## 3. Flags: fee/GST storage, invoice PDF, gig image.
## 4–5. At build time.
