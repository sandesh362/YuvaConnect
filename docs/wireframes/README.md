# Wireframe specs — extracted from the FlutterFlow exports

The 37 wireframe PNGs are the **literal spec** for this rebuild. They are *not* committed
(project decision: images stay on disk, only these extracted specs go into git — see
`.gitignore`). Each file below is written the moment the corresponding image is seen, so
the specification survives even if the images or the working context do not.

**Convention — one file per wireframe, numbered in the agreed build order:**

```
NN-screen-name.md
```

Every file has the same five sections, which mirror the per-screen process the rebuild
follows:

| Section | Contents |
|---|---|
| 1. What the wireframe shows | Literal visual description: ground colour, chrome, every block top→bottom, sizes, type weights, radii, gaps, component states (selected / unselected / disabled / empty) |
| 2. Mapping to live app data | Each element → the real route, `src/lib/*-api.ts` call, or Prisma field that powers it |
| 3. Flags | Elements with **no backend equivalent** — flagged, never faked (cross-referenced to `../DESIGN_SYSTEM.md` §5) |
| 4. Build | Files added/changed, new components, new tokens |
| 5. Deviations | Anything deliberately not matching the PNG, with the reason |

Build order and status live in `../DESIGN_SYSTEM.md` §9.

## Index

| # | Wireframe | Spec | Status |
|---|---|---|---|
| 1 | Role Selection & Onboarding | [`01-role-selection.md`](./01-role-selection.md) | ✅ built (`/role`) |
| 2 | Global Search | [`02-global-search.md`](./02-global-search.md) | ✅ built (`/search`) — pending review |
| 3 | System States & Feedback | [`03-system-states.md`](./03-system-states.md) | ✅ built (gallery §15) — pending review |
| 4 | Report & Support | [`04-report-support.md`](./04-report-support.md) | ✅ built (`/support`) — pending review |
| 5 | Messages & Trust Center | [`05-messages-trust.md`](./05-messages-trust.md) | ✅ built (chat route) — pending review |
| 6 | Ratings & Reviews Flow | [`06-ratings-reviews.md`](./06-ratings-reviews.md) | ✅ built (`/rate/[gigId]`) — pending review |
| 7 | Student Login / Signup | [`07-student-login-signup.md`](./07-student-login-signup.md) | ✅ built (login+signup) — pending review |
| 8 | Student Verification Flow | [`08-student-verification.md`](./08-student-verification.md) | ✅ built (`/verify`) — pending review |
| 9 | Student Skill Selection | [`09-student-skill-selection.md`](./09-student-skill-selection.md) | ✅ built (`/skills`) — pending review |
| 10 | Student Location & Availability | [`10-location-availability.md`](./10-location-availability.md) | 📝 spec extracted · ⬜ not built |
| 11 | Student Home Dashboard | [`11-student-home.md`](./11-student-home.md) | 📝 spec extracted · ⬜ not built |
| 12 | Discover Gigs | [`12-discover-gigs.md`](./12-discover-gigs.md) | 📝 spec extracted · ⬜ not built |
| 13 | Gig Filters (modal sheet) | [`13-gig-filters.md`](./13-gig-filters.md) | 📝 spec extracted · ⬜ not built |
| 14 | Gig Details View | [`14-gig-details.md`](./14-gig-details.md) | 📝 spec extracted · ⬜ not built |
| 15 | Apply for Gig (modal sheet) | [`15-apply-for-gig.md`](./15-apply-for-gig.md) | 📝 spec extracted · ⬜ not built |
| 16 | My Applications | [`16-my-applications.md`](./16-my-applications.md) | 📝 spec extracted · ⬜ not built |
| 17 | Active Work Tracker | [`17-active-work-tracker.md`](./17-active-work-tracker.md) | 📝 spec extracted · ⬜ not built |
| 18 | Deliverable Submission | [`18-deliverable-submission.md`](./18-deliverable-submission.md) | 📝 spec extracted · ⬜ not built |
| 19 | Revision Requested | [`19-revision-requested.md`](./19-revision-requested.md) | 📝 spec extracted · ⬜ not built |
| 20 | Student Earnings | [`20-student-earnings.md`](./20-student-earnings.md) | 📝 spec extracted · ⬜ not built |
| 21 | Student Notifications | [`21-student-notifications.md`](./21-student-notifications.md) | 📝 spec extracted · ⬜ not built |
| 22 | Saved Gigs | [`22-saved-gigs.md`](./22-saved-gigs.md) | 📝 spec extracted · ⬜ not built · ❌ no backend |
| 23 | Student Portfolio & Profile | [`23-student-profile.md`](./23-student-profile.md) | 📝 spec extracted · ⬜ not built |
| 24 | Student Reviews | [`24-student-reviews.md`](./24-student-reviews.md) | 📝 spec extracted · ⬜ not built |
| 25 | Business Login / Signup | [`25-business-login.md`](./25-business-login.md) | 📝 spec extracted · ⬜ not built |
| 26 | Business Verification | [`26-business-verification.md`](./26-business-verification.md) | 📝 spec extracted · ⬜ not built |
| 27 | Business Dashboard | [`27-business-dashboard.md`](./27-business-dashboard.md) | 📝 spec extracted · ⬜ not built |
| 28 | Post a New Gig | [`28-post-a-gig.md`](./28-post-a-gig.md) | 📝 spec extracted · ⬜ not built |
| 29 | Applicant Management | [`29-applicant-management.md`](./29-applicant-management.md) | 📝 spec extracted · ⬜ not built |
| 30 | Candidate Profile View | [`30-candidate-profile.md`](./30-candidate-profile.md) | 📝 spec extracted · ⬜ not built |
| 31 | Candidate Comparison | [`31-candidate-comparison.md`](./31-candidate-comparison.md) | 📝 spec extracted · ⬜ not built |
| 32 | Select Student Confirmation | [`32-confirm-selection.md`](./32-confirm-selection.md) | 📝 spec extracted · ⬜ not built |
| 33 | Business Gig Management | [`33-business-gig-management.md`](./33-business-gig-management.md) | 📝 spec extracted · ⬜ not built |
| 34 | Business Active Work Tracker | [`34-business-work-tracker.md`](./34-business-work-tracker.md) | 📝 spec extracted · ⬜ not built |
| 35 | Business Payments | [`35-business-payments.md`](./35-business-payments.md) | 📝 spec extracted · ⬜ not built |
| 36 | Business Notifications | [`36-business-notifications.md`](./36-business-notifications.md) | 📝 spec extracted · ⬜ not built |
| 37 | Saved Talent / Talent Pool | [`37-saved-talent.md`](./37-saved-talent.md) | 📝 spec extracted · ⬜ not built · ❌ no backend |

