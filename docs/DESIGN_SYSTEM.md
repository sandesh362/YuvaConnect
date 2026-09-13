# YuvaConnect — Design System (Phase 7, STEP 1)

Status: **STEP 1 signed off** (tokens + components + gallery, live at `/design-system`) and the dead prototype deleted (§8).
**STEP 2 in progress** — screens are rebuilt one at a time against the 37 wireframes; progress in §9.

```
src/theme/            ← tokens (single source of truth)
src/components/ui/    ← base components (the only styled primitives screens may use)
src/app/design-system.tsx  ← live gallery, delete after sign-off
```

---

## 1. What was found in the repo before starting

Three things that materially affect this work:

| Finding | Impact | Action taken |
|---|---|---|
| `src/components/*.tsx` (17 NativeWind components) + `src/screens/*` + `src/navigation/*` + `src/state/DemoContext.tsx` + `src/api/*` + `src/mockData/*` imported **`lucide-react-native`** and **`@react-navigation/bottom-tabs`** — neither in `package.json` nor `package-lock.json` | That whole prototype **could not compile**: 25+ `TS2307 Cannot find module` errors | **Deleted** (approved). 51 files, 4,225 lines. Installed `expo-linear-gradient@57.0.2` because gradient banners are in the spec. See §8 |
| `package.json` `main` is `expo-router/entry`, so **`src/app/` is the real app**. `App.tsx` + `index.ts` (which mount `src/navigation/RootNavigator`) are dead code. | The presentation rebuild must happen in `src/app/`, against the live Prisma API in `src/lib/*-api.ts` + `src/types/api.ts`. | Confirmed. STEP 2 targets `src/app/`. |
| `src/components/ui.tsx` (a file) and `src/components/ui/collapsible.tsx` (a directory) both resolved from `@/components/ui` | Ambiguous module resolution sitting directly on top of the folder the new design system needs. | `git mv src/components/ui.tsx → src/components/legacy-ui.tsx`, 20 import sites updated mechanically. Zero behaviour change. |

Styling approach for the new system is **StyleSheet + tokens**, not NativeWind:

- `src/theme/` stays the single source of truth — no palette duplicated into `tailwind.config.js`.
- Exact wireframe spacing/elevation needs `boxShadow`, which Tailwind classes cannot express per-platform.
- The live `src/app/` screens are already StyleSheet, so this removes a styling system rather than adding one.

---

## 2. Tokens — `src/theme/`

### `colors.ts`
Raw ramps (`blue`, `indigo`, `slate`, `emerald`, `amber`, `red`, `violet`, `cyan`) plus the **`color.*` semantic aliases that components consume**. No component may hardcode a hex value.

| Group | Tokens |
|---|---|
| Brand | `primary #2563EB`, `primaryPressed`, `primarySoft`, `primarySoftPressed`, `primaryBorder`, `primaryText`, `primaryOnSolid` |
| Surfaces | `background #F8FAFC` (app ground), `surface #FFFFFF` (card), `surfaceMuted`, `surfaceSubtle` |
| Lines | `borderSubtle`, `border`, `borderStrong`, `divider` |
| Text | `textPrimary`, `textSecondary`, `textTertiary`, `textDisabled`, `textInverse`, `textLink` |
| Status | `success/warning/danger/info/accent` × `{base, strong, soft, border}` |
| Icon | `iconDefault`, `iconMuted`, `iconOnPrimary` |
| Misc | `overlay`, `pressedOverlay`, `skeletonBase`, `skeletonSheen`, `star`, `starEmpty` |

Helpers: `avatarTint(seed)` and `initialsOf(name)` — the API stores **no** avatar colour or initials, so both are derived deterministically from the name and stay stable across screens. `tint(hex, alpha)` for icon wells.

> **Two blues exist in the repo.** `app.json` splash + the legacy `ui.tsx` use `#208AEF`; every prior design-system component uses `#2563EB`. This system standardises on **`#2563EB`** (blue-600) because it has a complete ramp for pressed/soft/border states. Say the word if the splash blue is the intended brand colour and it is a one-line change in `colors.ts`.

### `typography.ts`
18 variants, each a complete `TextStyle` (size / lineHeight / weight / tracking / family):

