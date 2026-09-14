/**
 * Student Home Dashboard — wireframe 11/37. Rebuild in place, route unchanged.
 *
 * Route: /(app)/home  ·  Spec: docs/wireframes/11-student-home.md
 *
 * The student branch is wireframe 11; the business branch is wireframe 27/37
 * (docs/wireframes/27-business-dashboard.md).
 *
 * Business data honesty:
 *  - Active Gigs / Applicants = real counts from GET /api/gigs/mine (gigInclude
 *    carries applications[]).
 *  - Active Workers + Total Spend are DERIVED client-side from the same real
 *    rows (gigs with a worker-status; payments with status RELEASED) — there is
 *    no business spend endpoint; both tiles say "derived" in their hint.
 *  - RECENT ACTIVITY = real listNotifications() rows, dot-coloured by type.
 *  - Sign-out link stays on the dashboard until the business profile rebuild
 *    (screen 36) ships its own — no branch of the app may trap a session.
 *
 * Data honesty:
 *  - Greeting = real user.name; bell badge = real listNotifications().unreadCount;
 *    verification banner = real StudentProfile.isVerified (pending state routes
 *    to /verify, verified shows a success strip).
 *  - Recommended Gigs = real listGigs() OPEN feed (no match-score column —
 *    "Recommended" is the wireframe label over the newest gigs, flagged).
 *  - "Near your campus" has no geo backend: approved pilot text-only
 *    treatment + flag, no fake map.
 *  - Search strip is a read-only launcher to /search (same pattern as 12/18).
 */
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  Banner,
  BottomTabBar,
  Button,
  EmptyState,
  ErrorState,
  GigCard,
  Icon,
  InfoBanner,
  LoadingSkeleton,
  Screen,
  ScreenHeader,
  SectionHeader,
  StatBox,
  StatusBadge,
  Text,
  TextLink,
} from '@/components/ui';
import { goBusinessTab, goStudentTab } from '@/lib/tab-nav';
import { BUSINESS_TABS, STUDENT_TABS } from '@/components/ui/BottomTabBar';
import { apiErrorMessage } from '@/config/api';
import { getMyGigs, listGigs } from '@/lib/gig-api';
import type { Gig, NotificationItem } from '@/types/api';
import { toGigCardData } from '@/lib/gig-card-data';
import { getProfile } from '@/lib/profile-api';
import { listNotifications } from '@/lib/trust-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

/* ---- Business dashboard helpers (wireframe 27) ---- */

const WORKING_STATUSES = ['ASSIGNED', 'IN_PROGRESS', 'REVISION_REQUESTED', 'SUBMITTED'];

