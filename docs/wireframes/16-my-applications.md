# 16 · My Applications

Route: `/(student)/my-gigs` (rebuild in place).

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

## 3. Flags: progress %, withdraw endpoint.
## 4–5. At build time.