`display 32/40 800` · `title1 28/34 800` · `title2 24/30 700` · `title3 20/26 700` · `heading 18/24 600` · `price 20/26 800` · `statValue 16/20 700` · `body 15/22 400` · `bodyStrong` · `callout 14/20 400` · `calloutStrong` · `label 13/18 600` · `caption 12/16 500` · `captionStrong` · `overline 10/14 700 +0.8` · `button 16/20 700` · `buttonSm 14/18 700`

No custom font file ships with the app, so `family.*` resolves to the platform system face. Swap `family.regular`/`family.medium` in one place if the wireframes specify a typeface.

### `spacing.ts`
`space` — 4pt grid: `none 0 · 2xs 2 · xs 4 · sm 8 · md 12 · base 16 · lg 20 · xl 24 · 2xl 32 · 3xl 40 · 4xl 48 · 5xl 64`

`layout` — fixed chrome: `screenGutter 16 · cardPadding 16 · cardPaddingCompact 12 · sectionGap 20 · itemGap 12 · headerHeight 56 · tabBarHeight 60 · actionBarHeight 72 · tapTarget 44 · gigIconSize 44 · avatarXs…avatarXl 24/32/40/56/80 · statIconSize 34 · controlSm/Md/Lg 36/44/52 · maxContentWidth 640`

### `radius.ts`
`radius` — `xs 4 · sm 8 · md 12 · lg 16 · xl 20 · 2xl 24 · full 999`
`shadow` — `none · sm · md · lg (upward, for sticky bars) · xl · primary (blue CTA glow) · focus · pressed`

> Elevation uses the RN 0.76+ cross-platform **`boxShadow`** prop. `shadowColor` / `shadowOffset` / `shadowOpacity` / `shadowRadius` / Android `elevation` are **deprecated on SDK 57 / RN 0.86** and emit runtime warnings — they must not be reintroduced. The first build of this system used them and Metro logged 4 deprecation warnings; all were removed.

### `gradients.ts`
`gradient` — `brand` (blue-600 → indigo-500, the default banner), `brandDeep`, `brandSoft`, `success`, `warning`, `danger`, `accent`, `neutral`. Plus `gradientForeground` / `gradientForegroundMuted` for text on gradients.

Gradients are reserved for **banners and hero surfaces only**. Everything else is flat.

### `icons.ts`
One icon family — **Ionicons via `@expo/vector-icons`**, already bundled with Expo (confirmed: `@expo/vector-icons@15.1.1` in `package.json`, no new native dependency). **130 semantic names** mapped to glyphs; every glyph was validated against the shipped Ionicons glyphmap (0 missing).

Screens ask for `icon="mapPin"`, never `"location-outline"`. Filled/outline pairs exist for every tab-bar and toggleable icon so the active state can swap weight, not just colour.

---

## 3. Components — `src/components/ui/`

```ts
import { GigCard, StatGrid, PrimaryButton, ScreenHeader } from '@/components/ui';
```

