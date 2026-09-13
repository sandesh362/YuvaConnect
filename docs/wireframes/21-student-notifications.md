# 21 · Student Notifications

Route: `/(shared)/notifications` (rebuild in place; shared with 36).

## 1. What the wireframe shows

- Header: back · title1 "Notifications" · BLUE double-check icon right (mark-all-read).
- **Check-mark filter rail**: "✓ All" bare + outlined pills "Application" "Work Update"
  "Messages" (clipped).
- Section overline bars (slate-100 full-bleed, caption-bold slate-600): "TODAY" "YESTERDAY"
  "OLDER".
- **Rows on washed slate-blue background** (full-bleed, hairline between): 56dp SOLID colour
  circle (no glyph!) — green/teal/blue/amber/red by type — + bold title + right caption-bold
  time ("2m ago") + 2-line body slate-600.
  TODAY: Application Accepted! (green) · Payment Received (teal) · New Message (blue).
  YESTERDAY: Deadline Approaching (amber) · Profile Verified (blue) · Revision Requested
  (red). OLDER: New Review (amber).
- Tab bar: Home · Discover · Apps · **Inbox (ACTIVE blue filled bell)** · Profile.

## 2. Mapping
notifications + unreadCount ✅; mark-all-read endpoint? verify; type→colour map is local;
time-ago = client format of createdAt; section grouping = client.

## 3. Flags: mark-all-read endpoint; per-type icons absent (circles are plain).
## 4–5. At build time.
