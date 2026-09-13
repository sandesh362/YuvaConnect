# 03 · System States & Feedback

Reference set, not a product route — lives in the `/design-system` gallery (already ✅).
This spec records the exact wireframe variants so product screens reuse them verbatim.

## 1. What the wireframe shows

Header: title "System States" + caption "YuvaConnect feedback & lifecycle patterns".
Stacked reference cards on light ground:

1. **Success:** 72dp mint circle with DARK-NAVY filled tick; title2-bold "Application Sent!";
   centred body copy "Sandesh, your application for 'Social Media Manager' has been delivered
   to the business owner."; full-width primary button "View My Applications"; centred blue
   link "Back to Home".
2. **Loading:** row "Finding Nearby Gigs…" (body, slate-600) + 20dp blue spinner right;
   two full-width skeleton blocks (h≈110 and h≈90, radius 8, skeletonBase) + a third fainter.
3. **Empty:** 96dp light-slate circle with search-x glyph (dark navy); title3 "No Gigs in
   Mumbai"; centred body "We couldn't find any micro-gigs matching your current filters. Try
   expanding your radius."; full-width OUTLINE button "Adjust Filters".
4. **Error (compact row card, red hairline border):** 48dp red-50 rounded square w/ wifi-off
   glyph; bold "Connection Lost"; body "Check your internet and try again."; blue "Retry"
   link right.
5. **Info banner (washed in export → gradient per decision):** shield-check + bold
   "Verification in Progress" + "Our team is reviewing your Student ID. This usually takes
   24 hours."

## 2. Mapping
No backend dependency — pure reference set. Product screens must call these components and
never hand-roll a state.

## 4. Build (component corrections to match the wireframe exactly)

| Component | Correction |
|---|---|
| `SuccessState` | glyph is a **dark-navy filled check-circle on the mint well** (was green); new `secondaryAsLink` renders the secondary action as a bare text link ("Back to Home") |
| `EmptyState` | new `wellSize="lg"` = 96dp well; neutral glyph is **navy**, not light slate; new `primaryVariant="outline"` for outline actions ("Adjust Filters") |
| `ErrorState` (card) | **white ground + red hairline + 48dp square red-50 tile** (was a red wash with a circular well); Retry stays a blue text-style button |
| `InlineLoader` | new `align="split"` = label left, spinner right (wireframe loading block) |
| gallery §15 | now renders the five wireframe blocks with **verbatim copy** before the extra variants |

## 5. Deviations
1. The empty-state glyph in the export is a magnifier with a small ×; Ionicons has no
   search-with-x glyph, so `searchEmpty` (plain magnifier) is used in the navy colour.
2. Washed "Verification in Progress" banner → gradient `Banner` per the standing decision.
