# 20 · Student Earnings

Route: `/(student)/earnings` (rebuilt in place). Status: ✅ built — pending review.

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

## 3. Flags (resolved at build)
- Chart: NEW `LineChart` ui component — dependency-free View-based (soft skyline columns
  as the area fill, rotated 2dp segments, 8dp dots, caption labels; no axes/gridlines,
  per the export). `npx expo install react-native-svg` is TLS-broken in this environment
  and the spec preferred no new dep anyway.
- +N% pill = client-derived (last 30 days vs previous 30 over REAL payments); hidden when
  there isn't two-period history. "Since joining in {month}" = first real payout month.
- Pending card: endpoint returns RELEASED only → shows "—" with a flag hint, never a
  made-up number. Transaction captions: business name not in payload → real date only.
- Gear icon omitted (no settings destination).

## 4. Build
Rebuilt on the new system: solid-blue hero (white Total + wallet glyph + 18%-alpha trend
pill), This Month / Pending StatBox pair, Income Trend card with monthly-bucketed real
payments (last ≤6 months), Recent Transactions with mint tick wells + "+₹N" and a real
View All toggle (3 ↔ all). Tab bar uses the earnings per-export variant (Messages slot →
Earnings wallet) and tab-nav gained `earnings → /(student)/earnings`.

## 5. Deviations
1. Area fill is a stepped skyline (no SVG in the environment) — reads as the export's soft
   fill at chart scale.
2. Amber "In Review" transaction row can't render: pending payments aren't exposed.
