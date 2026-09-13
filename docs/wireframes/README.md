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
| 2 | Global Search | — | ⬜ awaiting image |
| 3 | System States & Feedback | — | ⬜ awaiting image |
| 4 | Report & Support | — | ⬜ awaiting image |
| 5 | Messages & Trust Center | — | ⬜ awaiting image |
| 6 | Ratings & Reviews Flow | — | ⬜ awaiting image |
| 7 | Student Login / Signup | — | ⬜ awaiting image |
| 8 | Student Verification Flow | — | ⬜ awaiting image |
| 9 | Student Skill Selection | — | ⬜ awaiting image |
| 10 | Student Location & Availability | — | ⬜ awaiting image |
| 11 | Student Home Dashboard | — | ⬜ awaiting image |
| 12 | Discover Gigs | — | ⬜ awaiting image |
| 13 | Gig Filters (modal sheet) | — | ⬜ awaiting image |
| 14 | Gig Details View | — | ⬜ awaiting image |
| 15 | Apply for Gig (modal sheet) | — | ⬜ awaiting image |
| 16 | My Applications | — | ⬜ awaiting image |
| 17 | Active Work Tracker | — | ⬜ awaiting image |
| 18 | Deliverable Submission | — | ⬜ awaiting image |
| 19 | Revision Requested | — | ⬜ awaiting image |
| 20 | Student Earnings | — | ⬜ awaiting image |
| 21 | Student Notifications | — | ⬜ awaiting image |
| 22 | Saved Gigs | — | ⬜ awaiting image · ❌ no backend |
| 23 | Student Portfolio & Profile | — | ⬜ awaiting image |
| 24 | Student Reviews | — | ⬜ awaiting image |
| 25 | Business Login / Signup | — | ⬜ awaiting image |
| 26 | Business Verification | — | ⬜ awaiting image |
| 27 | Business Dashboard | — | ⬜ awaiting image |
| 28 | Post a New Gig | — | ⬜ awaiting image |
| 29 | Applicant Management | — | ⬜ awaiting image |
| 30 | Candidate Profile View | — | ⬜ awaiting image |
| 31 | Candidate Comparison | — | ⬜ awaiting image |
| 32 | Select Student Confirmation | — | ⬜ awaiting image |
| 33 | Business Gig Management | — | ⬜ awaiting image |
| 34 | Business Active Work Tracker | — | ⬜ awaiting image |
| 35 | Business Payments | — | ⬜ awaiting image |
| 36 | Business Notifications | — | ⬜ awaiting image |
| 37 | Saved Talent / Talent Pool | — | ⬜ awaiting image · ❌ no backend |

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