| Component | Spec pattern it implements |
|---|---|
| `Text` | Every string goes through it — `variant` + `tone`, so type and colour cannot drift between screens |
| `Icon`, `IconButton`, `iconName` | The only icon API; `IconButton` guarantees a 44px tap target and supports the unread dot |
| `Card`, `PressableCard`, `Divider` | White surface, radius 16, hairline `borderSubtle`, `shadow.sm`, 16px padding. `elevation="flat\|raised\|borderless\|sticky"`, `tone="surface\|muted\|…Soft"` |
| `Button`, `PrimaryButton`, `SecondaryButton`, `SoftButton`, `GhostButton`, `DangerButton` | Filled blue = the one primary action; outline blue = secondary. `label, onPress, variant, size ('sm'\|'md'\|'lg'), icon, iconRight, loading, disabled, fullWidth (default true)`. Aliases exist so the hierarchy on a screen reads explicitly at the call site |
| `TextLink` | `label, onPress, iconRight (default 'chevronRight', pass `null` for a bare word), tone ('brand'\|'secondary'\|'danger'), style` |
| `ScreenHeader`, `DashboardHeader`, `InlineBackBar` | Back arrow (left) · title [+ subtitle] · contextual right icons (bookmark / share / bell) with unread count bubbles |
| `Screen`, `ScrollScreen`, `BottomActionBar`, `SectionHeader` | Page scaffold: safe-area, correct ground colour, 16px gutter, tab-bar-aware bottom padding, 640px cap on tablet/web |
| `BottomTabBar`, `STUDENT_TABS`, `BUSINESS_TABS` | Icon + label, 5 items, active tab in primary blue with the **filled glyph swap** and a 24px top indicator; badge counts and dots |
| `GigCard`, `GigCardFlags`, `MetaItem` | See §4 — the canonical card |
| `StatBox`, `StatGrid` | Individually bordered/rounded stat boxes, uppercase label above a bold value. `StatGrid` chunks into explicit rows so gutters never wrap a cell; `columns={2}` gives the 2×2 detail grid, `{4}` the dashboard KPI strip |
| `StatusBadge`, `VerifiedBadge`, `SkillPill`, `SkillPillRow` | Coloured pills for every trust signal and lifecycle status; `VerifiedBadge` renders either the bare blue check or the full "Verified Student" / "Verified MSME" pill |
| `Avatar`, `BusinessIcon` | Circle for people, rounded-square for businesses/categories; initials or photo, deterministic tint |
| `Banner`, `InfoBanner` | Gradient promo/status banner with optional metric ("92%" beside "Skill Match"), pill CTA and dismiss; `InfoBanner` is the flat inline notice |
| `SearchBar` | Magnifier + placeholder + clear button + optional funnel with active-filter count. `onPress` mode renders the read-only launch strip that opens Global Search |
| `TextField`, `SelectField` | Label above a bordered input, leading icon, helper/error copy, char counter, password reveal, focus ring |
| `SelectableChip`, `ChipRail`, `ChipGroup` | One chip for both filtering and display: white + slate border when idle, solid blue + tick when selected |
| `SegmentedControl` | `pill` (filter scopes) and `underline` (in-page tabs), both with count pills |
| `ProgressBar`, `MilestoneStepper`, `ChecklistItem` | Work-tracker lifecycle: vertical and horizontal steppers, done = filled blue tick, current = blue ring, pending = gray |
| `RatingStars`, `RatingInput` | Read-only (half-star accurate, since the API stores `avgRating` as a float) and interactive 1–5 |
| `ListItem`, `SwitchRow`, `ListGroup` | Settings/profile menu rows inside one rounded card |
| `CandidateCard` | Applicant management / saved talent / comparison (selectable radio variant) |
| `EmptyState`, `ErrorState`, `SuccessState`, `Skeleton`, `GigCardSkeleton`, `LoadingSkeleton`, `InlineLoader` | The System States & Feedback reference set. `GigCardSkeleton` mirrors GigCard's exact block rhythm; skeletons share one 1.1s pulse |

---

## 4. GigCard — the canonical pattern

```
┌────────────────────────────────────────────────┐
│ [■]  Sharma Kirana ✓                        ⌄  │  ① square business icon
│      Create Instagram Content Pack               ② name + verified check
│      (Graphic Design) (Social Media) (+1 more)   ③ bold title (2 lines max)
│ ──────────────────────────────────────────────   ④ bookmark toggle
│ ₹2,500 • 3 days        2.1 km    View Gig ›      ⑤ skill pills
└────────────────────────────────────────────────┘  ⑥ divider
                                                    ⑦ price (bold, large) + duration
                                                    ⑧ distance + "View Gig" link
```

One component, one look. `showBookmark={false}` / `onBookmark` omitted for list contexts, `compact` drops the divider+footer for dense lists, `trailing` swaps the footer-right for a `StatusPill` on My Applications. `GigCardFlags` renders the match/verification/work-type/applicant strip **above** the card and returns `null` when there is no signal to show.

It takes a `GigCardData` **presentation model**, not the API type, so Home / Discover / Saved / My Applications all feed it the same shape and it can never render differently on two screens.

---

## 5. Backend gap register

Flagged, not faked. Against the **live** API (`backend/src/app.ts` → Prisma routers → `src/lib/*-api.ts`).

> Note: `backend/src/routes/index.ts` is a second, much richer **Mongoose** router that *does* have `matchScore`, `SavedGig`, `SavedTalent`, `Engagement` milestones and a fee+GST `Transaction`. **It is not mounted in `backend/src/app.ts`** and its models are not the Prisma schema. Everything below is written against what actually runs.

