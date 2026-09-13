/**
 * ============================================================
 * DESIGN SYSTEM — live reference gallery (STEP 1 deliverable)
 * ============================================================
 * Route: /design-system
 *
 * This screen exists so the token set and base components can be
 * reviewed side by side before any product screen is rebuilt. It
 * is deliberately NOT linked from any tab or header — it is a
 * review tool, not part of the app's navigation graph.
 *
 * Delete this file once Phase 7 screen rebuilds are signed off.
 */
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Avatar,
  BUSINESS_TABS,
  Banner,
  BottomActionBar,
  BottomTabBar,
  Button,
  CandidateCard,
  Card,
  ChecklistItem,
  ChipGroup,
  ChipRail,
  Divider,
  EmptyState,
  ErrorState,
  GigCard,
  GigCardFlags,
  Icon,
  IconButton,
  InfoBanner,
  InlineLoader,
  ListGroup,
  ListItem,
  LoadingSkeleton,
  MilestoneStepper,
  ProgressBar,
  RatingInput,
  RatingStars,
  STUDENT_TABS,
  ScreenHeader,
  SearchBar,
  SegmentedControl,
  SelectField,
  Skeleton,
  SkillPill,
  SkillPillRow,
  StatGrid,
  StatusBadge,
  SuccessState,
  SwitchRow,
  Text,
  TextField,
  TextLink,
  VerifiedBadge,
  type CandidateCardData,
  type GigCardData,
} from '@/components/ui';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import { typography } from '@/theme/typography';

// ------------------------------------------------------------
// Sample data shaped exactly like the wireframe copy
// ------------------------------------------------------------

const GIG: GigCardData = {
  id: 'GIG-001',
  title: 'Create Instagram Content Pack',
  businessName: 'Sharma Kirana Store',
  isBusinessVerified: true,
  skills: ['Graphic Design', 'Social Media', 'Canva'],
  budget: 2500,
  duration: '3 days',
  distance: '2.1 km',
  location: 'Koramangala, Bengaluru',
  deadline: '22 Sep',
  applicantCount: 14,
  matchPercentage: 92,
  workType: 'on-site',
};

const GIG_REMOTE: GigCardData = {
  id: 'GIG-002',
  title: 'Monthly Bookkeeping Cleanup for Café',
  businessName: 'Brew & Bite Café',
  isBusinessVerified: false,
  skills: ['Tally', 'Excel'],
  budget: 4800,
  duration: '1 week',
  location: 'Indiranagar, Bengaluru',
  deadline: '30 Sep',
  applicantCount: 6,
  workType: 'remote',
};

const CANDIDATE: CandidateCardData = {
  id: 'C-001',
  name: 'Ananya Rao',
  college: 'Christ University',
  course: 'B.Com, 3rd year',
  skills: ['Graphic Design', 'Canva', 'Social Media'],
  rating: 4.8,
  reviewCount: 23,
  completedGigs: 17,
  matchPercentage: 92,
  distance: '2.1 km',
  availability: 'Weekends',
  isVerified: true,
  statusLabel: 'Shortlisted',
  statusTone: 'warning',
};

const MILESTONES = [
  { key: 'assigned', label: 'Assigned', status: 'done', meta: '12 Sep' },
  { key: 'started', label: 'Work started', status: 'done', meta: '13 Sep' },
  { key: 'submitted', label: 'Submitted for review', status: 'current', meta: 'Due 18 Sep' },
  { key: 'approved', label: 'Approved', status: 'pending' },
  { key: 'paid', label: 'Payment released', status: 'pending' },
] as const;

// ------------------------------------------------------------
// Gallery scaffolding
// ------------------------------------------------------------

function Swatch({ name, value }: { name: string; value: string }) {
  return (
    <View style={g.swatch}>
      <View style={[g.swatchChip, { backgroundColor: value, borderColor: color.border }]} />
      <Text variant="caption" numberOfLines={1} style={{ fontWeight: '600' }}>
        {name}
      </Text>
      <Text variant="caption" tone="tertiary" numberOfLines={1} style={{ fontSize: 10 }}>
        {value}
      </Text>
    </View>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={g.section}>
      <View style={g.sectionHead}>
        <Text variant="title3">{title}</Text>
        {note ? (
          <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
            {note}
          </Text>
        ) : null}
      </View>
      <View style={g.sectionBody}>{children}</View>
    </View>
  );
}

