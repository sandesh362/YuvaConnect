# YuvaConnect — Design System (Phase 7, STEP 1)

Status: **built, typechecks clean, bundled for web.** No product screen has been rebuilt yet.
Review it live at the `/design-system` route before STEP 2 begins.

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
| `src/components/*.tsx` (17 NativeWind components) + `src/screens/*` + `src/navigation/*` + `src/state/DemoContext.tsx` import **`lucide-react-native`**, **`expo-linear-gradient`** and **`@react-navigation/bottom-tabs`** — none of which are in `package.json` or `package-lock.json` | That whole prototype **cannot compile**. `npx tsc` reported 25+ `TS2307 Cannot find module` errors before this change. | Left in place (not wired into the running app) and flagged for a decision — see §7. Installed `expo-linear-gradient@57.0.2` because the gradient banners are in the spec. |
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
| `Button`, `PrimaryButton`, `SecondaryButton`, `SoftButton`, `GhostButton`, `DangerButton`, `TextLink` | Filled blue = the one primary action; outline blue = secondary. `sm/md/lg`, leading/trailing icon, `loading`, `disabled`. Aliases exist so the hierarchy on a screen reads explicitly at the call site |
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
| 3 | System States & Feedback | covered by `/design-system` §15 — a reference set, not a product route | ✅ |
| 4 | Report & Support | `/(shared)/report/[gigId]` ✅ + support hub `➕ new` | ⚠️ |
| 5 | Messages & Trust Center | `/(shared)/chat/[gigId]` ✅ + thread list `➕ new` | ⚠️ |
| 6 | Ratings & Reviews Flow | `rating-modal` exists ✅ + dedicated flow `➕ new` | ⚠️ |

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

## 7. Open decisions needed before STEP 2

1. **Re-send the 35 wireframes** — they did not arrive (see the PR description). STEP 1 was built from your written design-language spec plus the prior components in `src/components/`; STEP 2 needs the actual images to match layout, spacing and hierarchy exactly.
2. **Brand blue** — `#2563EB` (current) or `#208AEF` (splash / legacy)?
3. **The dead prototype** (`src/screens/`, `src/navigation/`, `src/state/DemoContext.tsx`, the 17 NativeWind `src/components/*.tsx`, `App.tsx`, `index.ts`) — delete, or keep? It cannot compile as-is. Deleting removes ~2,000 lines and all the missing-dependency errors; keeping it means installing `lucide-react-native` + `@react-navigation/bottom-tabs`.
4. **Gig Filters + Apply for Gig** — real routes, or modal sheets over `/(student)/feed` and `/(student)/gig/[id]`? Sheets change no routes.
5. **The ❌/⚠️ gaps in §5** — for each: small backend addition, or simplify for the pilot? My recommendation for the pilot: distance → show `location` text; skill match → wire the existing `matchScore()` into `listGigs`/`getGig`; maps → text + directions link; saved gigs/talent → defer (hide the bookmark) or add the two join tables.