| Wireframe element | Live API | Verdict |
|---|---|---|
| **Distance** ("2.1 km") on GigCard / Gig Details | `Gig.location` is a free-text `String`. No lat/lng on Gig, no student location, no radius query | ❌ **No backend equivalent.** Card hides the field when absent. Needs geo columns + a distance calc, or simplify to the location string |
| **"92% Skill Match"** banner + chip | `matchScore()` exists in `backend/src/services/matching.service.ts` but **no mounted route calls it** | ❌ **Not exposed.** Needs one small addition (compute in `listGigs`/`getGig` from `studentProfile.skills` vs `gig.skillsRequired`) — ~15 lines, no schema change |
| **Embedded map** on Gig Details / Work Location | No geo data, no map library installed | ❌ **No map.** Will render `location` as text with a `mapPin` icon and a "Get directions" deep link, not an embedded map |
| **Duration** ("3 days") | No `duration` column; only `deadline: DateTime` | ⚠️ **Derive or drop.** Card falls back to `Due 22 Sep` from `deadline` |
| **Saved Gigs** / bookmark on every GigCard | No `SavedGig` model, no `/save` route | ❌ **No backend.** Bookmark renders but cannot persist. Needs a join table + 3 endpoints |
| **Saved Talent** (business) | No `SavedTalent` model | ❌ **No backend.** Same as above |
| **Gig `category`** (Discover filters, gig chips) | `Gig` has no category; only `BusinessProfile.category` | ⚠️ **Partial.** Filters can use `skillsRequired` instead |
| **Payment breakdown** (gig amount / platform fee / GST / payout) | `Payment` has `amount` + `status` only | ⚠️ **Fee + GST not stored.** Either compute client-side for display or add columns |
| **Student degree / year / work radius / work preference** | `StudentProfile` = `college`, `skills`, `bio`, `availability` (3-value enum), `profileImageUrl`, `isVerified`, `avgRating`, `totalRatings` | ⚠️ **Partial.** Verification, skills and location screens will collect what the schema can hold |
| Verified badges, stat grid (Budget/Duration→Deadline/Location), applicant count, earnings, portfolio, ratings/reviews, notifications + unread, messages, reports, work-tracker milestones | `isVerified`, `budget`/`deadline`/`location`, `applications.length`, `/api/earnings`, `PortfolioItem`, `Rating` + `/api/users/:id/ratings`, `NotificationItem.unreadCount`, `Message`, `Report`, `GigStatus` OPEN→ASSIGNED→IN_PROGRESS→SUBMITTED→REVISION_REQUESTED→APPROVED→PAID→CLOSED | ✅ **Available** |

---

## 6. Wireframe → route map (STEP 2 plan)

Constraint honoured: **no route is renamed or moved.** The bottom tab bar is rendered *inside* each screen and navigates with `router.replace` to the existing paths — no `(tabs)/` group is introduced, so every current URL stays valid.

`✅ exists` = a route is already there and gets rebuilt in place. `➕ new` = the wireframe needs a route that does not exist yet (additive only — confirm each before I create it).

### Shared / onboarding
| # | Wireframe | Route | |
|---|---|---|---|
| 1 | Role Selection & Onboarding | role choice currently lives inside `/signup`; a standalone screen is `➕ new` | ⚠️ |
| 2 | Global Search | `➕ new` (`/search`) | ➕ |
| 3 | System States & Feedback | `/design-system` §15 (reference set) | ✅ **built** — pending review |
| 4 | Report & Support | `/(shared)/report/[gigId]` ✅ + hub `/support` ✅ | ✅ **built** — pending review |
| 5 | Messages & Trust Center | `/(shared)/chat/[gigId]` ✅ rebuilt | ✅ **built** — pending review |
| 6 | Ratings & Reviews Flow | `/rate/[gigId]` ➕ built | ✅ **built** — pending review |