const ACTIVITY_DOT: Record<string, string> = {
  NEW_APPLICANT: color.primary,
  APPLICATION_SELECTED: color.successStrong,
  APPLICATION_REJECTED: color.textTertiary,
  GIG_STATUS_CHANGED: color.successStrong,
  NEW_MESSAGE: color.primary,
  PAYMENT_RELEASED: color.successStrong,
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase();
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(diffMs / 60000));
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/** One ACTIVE GIGS card: title + status pill, deadline line, applicants/Manage row. */
function BusinessGigRow({ gig }: { gig: Gig }) {
  const isOpen = gig.status === 'OPEN';
  const applicants = gig.applications?.length ?? 0;
  const deadline = new Date(gig.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return (
    <View style={styles.bizGigCard}>
      <View style={styles.bizGigTop}>
        <Text variant="title3" numberOfLines={1} style={styles.bizGigTitle}>
          {gig.title}
        </Text>
        <StatusBadge label={isOpen ? 'Pending' : 'Active'} tone={isOpen ? 'neutral' : 'warning'} />
      </View>
      <View style={styles.bizGigMeta}>
        <Icon name="calendar" size={14} color={color.textTertiary} />
        <Text variant="caption" tone="tertiary">
          {`Deadline: ${deadline}`}
        </Text>
      </View>
      <View style={styles.bizGigDivider} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Manage applicants for ${gig.title}, ${applicants} applicants`}
        onPress={() => router.push(`/(business)/applicants/${gig.id}` as never)}
        style={({ pressed }) => [styles.bizGigManage, pressed && styles.pressed]}
        testID={`biz-gig-manage-${gig.id}`}>
        <Icon name="people" size={18} color={color.primary} />
        <Text variant="body" style={styles.bizGigApplicants}>
          {`${applicants} Applicants`}
        </Text>
        <Text variant="callout" style={styles.bizGigManageLabel}>
          Manage
        </Text>
        <Icon name="arrowForward" size={16} color={color.primary} />
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const { token, user, signOut } = useAuth();
  const isStudent = user?.role !== 'BUSINESS';

  const notificationsQuery = useQuery({
    queryKey: ['notifications', 'home-badge'],
    queryFn: () => listNotifications(token!, { limit: 1 }),
    enabled: !!token && isStudent,
    refetchInterval: 30000,
  });
  const profileQuery = useQuery({
    queryKey: ['profile', token],
    queryFn: () => getProfile(token!),
    enabled: !!token,
  });
  const gigsQuery = useQuery({
    queryKey: ['gigs', 'open', {}],
    queryFn: () => listGigs(token!, {}),
    enabled: !!token && isStudent,
  });
  const myGigsQuery = useQuery({
    queryKey: ['my-gigs', 'business', token],
    queryFn: () => getMyGigs(token!),
    enabled: !!token && !isStudent,
  });
  const activityQuery = useQuery({
    queryKey: ['notifications', 'business-activity', token],
    queryFn: () => listNotifications(token!, { limit: 5 }),
    enabled: !!token && !isStudent,
    refetchInterval: 30000,
  });

  if (!token || !user) {
    return (
      <Screen testID="screen-home-logged-out">
        <EmptyState
          title="Login to see your dashboard"
          description="Your recommended gigs and verification status live behind login."
          icon="person"
          primaryLabel="Login"
          onPrimary={() => router.replace('/login' as never)}
        />
      </Screen>
    );
  }

  /* ---------- Business dashboard (wireframe 27) ---------- */
  if (user.role === 'BUSINESS') {
    const businessProfile = profileQuery.data?.profile;
    const businessName = businessProfile && 'businessName' in businessProfile ? businessProfile.businessName : '';
    const myGigs = myGigsQuery.data?.gigs ?? [];
    const activeGigs = myGigs.filter((gig) => gig.status !== 'PAID' && gig.status !== 'CLOSED');
    const workerGigs = myGigs.filter((gig) => WORKING_STATUSES.includes(gig.status));
    const applicantCount = myGigs.reduce((sum, gig) => sum + (gig.applications?.length ?? 0), 0);
    const totalSpend = myGigs.reduce((sum, gig) => sum + (gig.payment?.status === 'RELEASED' ? Number(gig.payment.amount) || 0 : 0), 0);
    const activity = activityQuery.data?.notifications ?? [];

    const tabbar = <BottomTabBar items={BUSINESS_TABS} activeKey="home" onSelect={goBusinessTab} />;

    if (myGigsQuery.isLoading) {
      return (
        <Screen testID="screen-home-business">
          <View style={styles.bizBody}>
            <LoadingSkeleton count={3} />
          </View>
          {tabbar}
        </Screen>
      );
    }
    if (myGigsQuery.isError) {
      return (
        <Screen testID="screen-home-business">
          <View style={styles.bizBody}>
            <ErrorState
              title="Could not load your dashboard"
              description={apiErrorMessage(myGigsQuery.error)}
              onRetry={() => myGigsQuery.refetch()}
            />
          </View>
          {tabbar}
        </Screen>
      );
    }

    return (
      <Screen testID="screen-home-business">
        <ScrollView contentContainerStyle={styles.bizBody} showsVerticalScrollIndicator={false}>
          {/* Greeting header */}
          <View style={styles.bizHeaderRow}>
            <View style={styles.bizHeaderText}>
              <Text variant="title1">{`${greeting()}, ${businessName || 'there'} \u{1F44B}`}</Text>
              <Text variant="body" tone="secondary">
                Find the right local talent for your next task.
              </Text>
            </View>
            <View style={styles.bizInitials} accessibilityLabel={businessName || 'Business'}>
              <Text variant="title3" style={styles.bizInitialsText}>
                {initialsOf(businessName || user.name)}
              </Text>
            </View>
          </View>

          {/* 2x2 KPI tiles — counts are real; workers + spend are derived (hinted) */}
          <View style={styles.bizStatGrid}>
            <StatBox variant="tinted" tone="brand" icon="briefcase" value={pad2(activeGigs.length)} label="Active Gigs" style={styles.bizStat} testID="biz-stat-gigs" />
            <StatBox variant="tinted" tone="brand" icon="people" value={pad2(applicantCount)} label="Applicants" style={styles.bizStat} testID="biz-stat-applicants" />
            <StatBox variant="tinted" tone="success" icon="clipboard" value={pad2(workerGigs.length)} label="Active Workers" hint="derived" style={styles.bizStat} testID="biz-stat-workers" />
            <StatBox
              variant="tinted"
              tone="success"
              icon="wallet"
              value={`\u20B9${Math.round(totalSpend).toLocaleString('en-IN')}`}
              label="Total Spend"
              hint="released \u00B7 derived"
              style={styles.bizStat}
              testID="biz-stat-spend"
            />
          </View>

          <Banner
            tone="brand"
            icon="rocket"
            title="Need help with a task?"
            description="Post a new micro-gig and reach verified students nearby."
            onPress={() => router.push('/(business)/post-gig' as never)}
            testID="biz-post-banner"
          />

          {/* Active gigs */}
          <SectionHeader title="ACTIVE GIGS" actionLabel="View All" onAction={() => router.push('/(business)/my-gigs' as never)} />
          {activeGigs.length === 0 ? (
            <EmptyState
              title="No active gigs"
              description="Post your first micro-gig and verified local students can apply within minutes."
              icon="briefcase"
              primaryLabel="Post a Gig"
              onPrimary={() => router.push('/(business)/post-gig' as never)}
            />
          ) : (
            activeGigs.slice(0, 3).map((gig) => <BusinessGigRow key={gig.id} gig={gig} />)
          )}

          {/* Recent activity — real notifications */}
          <SectionHeader title="RECENT ACTIVITY" />
          {activity.length === 0 ? (
            <Text variant="body" tone="tertiary" style={styles.bizQuiet}>
              No activity yet — applicant and status updates will appear here.
            </Text>
          ) : (
            <View style={styles.bizActivityCard}>
              {activity.map((item, index) => (
                <View key={item.id} style={[styles.bizActivityRow, index > 0 && styles.bizActivityDivider]}>
                  <View style={[styles.bizDot, { backgroundColor: ACTIVITY_DOT[item.type] ?? color.textTertiary }]} />
                  <Text variant="body" numberOfLines={2} style={styles.bizActivityText}>
                    {item.message}
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    {timeAgo(item.createdAt)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Session escape hatch until screen 36 ships business-profile sign-out */}
          <View style={styles.bizSignOut}>
            <TextLink
              label="Sign out"
              iconRight={null}
              onPress={async () => {
                await signOut();
                router.replace('/login' as never);
              }}
            />
          </View>
          <View style={styles.bizFabSpacer} />
        </ScrollView>

        {/* FAB */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Post a Gig"
          onPress={() => router.push('/(business)/post-gig' as never)}
          style={({ pressed }) => [styles.bizFab, pressed && styles.pressed]}
          testID="biz-fab">
          <Icon name="add" size={18} color={color.surface} />
          <Text variant="callout" style={styles.bizFabLabel}>
            Post a Gig
          </Text>
        </Pressable>

        {tabbar}
      </Screen>
    );
  }

  /* ---------- Student dashboard (wireframe 11) ---------- */
  const firstName = user.name.split(' ')[0] || user.name;
  const unread = notificationsQuery.data?.unreadCount ?? 0;
  const profile = profileQuery.data?.profile;
  const isVerified = profile && 'isVerified' in profile ? profile.isVerified : false;
  const gigs = gigsQuery.data ?? [];

  return (
    <Screen testID="screen-home">
      {/* --- Greeting + bell --- */}
      <View style={styles.topBar}>
        <View style={styles.greeting}>
          <Text variant="title1">Hi, {firstName} 👋</Text>
          <Text variant="body" tone="secondary">
            Let's find your next gig
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Notifications${unread ? `, ${unread} unread` : ''}`}
          onPress={() => router.push('/notifications' as never)}
          style={({ pressed }) => [styles.bell, pressed && styles.pressed]}>
          <Icon name="bell" size={24} color={color.textPrimary} />
          {unread > 0 ? (
            <View style={styles.badge}>
              <Text variant="captionStrong" style={styles.badgeText}>
                {unread > 9 ? '9+' : unread}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* --- Search launcher strip --- */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Search by skill, company or location"
          onPress={() => router.push('/search' as never)}
          style={({ pressed }) => [styles.searchStrip, pressed && styles.pressed]}>
          <Icon name="search" size={18} color={color.textSecondary} />
          <Text variant="body" tone="secondary">
            Search by skill, company or location...
          </Text>
        </Pressable>

        {/* --- Verification banner: real isVerified --- */}
        {isVerified ? (
          <InfoBanner tone="success" icon="shieldCheckFilled" title="You're verified" description="Businesses can see your verified badge on your profile and applications." />
        ) : (
          <Banner
            tone="brand"
            icon="shieldCheckFilled"
            title="Verification In Progress"
            description="Complete your profile & upload college ID to start earning."
            actionLabel="Complete Now"
            onAction={() => router.push('/verify' as never)}
          />
        )}

        {/* --- Recommended Gigs rail --- */}
        <View style={styles.section}>
          <SectionHeader title="Recommended Gigs" actionLabel="View All" onAction={() => router.push('/(student)/feed' as never)} />
          {gigsQuery.isLoading ? (
            <LoadingSkeleton count={2} variant="card" />
          ) : gigsQuery.isError ? (
            <ErrorState title="Could not load gigs" description={apiErrorMessage(gigsQuery.error)} retryLabel="Retry" onRetry={() => gigsQuery.refetch()} />
          ) : gigs.length === 0 ? (
            <EmptyState title="No open gigs right now" description="New micro-gigs appear as businesses post them — check back soon." icon="searchEmpty" />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
              {gigs.slice(0, 8).map((gig) => (
                <View key={gig.id} style={styles.railCard}>
                  <GigCard gig={toGigCardData(gig)} onPress={() => router.push(`/(student)/gig/${gig.id}` as never)} />
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* --- Near your campus: text-only pilot treatment --- */}
        <View style={styles.section}>
          <SectionHeader title="Near your campus 📍" />
          <View style={styles.campusCard}>
            <Icon name="locateFilled" size={22} color={color.primary} />
            <View style={styles.campusCopy}>
              <Text variant="calloutStrong">Campus proximity is text-only in the pilot</Text>
              <Text variant="caption" tone="secondary">
                No geo backend exists yet, so location sorting ships with geo support. Use the Search screen's Remote filter in the meantime.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomTabBar items={STUDENT_TABS} activeKey="home" onSelect={goStudentTab} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.xl,
    paddingBottom: space.md,
  },
  greeting: { flex: 1, gap: space.xs },
  bell: { padding: space.sm },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: color.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: color.textInverse, fontSize: 10, lineHeight: 12 },
  pressed: { opacity: 0.8 },

  content: {
    paddingHorizontal: layout.screenGutter,
    gap: space.xl,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: space['2xl'],
  },

  searchStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    paddingHorizontal: space.base,
    paddingVertical: space.base,
  },

  section: { gap: space.md },
  rail: { gap: space.md, paddingRight: space.md },
  railCard: { width: 300 },

  campusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.base,
  },
  campusCopy: { flex: 1, gap: space.xs },

  placeholder: { padding: layout.screenGutter, gap: space.md, maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center' },
  /* ---- Business dashboard (wireframe 27) ---- */
  bizBody: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.base,
    paddingBottom: space['2xl'],
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  bizHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: space.base },
  bizHeaderText: { flex: 1, gap: space.xs },
  bizInitials: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bizInitialsText: { color: color.primary },
  bizStatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  bizStat: { flexGrow: 1, flexBasis: '44%' },
  bizQuiet: { paddingHorizontal: space.xs },
  bizActivityCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border,
    paddingHorizontal: space.base,
  },
  bizActivityRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.md },
  bizActivityDivider: { borderTopWidth: 1, borderTopColor: color.divider },
  bizDot: { width: 8, height: 8, borderRadius: 4 },
  bizActivityText: { flex: 1, lineHeight: 20 },
  bizGigCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.border,
    padding: space.base,
    gap: space.sm,
  },
  bizGigTop: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  bizGigTitle: { flex: 1 },
  bizGigMeta: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  bizGigDivider: { height: 1, backgroundColor: color.divider },
  bizGigManage: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  bizGigApplicants: { flex: 1 },
  bizGigManageLabel: { color: color.primary, fontWeight: '700' },
  bizSignOut: { alignItems: 'center', paddingTop: space.md },
  bizFabSpacer: { height: space['3xl'] },
  bizFab: {
    position: 'absolute',
    right: layout.screenGutter,
    bottom: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: color.primary,
    borderRadius: radius.full,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    ...shadow.lg,
  },
  bizFabLabel: { color: color.surface, fontWeight: '700' },
});