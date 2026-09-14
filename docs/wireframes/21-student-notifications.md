# 21 · Student Notifications

Route: `/(shared)/notifications` (rebuilt in place; shared with 36).
Status: ✅ built — pending review.

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

## 3. Flags (resolved at build)
- mark-all-read endpoint EXISTS (`PATCH /api/notifications/read-all`) — wired for real, as
  is per-item read-on-open.
- Plain 56dp colour circles (no glyphs) kept literally, per the export.
- Row titles are composed from the real NotificationType (+ keyword refinement for
  revision/deadline/approved inside GIG_STATUS_CHANGED); bodies are the server message
  verbatim.

## 4. Build
Rebuilt in place: header with blue double-check mark-all action (disabled when everything
is read), check-mark filter rail (All / Application / Work Update / Messages mapped to the
real NotificationType enum), TODAY/YESTERDAY/OLDER overline bars over washed rows with
per-type colours (green accepted · red rejected/revisions · blue messages · teal payments ·
amber status), relative "2m ago" stamps, unread vs read title emphasis, real deep-links on
tap (messages → chat, everything else → gig details), 30s poll and a real "Load older
notifications" pager. Business viewers get the business tab set.

## 5. Deviations
1. Tab labels use the canonical STUDENT_TABS (Home/Discover/My Gigs/Messages/Profile) with
   Messages active, instead of the export's one-off "Apps/Inbox" labels — cross-screen
   consistency rule beats per-export label drift (noted in README's design language).