### Student flow
| # | Wireframe | Route | |
|---|---|---|---|
| 7 | Student Login / Signup | `/(auth)/login`, `/(auth)/signup` (shared with business today — will get a `role` param, not a new route) | ✅ |
| 8 | Student Verification Flow | `➕ new` | ➕ |
| 9 | Student Skill Selection | `➕ new` | ➕ |
| 10 | Student Location & Availability | `➕ new` | ➕ |
| 11 | Student Home Dashboard | `/(app)/home` ✅ (role-branching today; will render the student dashboard) | ✅ |
| 12 | Discover Gigs | `/(student)/feed` ✅ | ✅ |
| 13 | Gig Filters | inline in `feed` today → `➕ new` route or a modal sheet (**your call**) | ⚠️ |
| 14 | Gig Details View | `/(student)/gig/[id]` ✅ | ✅ |
| 15 | Apply for Gigs | inline in `gig/[id]` today → `➕ new` | ⚠️ |
| 16 | My Applications | `/(student)/my-gigs` ✅ | ✅ |
| 17 | Active Work Tracker | `➕ new` | ➕ |
| 18 | Deliverable Submission | `➕ new` | ➕ |
| 19 | Revision Requested | `➕ new` | ➕ |
| 20 | Student Earnings | `/(student)/earnings` ✅ | ✅ |
| 21 | Student Notifications | `/(shared)/notifications` ✅ | ✅ |
| 22 | Saved Gigs | `➕ new` **+ no backend** (§5) | ❌ |
| 23 | Student Portfolio & Profile | `/(student)/profile` ✅ | ✅ |
| 24 | Student Reviews | `➕ new` | ➕ |

### Business flow
| # | Wireframe | Route | |
|---|---|---|---|
| 25 | Business Login / Signup | `/(auth)/login`, `/(auth)/signup` ✅ | ✅ |
| 26 | Business Verification | `➕ new` | ➕ |
| 27 | Business Dashboard | `/(app)/home` ✅ | ✅ |
| 28 | Post a New Gig | `/(business)/post-gig` ✅ | ✅ |
| 29 | Applicant Management | `/(business)/applicants/[gigId]` ✅ | ✅ |
| 30 | Candidate Profile View | `➕ new` | ➕ |
| 31 | Candidate Comparison | `➕ new` | ➕ |
| 32 | Select Student Confirmation | `➕ new` | ➕ |
| 33 | Business Gig Management | `/(business)/my-gigs` + `/(business)/gig/[id]` ✅ | ✅ |
| 34 | Business Active Work Tracker | `➕ new` | ➕ |
| 35 | Business Payments | `➕ new` | ➕ |
| 36 | Business Notifications | `/(shared)/notifications` ✅ | ✅ |
| 37 | Saved Talent | `➕ new` **+ no backend** (§5) | ❌ |

Also present but not in your list: `/(business)/profile`, `/explore` (Expo template demo), `/index` (redirect).

---

## 7. Decisions

| # | Question | Decision |
|---|---|---|
| 1 | The 35 wireframes did not arrive with the original brief | **Re-sent: all 37 arrived** (35 original + Talent Pool / Saved Talent naming). See decision 7 — they arrived inline only and did not persist to disk |
| 2 | Brand blue — `#2563EB` vs `#208AEF` | **`#2563EB`** (blue-600), as implemented. No change needed |
| 3 | The dead prototype | **Deleted** — see §8 |
| 4 | Gig Filters + Apply for Gig | **Modal sheets** over `/(student)/feed` and `/(student)/gig/[id]`. No new routes |
| 5 | Washed banners (white on `#D9E6FB`, ≈1.6:1) vs the solid gradient | **Solid blue→indigo gradient `Banner`** everywhere — the washed fills are a design-export opacity artifact |
| 6 | `/role` as the logged-out entry point | **Yes** — `src/app/index.tsx` now redirects `/login` → `/role` when there is no token (`cb70179`) |
| 7 | The 37 wireframe PNGs are not on disk and do not survive context compaction | **Re-attaching all 36 remaining.** PNGs stay **out of git** (gitignored); only the extracted specs in `docs/wireframes/*.md` are committed |
| 8 | The ❌/⚠️ gaps in §5 | **Still open.** Per row: small backend addition, or simplify for the pilot? Recommendation: distance → show `location` text; skill match → wire the existing `matchScore()` into `listGigs`/`getGig`; maps → text + directions link; saved gigs/talent → defer (hide the bookmark) or add the two join tables |

---

## 8. Prototype deletion (approved)

51 files, **4,225 lines** removed. Reachability was computed by BFS over the import graph from `src/app/**` (the live entry, since `package.json` `main` is `expo-router/entry`), then each "unreachable" hit was manually re-checked before deletion.