function Row({ children, wrap = true }: { children: React.ReactNode; wrap?: boolean }) {
  return <View style={[g.row, wrap ? g.rowWrap : null]}>{children}</View>;
}

// ------------------------------------------------------------
// Screen
// ------------------------------------------------------------

export default function DesignSystemScreen() {
  const [query, setQuery] = useState('');
  const [skills, setSkills] = useState<string[]>(['Graphic Design', 'Video Editing']);
  const [segment, setSegment] = useState('active');
  const [rating, setRating] = useState(4);
  const [checks, setChecks] = useState([true, true, false]);
  const [notify, setNotify] = useState(true);
  const [saved, setSaved] = useState(true);
  const [tab, setTab] = useState('home');

  const allSkills = ['Graphic Design', 'Video Editing', 'Social Media', 'Content Writing', 'Data Entry', 'Photography', 'Tally', 'Excel'];
  const toggleSkill = (skill: string) =>
    setSkills((current) => (current.includes(skill) ? current.filter((s) => s !== skill) : [...current, skill]));

  return (
    <SafeAreaView style={g.safe} edges={['top', 'left', 'right']}>
      <ScreenHeader
        title="Design System"
        subtitle="Phase 7 · STEP 1 reference"
        onBack={() => (router.canGoBack() ? router.back() : undefined)}
        actions={[{ icon: 'bell', accessibilityLabel: 'Notifications', onPress: () => undefined, count: 3 }]}
      />

      <ScrollView style={g.scroll} contentContainerStyle={g.content} showsVerticalScrollIndicator={false}>
        {/* ---------------- COLOUR ---------------- */}
        <Section title="1 · Colour" note="src/theme/colors.ts — components use the `color.*` aliases, never raw hex.">
          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Brand
          </Text>
          <Row>
            {(['primary', 'primaryPressed', 'primarySoft', 'primaryBorder', 'primaryText'] as const).map((token) => (
              <Swatch key={token} name={token} value={color[token]} />
            ))}
          </Row>

          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Surfaces & lines
          </Text>
          <Row>
            {(['background', 'surface', 'surfaceMuted', 'border', 'borderSubtle', 'divider'] as const).map((token) => (
              <Swatch key={token} name={token} value={color[token]} />
            ))}
          </Row>

          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Text
          </Text>
          <Row>
            {(['textPrimary', 'textSecondary', 'textTertiary', 'textDisabled', 'textLink'] as const).map((token) => (
              <Swatch key={token} name={token} value={color[token]} />
            ))}
          </Row>

          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Semantic status
          </Text>
          <Row>
            {(['success', 'successSoft', 'warning', 'warningSoft', 'danger', 'dangerSoft', 'info', 'accent'] as const).map((token) => (
              <Swatch key={token} name={token} value={color[token]} />
            ))}
          </Row>
        </Section>

        {/* ---------------- TYPE ---------------- */}
        <Section title="2 · Typography" note="src/theme/typography.ts — 18 variants, one `<Text>` component.">
          {(Object.keys(typography) as (keyof typeof typography)[]).map((variant) => (
            <View key={variant} style={g.typeRow}>
              <Text variant={variant} numberOfLines={1} style={g.typeSample}>
                {variant === 'overline' ? 'VERIFIED STUDENT' : '₹2,500 · Koramangala'}
              </Text>
              <View style={g.typeMeta}>
                <Text variant="caption" tone="brand" style={{ fontWeight: '700' }}>
                  {variant}
                </Text>
                <Text variant="caption" tone="tertiary">
                  {typography[variant].fontSize}/{typography[variant].lineHeight} · {typography[variant].fontWeight}
                </Text>
              </View>
            </View>
          ))}
        </Section>

        {/* ---------------- SPACING / RADIUS / SHADOW ---------------- */}
        <Section title="3 · Space, radius & elevation" note="4pt grid · three card radii · five elevation levels.">
          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Spacing scale
          </Text>
          <Row>
            {(Object.keys(space) as (keyof typeof space)[]).map((token) => (
              <View key={token} style={g.spaceSample}>
                <View style={{ height: 8, width: space[token], backgroundColor: color.primary, borderRadius: 2 }} />
                <Text variant="caption" tone="secondary" style={{ fontSize: 10 }}>
                  {token} {space[token]}
                </Text>
              </View>
            ))}
          </Row>

          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Radius scale
          </Text>
          <Row>
            {(Object.keys(radius) as (keyof typeof radius)[])
              .filter((token) => token !== 'none')
              .map((token) => (
                <View key={token} style={g.radiusSample}>
                  <View style={{ width: 46, height: 46, borderRadius: radius[token], backgroundColor: color.primarySoft, borderWidth: 1.5, borderColor: color.primary }} />
                  <Text variant="caption" tone="secondary" style={{ fontSize: 10 }}>
                    {token}
                  </Text>
                </View>
              ))}
          </Row>

          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Elevation
          </Text>
          <Row>
            {(['sm', 'md', 'lg', 'xl', 'primary'] as const).map((token) => (
              <View key={token} style={[g.shadowSample, shadow[token]]}>
                <Text variant="caption" tone="secondary">
                  {token}
                </Text>
              </View>
            ))}
          </Row>
        </Section>

        {/* ---------------- BUTTONS ---------------- */}
        <Section title="4 · Buttons" note="Filled blue = the one primary action. Outline blue = secondary. Never mixed arbitrarily.">
          <View style={g.stack}>
            <Button label="Apply for Gig" onPress={() => undefined} icon="sendFilled" />
            <Button label="Save as Draft" variant="secondary" onPress={() => undefined} />
            <Button label="View Gig" variant="ghost" fullWidth={false} iconRight="chevronRight" onPress={() => undefined} />
            <Row>
              <Button label="Approve" variant="success" size="sm" onPress={() => undefined} icon="check" style={g.flex1} />
              <Button label="Request revision" variant="dangerSoft" size="sm" onPress={() => undefined} style={g.flex1} />
            </Row>
            <Row>
              <Button label="Soft action" variant="soft" size="sm" onPress={() => undefined} style={g.flex1} />
              <Button label="Disabled" disabled size="sm" onPress={() => undefined} style={g.flex1} />
              <Button label="Loading" loading size="sm" onPress={() => undefined} style={g.flex1} />
            </Row>
            <Row wrap={false}>
              <TextLink label="See all reviews" onPress={() => undefined} />
              <TextLink label="Delete account" tone="danger" iconRight={null} onPress={() => undefined} />
            </Row>
          </View>
        </Section>

        {/* ---------------- BADGES & PILLS ---------------- */}
        <Section title="5 · Badges, pills & verified marks" note="Coloured pills for every trust signal and lifecycle status.">
          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Status badges
          </Text>
          <Row>
            <StatusBadge label="Open" tone="brand" />
            <StatusBadge label="Shortlisted" tone="warning" />
            <StatusBadge label="Selected" tone="success" icon="checkCircleFilled" />
            <StatusBadge label="Revision Requested" tone="danger" icon="alertFilled" />
            <StatusBadge label="In Progress" tone="info" />
            <StatusBadge label="Draft" tone="neutral" />
            <StatusBadge label="Payment Released" tone="solid" icon="rupeeFilled" />
          </Row>

          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Verification
          </Text>
          <Row>
            <VerifiedBadge label="Verified Student" />
            <VerifiedBadge label="Verified MSME" tone="success" />
            <View style={g.inlineName}>
              <Text variant="heading">Sharma Kirana Store</Text>
              <VerifiedBadge size={16} />
            </View>
          </Row>

          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Skill pills
          </Text>
          <SkillPillRow skills={allSkills.slice(0, 5)} />
          <View style={{ height: space.md }} />
          <SkillPillRow skills={['Graphic Design', 'Canva', 'Social Media']} tone="success" max={2} size="sm" />
        </Section>

        {/* ---------------- GIG CARD ---------------- */}
        <Section
          title="6 · GigCard"
          note="The canonical pattern: square business icon + name + verified → bold title → skill pills → divider → price/duration left, distance + View Gig right."
        >
          <GigCardFlags
            matchPercentage={GIG.matchPercentage}
            isVerified={GIG.isBusinessVerified}
            workType={GIG.workType}
            applicantCount={GIG.applicantCount}
          />
          <GigCard
            gig={GIG}
            isBookmarked={saved}
            onBookmark={() => setSaved((v) => !v)}
            onPress={() => undefined}
          />
          <Text variant="caption" tone="secondary" style={g.note}>
            Same component, no bookmark, no distance (both absent from the live API):
          </Text>
          <GigCard gig={{ ...GIG_REMOTE, distance: undefined }} onPress={() => undefined} showBookmark={false} />
          <Text variant="caption" tone="secondary" style={g.note}>
            Compact variant for dense lists:
          </Text>
          <GigCard gig={GIG} compact onPress={() => undefined} showBookmark={false} />
        </Section>

        {/* ---------------- STAT GRID ---------------- */}
        <Section title="7 · StatBox & StatGrid" note="Key facts as individually bordered boxes in a 2×2 grid — never plain text.">
          <StatGrid
            columns={2}
            items={[
              { label: 'Budget', value: '₹2,500', icon: 'rupee', variant: 'plain' },
              { label: 'Duration', value: '3 days', icon: 'clock', variant: 'plain' },
              { label: 'Location', value: 'Koramangala', icon: 'mapPin', variant: 'plain' },
              { label: 'Deadline', value: '22 Sep', icon: 'calendar', variant: 'plain' },
            ]}
          />
          <View style={{ height: space.lg }} />
          <StatGrid
            columns={2}
            items={[
              { label: 'Total earnings', value: '₹18,400', icon: 'wallet', variant: 'tinted', tone: 'success', hint: '+₹3,200 this month' },
              { label: 'Gigs completed', value: '17', icon: 'briefcase', variant: 'tinted', tone: 'brand' },
              { label: 'Rating', value: '4.8', icon: 'star', variant: 'tinted', tone: 'warning', hint: '23 reviews' },
              { label: 'Pending payout', value: '₹2,500', icon: 'hourglass', variant: 'tinted', tone: 'neutral', hint: 'Escrow held' },
            ]}
          />
        </Section>

        {/* ---------------- CARDS & BANNERS ---------------- */}
        <Section title="8 · Cards & banners" note="White card on gray ground; gradient blue reserved for one contextual fact.">
          <Banner
            title="92% Skill Match"
            description="Your Graphic Design and Canva skills match 3 of the 3 skills this business needs."
            icon="flashFilled"
            metric={{ value: '92%', label: 'match' }}
            actionLabel="Apply now"
            onAction={() => undefined}
          />
          <Banner
            title="Verified Student"
            description="College ID approved on 4 Sep 2026. You can apply to verified businesses."
            icon="shieldCheckFilled"
            tone="success"
            compact
          />
          <Banner title="Payment held in escrow" description="₹2,500 releases on approval." icon="rupeeFilled" tone="brandDeep" />
          <InfoBanner tone="info" title="All candidates are verified students" description="Work history and ratings are visible before you select." />
          <InfoBanner tone="warning" title="Verification pending" description="Upload your college ID to start applying." actionLabel="Complete verification" onAction={() => undefined} />
          <InfoBanner tone="success" title="Gig published" description="Visible to 128 matched students near Koramangala." />

          <Card>
            <Text variant="heading">Standard card</Text>
            <Text variant="callout" tone="secondary" style={{ marginTop: space.xs }}>
              White surface, radius 16, hairline slate-100 border, elevation `sm`, 16px padding.
            </Text>
          </Card>
          <Card elevation="flat" tone="muted">
            <Text variant="heading">Flat muted card</Text>
            <Text variant="callout" tone="secondary" style={{ marginTop: space.xs }}>
              Inset surface for nested content and filter sheets.
            </Text>
          </Card>
        </Section>

        {/* ---------------- HEADERS & NAV ---------------- */}
        <Section title="9 · Headers & navigation" note="Back arrow · title · contextual right icons. Active tab in primary blue.">
          <View style={g.frame}>
            <ScreenHeader
              title="Gig Details"
              onBack={() => undefined}
              actions={[
                { icon: 'bookmark', accessibilityLabel: 'Save gig', onPress: () => undefined },
                { icon: 'share', accessibilityLabel: 'Share gig', onPress: () => undefined },
                { icon: 'bell', accessibilityLabel: 'Notifications', onPress: () => undefined, showDot: true },
              ]}
            />
          </View>
          <View style={{ height: space.md }} />
          <View style={g.frame}>
            <ScreenHeader title="Gig Filters" subtitle="3 filters applied" onBack={() => undefined} variant="transparent" />
          </View>
          <View style={{ height: space.md }} />
          <View style={g.frame}>
            <BottomTabBar items={STUDENT_TABS} activeKey={tab} onSelect={setTab} />
          </View>
          <View style={{ height: space.md }} />
          <View style={g.frame}>
            <BottomTabBar
              items={BUSINESS_TABS.map((item) => (item.key === 'messages' ? { ...item, badge: 4 } : item))}
              activeKey="gigs"
              onSelect={() => undefined}
            />
          </View>
          <Text variant="caption" tone="tertiary" style={{ marginTop: space.sm }}>
            {Platform.OS === 'web' ? 'Tab bar height ' : 'Tab bar height '}
            {layout.tabBarHeight}px + safe-area inset · header {layout.headerHeight}px · tap target {layout.tapTarget}px
          </Text>
        </Section>

        {/* ---------------- SEARCH & INPUTS ---------------- */}
        <Section title="10 · Search & inputs" note="Magnifier + placeholder + optional funnel. Focus turns the border blue.">
          <SearchBar value={query} onChangeText={setQuery} onFilter={() => undefined} activeFilterCount={3} />
          <SearchBar value="" onChangeText={() => undefined} placeholder="Search saved gigs" onPress={() => undefined} onFilter={() => undefined} />
          <View style={{ height: space.md }} />
          <TextField label="Full name" value="Ananya Rao" onChangeText={() => undefined} icon="person" />
          <TextField label="Email address" value="" onChangeText={() => undefined} placeholder="you@college.edu" icon="mail" type="email" helperText="Use your college email for faster verification." />
          <TextField label="Password" value="hunter2hunter2" onChangeText={() => undefined} icon="lock" type="password" />
          <TextField label="Budget (₹)" value="2500" onChangeText={() => undefined} type="number" suffix="₹" />
          <TextField label="Proposal" value="" onChangeText={() => undefined} type="textarea" placeholder="Tell the business why you're a good fit…" maxLength={400} helperText="2-3 sentences works best." />
          <TextField label="College" value="" onChangeText={() => undefined} errorText="College is required for student verification." />
          <SelectField label="Availability" value="Weekends only" onPress={() => undefined} icon="calendar" />
        </Section>

        {/* ---------------- CHIPS & SEGMENTS ---------------- */}
        <Section title="11 · Chips, segments & toggles" note="Same chip component for filtering and for display.">
          <ChipRail
            chips={[
              { label: 'Near me', selected: true, onToggle: () => undefined, icon: 'mapPin' },
              { label: 'Remote OK', selected: false, onToggle: () => undefined, icon: 'desktop' },
              { label: '₹1,000+', selected: false, onToggle: () => undefined },
              { label: 'This week', selected: false, onToggle: () => undefined, icon: 'clock' },
            ]}
          />
          <ChipGroup
            columns={2}
            chips={allSkills.map((skill) => ({ label: skill, selected: skills.includes(skill), onToggle: () => toggleSkill(skill) }))}
          />
          <View style={{ height: space.lg }} />
          <SegmentedControl
            segments={[
              { key: 'all', label: 'All', count: 12 },
              { key: 'active', label: 'Active', count: 3 },
              { key: 'done', label: 'Completed' },
            ]}
            activeKey={segment}
            onChange={setSegment}
          />
          <SegmentedControl
            variant="underline"
            segments={[
              { key: 'unread', label: 'Unread', count: 4 },
              { key: 'allnotif', label: 'All' },
              { key: 'mentions', label: 'Gig updates' },
            ]}
            activeKey="unread"
            onChange={() => undefined}
          />
          <ListGroup>
            <SwitchRow title="Push notifications" subtitle="New applicants, messages and payouts" icon="bell" value={notify} onValueChange={setNotify} />
            <SwitchRow title="Show me on Discover" subtitle="Verified businesses can find your profile" icon="discover" value={false} onValueChange={() => undefined} last />
          </ListGroup>
        </Section>

        {/* ---------------- PROGRESS & RATINGS ---------------- */}
        <Section title="12 · Progress, milestones & ratings">
          <ProgressBar value={65} label="Deliverable progress" showValue tone="brand" />
          <View style={{ height: space.md }} />
          <ProgressBar value={100} label="Payment released" tone="success" />
          <View style={{ height: space.lg }} />
          <Card>
            <Text variant="heading" style={{ marginBottom: space.base }}>
              Work tracker
            </Text>
            <MilestoneStepper milestones={[...MILESTONES]} />
          </Card>
          <Card>
            <Text variant="heading" style={{ marginBottom: space.base }}>
              Horizontal variant
            </Text>
            <MilestoneStepper milestones={[...MILESTONES]} orientation="horizontal" />
          </Card>
          <Card>
            <Text variant="heading" style={{ marginBottom: space.sm }}>
              Submission checklist
            </Text>
            {['3 post designs (PNG + source file)', 'Caption copy in a Google Doc', 'Business logo lockup'].map((item, index) => (
              <ChecklistItem
                key={item}
                label={item}
                checked={checks[index]}
                onToggle={() => setChecks((c) => c.map((v, i) => (i === index ? !v : v)))}
              />
            ))}
          </Card>
          <Row wrap={false}>
            <RatingStars value={4.8} count={23} size={15} />
            <RatingStars value={3.5} size={15} />
          </Row>
          <Card style={{ alignItems: 'center' }}>
            <Text variant="heading">Rate your experience</Text>
            <Text variant="callout" tone="secondary" style={{ marginTop: 2, marginBottom: space.md, textAlign: 'center' }}>
              How was working with Sharma Kirana Store?
            </Text>
            <RatingInput value={rating} onChange={setRating} />
          </Card>
        </Section>

        {/* ---------------- LISTS ---------------- */}
        <Section title="13 · List rows & candidate cards">
          <ListGroup>
            <ListItem title="Saved Gigs" subtitle="8 saved" icon="bookmark" onPress={() => undefined} />
            <ListItem title="Earnings" subtitle="₹18,400 total" icon="wallet" iconTone="success" onPress={() => undefined} trailingText="This month ₹3,200" />
            <ListItem title="Verification" icon="shieldCheck" iconTone="warning" badge="Action needed" badgeTone="warning" onPress={() => undefined} />
            <ListItem title="Report a problem" icon="flag" iconTone="danger" onPress={() => undefined} />
            <ListItem title="Sign out" icon="logout" iconTone="neutral" trailing="none" onPress={() => undefined} last />
          </ListGroup>
          <CandidateCard
            candidate={CANDIDATE}
            onPress={() => undefined}
            onShortlist={() => undefined}
            onMessage={() => undefined}
            onSelect={() => undefined}
          />
          <CandidateCard candidate={{ ...CANDIDATE, name: 'Rohit Menon', matchPercentage: 78, rating: 4.4, statusLabel: undefined }} showActions={false} />
          <CandidateCard candidate={{ ...CANDIDATE, name: 'Priya Nair', matchPercentage: 64 }} selected onToggleSelect={() => undefined} showActions={false} />
        </Section>

        {/* ---------------- AVATARS ---------------- */}
        <Section title="14 · Avatars" note="Tint is a stable hash of the name — the API stores no avatar colour.">
          <Row>
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
              <Avatar key={size} name="Ananya Rao" size={size} />
            ))}
          </Row>
          <Row>
            <Avatar name="Sharma Kirana Store" size="lg" />
            <Avatar name="Rohit Menon" size="lg" />
            <Avatar name="Priya Nair" size="lg" />
            <Avatar name="Brew & Bite Café" size="lg" />
          </Row>
        </Section>

        {/* ---------------- SYSTEM STATES ---------------- */}
        <Section
          title="15 · System states"
          note="The wireframe 'System States & Feedback' reference set, verbatim — every product screen reuses these five blocks.">
          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Success — wireframe copy
          </Text>
          <Card padding="none">
            <SuccessState
              fill={false}
              title="Application Sent!"
              description="Sandesh, your application for 'Social Media Manager' has been delivered to the business owner."
              primaryLabel="View My Applications"
              onPrimary={() => undefined}
              secondaryLabel="Back to Home"
              onSecondary={() => undefined}
              secondaryAsLink
            />
          </Card>

          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Loading — label left, spinner right, skeleton blocks
          </Text>
          <Card>
            <InlineLoader label="Finding Nearby Gigs…" align="split" />
            <View style={{ gap: 12, marginTop: 12 }}>
              <Skeleton width="100%" height={110} radius="md" />
              <Skeleton width="100%" height={90} radius="md" />
              <Skeleton width="100%" height={64} radius="md" />
            </View>
          </Card>

          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Empty — 96dp well, outline action
          </Text>
          <Card padding="none">
            <EmptyState
              fill={false}
              wellSize="lg"
              icon="searchEmpty"
              title="No Gigs in Mumbai"
              description="We couldn't find any micro-gigs matching your current filters. Try expanding your radius."
              primaryVariant="outline"
              primaryLabel="Adjust Filters"
              onPrimary={() => undefined}
            />
          </Card>

          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Error — white card, red hairline, square tile, Retry link
          </Text>
          <ErrorState title="Connection Lost" description="Check your internet and try again." retryLabel="Retry" onRetry={() => undefined} />

          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Info banner — gradient per the washed-banner decision
          </Text>
          <Banner
            tone="brand"
            icon="shieldCheckFilled"
            title="Verification in Progress"
            description="Our team is reviewing your Student ID. This usually takes 24 hours."
          />

          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Further variants used across product screens
          </Text>
          <LoadingSkeleton count={2} variant="card" />
          <LoadingSkeleton count={2} variant="row" />

          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Empty
          </Text>
          <Card padding="none">
            <EmptyState
              title="No gigs match these filters"
              description="Try widening your radius or removing a skill filter — new gigs are posted every day."
              icon="searchEmpty"
              tone="brand"
              primaryLabel="Clear filters"
              onPrimary={() => undefined}
              secondaryLabel="Browse all gigs"
              onSecondary={() => undefined}
              fill={false}
            />
          </Card>
          <Card padding="none">
            <EmptyState
              title="No applications yet"
              description="Apply to 3 gigs this week to get your first verified review."
              icon="briefcase"
              primaryLabel="Discover gigs"
              onPrimary={() => undefined}
              fill={false}
            />
          </Card>

          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Error
          </Text>
          <ErrorState onRetry={() => undefined} />
          <Card padding="none">
            <ErrorState
              variant="screen"
              fill={false}
              title="Connection lost"
              description="We could not reach YuvaConnect. Your drafts are saved on this device."
              onRetry={() => undefined}
              secondaryLabel="Go back"
              onSecondary={() => undefined}
            />
          </Card>

          <Text variant="overline" tone="tertiary" uppercase style={g.subLabel}>
            Success
          </Text>
          <Card padding="none">
            <SuccessState
              fill={false}
              title="Application sent"
              description="Sharma Kirana Store usually responds within 24 hours. You'll be notified the moment they do."
              primaryLabel="Back to Discover"
              onPrimary={() => undefined}
              secondaryLabel="View my applications"
              onSecondary={() => undefined}
            />
          </Card>
        </Section>

        {/* ---------------- ICONOGRAPHY ---------------- */}
        <Section title="16 · Iconography" note="One family (Ionicons via @expo/vector-icons — already bundled). 130 semantic names in src/theme/icons.ts.">
          <View style={g.iconGrid}>
            {(
              [
                'home', 'discover', 'briefcase', 'chat', 'person', 'bell', 'bookmark', 'search', 'filter', 'mapPin',
                'clock', 'calendar', 'rupee', 'wallet', 'shieldCheck', 'verified', 'student', 'business', 'starFilled',
                'flashFilled', 'sparkles', 'send', 'upload', 'camera', 'checkCircleFilled', 'alertFilled', 'info',
                'offline', 'inbox', 'settings', 'logout', 'share',
              ] as const
            ).map((name) => (
              <View key={name} style={g.iconCell}>
                <Icon name={name} size={22} color={color.textPrimary} />
                <Text variant="caption" tone="tertiary" numberOfLines={1} style={{ fontSize: 9, marginTop: 4 }}>
                  {name}
                </Text>
              </View>
            ))}
          </View>
          <Row>
            <IconButton name="bookmark" accessibilityLabel="Save" onPress={() => undefined} variant="soft" />
            <IconButton name="share" accessibilityLabel="Share" onPress={() => undefined} variant="outline" />
            <IconButton name="bell" accessibilityLabel="Notifications" onPress={() => undefined} showDot />
            <IconButton name="trash" accessibilityLabel="Delete" onPress={() => undefined} color={color.danger} />
            <IconButton name="settings" accessibilityLabel="Disabled" disabled />
          </Row>
        </Section>

        {/* ---------------- ANATOMY ---------------- */}
        <Section title="17 · GigCard anatomy" note="The exact block rhythm every list screen must reproduce.">
          <Card>
            <View style={g.anatomyRow}>
              <View style={[g.anatomyBox, { width: layout.gigIconSize, height: layout.gigIconSize }]} />
              <View style={g.flex1}>
                <Text variant="caption" tone="tertiary">① business name + ② verified mark</Text>
                <Text variant="caption" tone="tertiary">③ bold gig title (2 lines max)</Text>
              </View>
              <View style={[g.anatomyBox, { width: 24, height: 24, borderRadius: 12 }]} />
            </View>
            <Text variant="caption" tone="tertiary">④ bookmark toggle (top-right)</Text>
            <Divider style={{ marginVertical: space.md }} />
            <Row>
              <SkillPill label="⑤ skill pill" size="sm" />
              <SkillPill label="+2 more" tone="neutral" size="sm" />
            </Row>
            <Divider style={{ marginVertical: space.md }} />
            <Text variant="caption" tone="tertiary">⑥ divider</Text>
            <View style={g.footerRow}>
              <Text variant="price">⑦ ₹2,500</Text>
              <Text variant="caption" tone="secondary">⑧ · 3 days</Text>
              <View style={g.flex1} />
              <Text variant="caption" tone="secondary">⑨ 2.1 km</Text>
              <Text variant="label" tone="brand">⑩ View Gig ›</Text>
            </View>
          </Card>
        </Section>

        <View style={g.footer}>
          <Text variant="caption" tone="tertiary" style={{ textAlign: 'center' }}>
            STEP 1 of Phase 7 · tokens in src/theme · components in src/components/ui · no product screen has been
            rebuilt yet.
          </Text>
        </View>
      </ScrollView>

      <BottomActionBar>
        <Button label="Back to app" variant="secondary" onPress={() => router.replace('/' as never)} style={g.flex1} />
        <Button label="Approve system" onPress={() => undefined} icon="checkCircleFilled" style={g.flex1} />
      </BottomActionBar>
    </SafeAreaView>
  );
}

