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

## 2–5. Mapping / flags / build / deviations
All five are implemented as `SuccessState`, `LoadingSkeleton`/`Skeleton`, `EmptyState`,
`ErrorState`, `Banner`/`InfoBanner` in `src/components/ui/`. Product screens must call these,
never hand-roll a state. No backend dependency.
