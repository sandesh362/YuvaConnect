# 01 · Role Selection & Onboarding

Route: **`/role`** → `src/app/(auth)/role.tsx` (new, additive) · Status: ✅ built, approved, shipped in `b27cbc4` + `cb70179`

---

## 1. What the wireframe shows

Phone frame, 9:41 status bar. **No app bar** — content starts at the top edge. Ground is the
light neutral app background (`#F8FAFC`).

**Brand block, top-left, left-aligned:**

| Element | Spec |
|---|---|
| Logo tile | 56 × 56, radius 16, **solid blue**, white network-hub glyph centred (~30px) |
| Wordmark | `YuvaConnect` — 32/40, weight 800, **blue** |
| Tagline | `Local skills. Real opportunities.` — 15, semibold, slate-600 |

**Heading block** (large gap below the brand block):

- `How do you want to use YuvaConnect?` — ~28/34, weight 800, slate-900, wraps to 2 lines.
- `Choose your role to personalize your experience and start connecting.` — 15, slate-500/600, wraps to 2 lines.

**Two role cards**, stacked, equal height (~124), radius 16, padding 20. Same component in two
states — never two different layouts:

| | **Selected** (STUDENT in the export) | **Unselected** (BUSINESS) |
|---|---|---|
| Fill | soft blue wash (blue-50 → indigo-50) | white |
| Border | **2px solid blue** | 1px hairline `borderSubtle` |
| Elevation | medium | small |
| Icon tile | 56, radius 16, **solid blue** + **white** glyph | 56, radius 16, **blue-50** + **blue** glyph |
| Glyph | filled mortarboard (`school`) | filled briefcase (`briefcase`) |
| Title | uppercase, weight 800, slate-900, 1 line | same |
| Description | 15, slate-600, clamped to 2 lines | same |
| Right edge | **28dp solid-blue circle with a white tick** | nothing |

Copy in the export:

- STUDENT — "Find paid micro-gigs near your college and build a real-world portfolio."
- BUSINESS — "Find verified, skilled local talent for short-term tasks and micro-projects."

**Trust banner** (full width, below the cards): shield-check glyph on the left, then a stacked
`Trust built-in` title + one line of body copy. See §5 — the export's washed fill is an artifact.

**Sticky bottom bar** — white, hairline top edge, upward shadow:

- Full-width **pill** primary button `Continue` (large).
- Below it, a centred inline row: `Already have an account?` in slate-600, then `Login` in blue
  semibold — **no chevron**.

## 2. Mapping to live app data

| Element | Live equivalent |
|---|---|
| Role choice | Client state only. `Continue` → `/(auth)/signup?role=STUDENT\|BUSINESS`, which the existing `signup({ name, email, password, role })` in `src/lib/auth-api.ts` already accepts (`role: Exclude<Role,'ADMIN'>`, `Role` from `src/types/api.ts`) |
| `Login` link | existing `/login` route |
| Brand mark, tagline, trust copy | static — no API |
| Session gating | `src/providers/auth-provider.tsx`; `src/app/index.tsx` redirects on `token` |

**No API call is made on this screen.**

## 3. Flags

**None.** This screen has no backend dependency, so nothing needed faking or hiding.

## 4. Build

| File | Change |
|---|---|
| `src/app/(auth)/role.tsx` | **new** — the screen. `Screen` + `ScrollView` + sticky `BottomActionBar` |
| `src/components/ui/RoleSelectCard.tsx` | **new** — the role card, both states, `accessibilityRole="radio"` inside a `radiogroup` |
| `src/components/ui/index.ts` | export `RoleSelectCard` |
| `src/theme/icons.ts` | **new glyphs:** `logo: 'git-network'`, `studentFilled: 'school'` — both validated against the shipped Ionicons glyphmap |
| `src/app/index.tsx` | one-line change, separately approved: logged-out redirect `/login` → `/role` |

Reused, unchanged: `Screen`, `BottomActionBar`, `Button` (`size="lg"`), `Banner` (`tone="brand"`),
`Text` (`display` / `title1` / `body` / `bodyStrong` / `callout`, `uppercase`), `TextLink`, `Icon`.

There is **no `src/app/(auth)/_layout.tsx`**, so pointing the entry redirect at `/role` cannot
create a loop.

## 5. Deviations

1. **Trust banner fill.** The export renders white text on a washed `#D9E6FB` fill (≈1.6:1
   contrast — illegible). The identical component renders solid blue→indigo with white text on
   Student Home and Discover Gigs, so this is a design-export opacity artifact. Built as the
   gradient `Banner tone="brand"`, and the same rule is applied to every other washed banner
   (Confirm-Selection "Protected Payment", System-States "Verification in Progress").
   **Approved.**
2. **Interim signup handoff.** `/(auth)/signup` still defaults its role state to `STUDENT` and
   does not yet read the `?role=` param, so a Business choice is not yet honoured end-to-end.
   Deliberately not fixed here — that screen is #7, and screens are built one at a time.
   Tracked in the commit message for `cb70179`.
