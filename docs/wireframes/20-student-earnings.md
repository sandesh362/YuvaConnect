# 20 · Student Earnings

Route: `/(student)/earnings` (rebuild in place).

## 1. What the wireframe shows

- Header: title1 "Earnings" + body "Track your income & growth"; gear icon right.
- **SOLID BLUE hero card** (radius 20): caption-bold white "Total Earnings" + wallet glyph
  top-right; display 40-extrabold white "₹42,850"; row: pill (white ~18% alpha) trend glyph +
  bold "+12.5%" + caption white "Since joining in Aug".
- Two StatCards: "This Month ₹12,400" · "Pending ₹3,200".
- Card **"Income Trend"** (title3): LINE+AREA chart, blue 2px line, 6 dots, light-blue area
  fill, x labels Jan…Jun caption slate. (No y axis, no gridlines.)
- Row: title2 "Recent Transactions" + blue "View All".
- Transaction rows (cards): 48dp mint circle w/ DARK tick · bold title · caption "Dec 12 •
  Chai Tapri Cafe" · right bold "+₹2,500"; amber circle w/ clock · "Logo Design v2" ·
  "In Review • TechNova Solutions" · right slate bold "₹1,800"; mint tick · "Data Entry
  Project" · "Dec 08 • Mittal Exports" · "+₹4,200".
- Tab bar: Home · Discover · My Gigs · **Earnings (ACTIVE blue filled wallet)** · Profile.

## 2. Mapping
/api/earnings ✅ (register). Trend %/month split = derive from payments; CHART = new
component (SVG via react-native-svg? not installed → check; else pure-View poly-line) →
flag/decide; pending = payments status ✅.

## 3. Flags: chart lib, +12.5% derivation.
## 4. New: `LineChart` (View-based, no new dep preferred).
## 5. At build time.