**Deleted:** `App.tsx`, `index.ts`, `src/api/` (3), `src/mockData/` (6), `src/navigation/` (4), `src/screens/` (10), `src/state/DemoContext.tsx`, `src/types/index.ts`, and 24 files from `src/components/` — the 17 NativeWind components (`AccordionItem`, `AvatarInitials`, `CandidateCard`, `ChatBubble`, `ChecklistItem`, `ChipToggle`, `FormField`, `GigCard`, `GradientBannerCard`, `MilestoneStepper`, `PortfolioItemCard`, `RoleSelectCard`, `StatCard`, `StatusPill`, `SystemInfoBanner`, `SystemStates`, `VerifiedBadge`), their `index.ts` barrel, and 5 orphaned Expo-template files (`animated-icon.tsx`/`.web.tsx`/`.module.css`, `app-tabs.tsx`/`.web.tsx`, `hint-row.tsx`).

**Deliberately kept** — a naive reachability sweep flags these, but all three are live:

| File | Why the sweep missed it |
|---|---|
| `src/theme/index.ts` | The design-system barrel. Nothing imports it *yet*; screens import `@/theme/colors` etc. directly |
| `src/hooks/use-color-scheme.web.ts` | Platform sibling — Metro resolves `.web.ts` at build time, never via an import statement |
| `src/types/react-native-razorpay.d.ts` | Ambient module declaration. `react-native-razorpay` is imported by the live `/(business)/gig/[id]` screen |

**Result:** every `Cannot find module` error is gone. `tsc` now reports **0 errors** across the whole frontend.

**Follow-up, not done:** no file in the repo uses `className` any more, so NativeWind is now entirely unused — yet `babel.config.js` still sets `jsxImportSource: 'nativewind'`, `metro.config.js` still wraps the config in `withNativeWind`, and `tailwind.config.js` + `global.css` + `nativewind-env.d.ts` remain. Removing them is a build-config change that cannot be validated against a native EAS build from here, so it is left as a separate decision rather than bundled into a presentation PR. Say the word and it is a small follow-up commit.

**Also flagged, not touched:** `src/app/explore.tsx` (+ `web-badge.tsx`, `themed-text.tsx`, `themed-view.tsx`, `ui/collapsible.tsx`, `external-link.tsx`, `constants/theme.ts`, `hooks/use-theme.ts`) is leftover Expo template demo content — the "Explore now" screen with the React logo. It is a live route, so deleting it would change navigation. Your call whether it survives the rebuild.

---

## 9. STEP 2 screen tracker

One screen per turn: described from the wireframe, mapped to live app data, gaps flagged, built, shown, approved. Route numbers are from §6.

**Per-screen specs live in [`docs/wireframes/`](./wireframes/README.md)** — one `.md` per wireframe, written the moment the image is seen. The source PNGs are deliberately **not** committed (see `.gitignore`); only the extracted specs are, so the literal design spec survives independently of the images.

| # | Screen | Route | Status |
|---|---|---|---|
| 1 | Role Selection & Onboarding | `/role` *(new, additive)* | ✅ **built & approved** — `b27cbc4`, `cb70179` |
| 3–37 | … | | ⬜ specs extracted, not built |

### Screen 1 — Role Selection & Onboarding (`src/app/(auth)/role.tsx`) → [full spec](./wireframes/01-role-selection.md)

New component: **`RoleSelectCard`** (`src/components/ui/RoleSelectCard.tsx`) — the two role cards are the same control in two states, so they are one component: selected = `brandSoft` wash + 2px `primary` border + icon tile flips to solid blue with a white glyph + 28dp blue tick circle; unselected = white card, hairline border, blue-50 tile, blue glyph. Titles render uppercase/extrabold via `Text uppercase`.

New tokens: `icon.logo` (`git-network`, the hub mark) and `icon.studentFilled` (`school`) — both validated against the shipped Ionicons glyphmap.

Data: none. The choice is client state; `Continue` pushes `/(auth)/signup?role=STUDENT|BUSINESS`, which the existing `signup({ role })` mutation in `src/lib/auth-api.ts` already accepts. `Login` → `/login`. No backend gap.

Deliberate deviations from the export, both applied consistently:

1. **The "washed" banners are an export artifact.** This screen's `Trust built-in` banner and the Confirm-Selection / Verification-in-Progress ones export as white text on a ~`#D9E6FB` fill (≈1.6:1 — unreadable). The identical component renders **solid blue→indigo with white text** on Student Home and Discover Gigs, so all of them use the gradient `Banner` (`tone="brand"`).
2. **`index.tsx` was not touched.** Making `/role` the logged-out entry point is a one-line change to an existing route, so it is left for an explicit go-ahead; until then the screen is reachable at `/role`.