const g = StyleSheet.create({
  safe: { flex: 1, backgroundColor: color.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: layout.screenGutter,
    paddingBottom: space['5xl'],
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },

  section: { marginTop: space['2xl'] },
  sectionHead: { marginBottom: space.md, gap: 2 },
  sectionBody: { gap: space.md },
  subLabel: { marginTop: space.md, marginBottom: space.sm },
  note: { marginBottom: space.sm },

  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rowWrap: { flexWrap: 'wrap' },
  stack: { gap: space.md },
  flex1: { flex: 1 },

  swatch: { width: 96, gap: 4 },
  swatchChip: { height: 40, borderRadius: radius.sm, borderWidth: 1 },

  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: color.divider,
  },
  typeSample: { flex: 1 },
  typeMeta: { alignItems: 'flex-end', gap: 1 },

  spaceSample: { alignItems: 'center', gap: 4, minWidth: 48 },
  radiusSample: { alignItems: 'center', gap: 6 },
  shadowSample: {
    width: 72,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  frame: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border,
    overflow: 'hidden',
    backgroundColor: color.surface,
  },

  inlineName: { flexDirection: 'row', alignItems: 'center' },

  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  iconCell: { width: 62, alignItems: 'center' },

  anatomyRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  anatomyBox: { borderRadius: radius.sm, borderWidth: 1.5, borderColor: color.primary, borderStyle: 'dashed', backgroundColor: color.primarySoft },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },

  footer: { marginTop: space['3xl'], paddingTop: space.lg, borderTopWidth: 1, borderTopColor: color.divider },
});
