/**
 * Student Home Dashboard — wireframe 11/37. Rebuild in place, route unchanged.
 *
 * Route: /(app)/home  ·  Spec: docs/wireframes/11-student-home.md
 *
 * The student branch is the wireframe dashboard; the business branch keeps a
 * working placeholder on the new system until screen 27 rebuilds it.
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
  Text,
} from '@/components/ui';
import { goStudentTab } from '@/lib/tab-nav';
import { STUDENT_TABS } from '@/components/ui/BottomTabBar';
import { apiErrorMessage } from '@/config/api';
import { listGigs } from '@/lib/gig-api';
import { toGigCardData } from '@/lib/gig-card-data';
import { getProfile } from '@/lib/profile-api';
import { listNotifications } from '@/lib/trust-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

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
    enabled: !!token && isStudent,
  });
  const gigsQuery = useQuery({
    queryKey: ['gigs', 'open', {}],
    queryFn: () => listGigs(token!, {}),
    enabled: !!token && isStudent,
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

  /* ---------- Business placeholder (rebuilt on screen 27) ---------- */
  if (user.role === 'BUSINESS') {
    return (
      <Screen testID="screen-home-business-placeholder">
        <ScreenHeader title="YuvaConnect" subtitle="Business account" />
        <ScrollView contentContainerStyle={styles.placeholder}>
          <InfoBanner
            tone="info"
            icon="info"
            title="Business dashboard ships with screen 27"
            description="This placeholder keeps every business route reachable until the wireframe rebuild lands."
          />
          <Button label="Post a gig" onPress={() => router.push('/(business)/post-gig' as never)} />
          <Button label="My gigs" variant="secondary" onPress={() => router.push('/(business)/my-gigs' as never)} />
          <Button label="Notifications" variant="secondary" onPress={() => router.push('/notifications' as never)} />
          <Button label="Business profile" variant="secondary" onPress={() => router.push('/(business)/profile' as never)} />
          <Button
            label="Sign out"
            variant="secondary"
            onPress={async () => {
              await signOut();
              router.replace('/login' as never);
            }}
          />
        </ScrollView>
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
});