## Cross-screen design language (applies to every file above)

Captured once so it is not re-derived per screen:

- **Brand blue `#2563EB`** (blue-600) — confirmed over the `#208AEF` used by the splash/legacy UI.
- **Tab bar:** active tab = blue **filled** glyph + blue label; inactive = dark slate outline glyph + slate label. Rendered inside each screen (`BottomTabBar`), navigating with `router.replace` to existing paths — no `(tabs)/` group, so no URL changes.
- **SegmentedControl has two distinct styles in the exports:**
  1. active segment = soft **mint** pill (≈`#C3E4D8`) with dark slate text — used on Manage Applicants, Manage Gigs, Business Login;
  2. a check-mark + outlined pill rail — used on My Applications, Notifications.
  Neither is the solid-blue active state the current `SegmentedControl` renders, so it needs both variants before those screens are built.
- **Banners:** where the export shows white text on a washed `#D9E6FB` fill (≈1.6:1 contrast — Role Selection trust banner, Confirm-Selection "Protected Payment", System-States "Verification in Progress"), the *same* component renders solid blue→indigo with white text on Student Home and Discover Gigs. Treated as a design-export opacity artifact: **all of them use the gradient `Banner`** (approved).
- **Glyphs:** business = briefcase; the YuvaConnect logo = network hub (`git-network`); student = mortarboard (`school`).
- **Step progress:** Apply for Gig, Business Verification and Student Skill Selection share a **5-segment blue step bar** — needs a new `StepProgress` component before those screens.
- **Money:** the wireframe payment breakdown shows a **5% platform fee plus 18% GST on the fee**. `Payment` stores only `amount` + `status`, so this is computed client-side for display (flagged, §5 of the design system).
- **Known export bug:** the Talent Pool card renders a literal `$rating` placeholder — real `avgRating` is rendered instead.
