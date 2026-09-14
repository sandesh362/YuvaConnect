# 16 · My Applications

Route: `/(student)/my-gigs` (rebuilt in place). Status: ✅ built — pending review.

## 1. What the wireframe shows

- Header: title1 "My Applications" + body "Track your progress and earnings"; bell icon
  button right (plain, no circle).
- **Check-mark filter rail** (style 2): "✓ All" bare (dark check + bold label, no pill) then
  OUTLINED pills "Pending" "Shortlisted" "Active" "Comp…" (clipped).
- **Application cards** (white, radius 16, hairline; the ACTIVE one gets a 1.5px BLUE
  border):
  - Row: 48dp initials circle (mint/blue tint) + bold business name + row teal shield-check
    + caption-bold teal "Verified Business" (3rd card: plain caption "Andheri East, Mumbai")
    + right STATUS PILL: amber "Shortlisted" / green "Active" / blue "Applied".
  - Title3 gig title; caption row "Applied on 12 Oct • 3 days duration" (variants: "Started
    08 Oct • Deadline tomorrow", "Applied yesterday • 15 applicants").
  - (active card) **ProgressBar** green fill 65% inside slate track w/ bold "65%" right.
  - Divider; footer row: caption-bold "Budget" over blue price title3 left + right action:
    outline pill "View Status" / SOLID BLUE pill "Open Tracker" / blue text link "Withdraw".
- Tab bar: Home · Discover · **Applications (ACTIVE blue filled clipboard)** · Messages ·
  Profile.

## 2. Mapping
my applications = applications filtered by me ✅; status pill = Application.status ✅;
progress % = derive from GigStatus lifecycle (no % column) → flag/derive; withdraw = check
endpoint (likely absent → flag); "15 applicants" count ✅ on gig.

## 3. Flags (resolved at build)
- Progress % has no column → DERIVED from the lifecycle (IN_PROGRESS 50, REVISION 60,
  SUBMITTED 75), shown only on Active cards, derivation documented.
- Withdraw exists only on the dead Mongoose router → link renders, tap explains (flag).
- "Open Tracker" → quiet no-op until screen 17 ships /tracker/[gigId].
- Verified-Business teal row: no isVerified in payload → the location-caption card variant
  (also drawn in the export) is used instead.

## 4. Build
Rebuilt `src/app/(student)/my-gigs.tsx`: ScreenHeader with plain bell, check-mark filter
rail (bare "✓ All" + outlined pills, style 2), application cards with mint/blue initials
avatar, derived status pill (Applied/Shortlisted/Active/Completed/Rejected from the REAL
Application.status + gig lifecycle), applied-on + due + applicant-count caption, green
ProgressBar on Active cards (1.5px blue border), Budget-over-price footer and per-status
actions (View Status → gig · Open Tracker · Rate Gig → /rate). Tab bar activeKey="mygigs".

Route note: the bare URL `/my-gigs` is ambiguous between `(student)/my-gigs` and
`(business)/my-gigs` (pre-existing group collision; SSR of the bare URL renders an empty
shell). All in-app navigation uses the group-qualified `/(student)/my-gigs`, which renders
correctly — same as before the rebuild.

## 5. Deviations
1. Card subtitle "3 days duration" variants → honest composition: applied-ago label +
   real deadline + real applicant count (no duration column).
2. "Completed" group label instead of the clipped "Comp…" pill.
