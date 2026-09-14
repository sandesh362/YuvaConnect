/**
 * My Applications — wireframe 16/37. Rebuild in place, route unchanged.
 *
 * Route: /(student)/my-gigs  ·  Spec: docs/wireframes/16-my-applications.md
 *
 * Data honesty:
 *  - Real applications from getMyGigs(); status pill derives from the REAL
 *    Application.status + gig lifecycle (Applied / Shortlisted / Active /
 *    Completed / Rejected).
 *  - Progress % has no column → DERIVED from the lifecycle (IN_PROGRESS 50,
 *    REVISION_REQUESTED 60, SUBMITTED 75) and only shown on Active cards;
 *    derivation documented here and in the spec.
 *  - "Withdraw" exists only on the dead Mongoose router → link renders per
 *    wireframe, tap explains (flag, never fake).
 *  - "Open Tracker" points at screen 17 (/tracker/[gigId]) — visible, quiet
 *    no-op until it ships (tab-bar rule).
 *  - Verified-Business row has no isVerified field → the location caption
 *    variant of the wireframe card is used instead (it is drawn too).
 */
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  Avatar,
  BottomTabBar,
  Divider,
  EmptyState,
  ErrorState,
  Icon,
  InfoBanner,
  LoadingSkeleton,
  ProgressBar,
  Screen,
  ScreenHeader,
  SelectableChip,
  StatusBadge,
  Text,
  TextLink,
} from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { getMyGigs } from '@/lib/gig-api';
import { goStudentTab } from '@/lib/tab-nav';
import { STUDENT_TABS } from '@/components/ui/BottomTabBar';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { Application } from '@/types/api';

const COMPLETED = ['APPROVED', 'PAID', 'CLOSED'];
const ACTIVE_GIG = ['IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED'];

type CardStatus = 'Applied' | 'Shortlisted' | 'Active' | 'Completed' | 'Rejected';
const FILTERS: (CardStatus | 'All')[] = ['All', 'Applied', 'Shortlisted', 'Active', 'Completed'];

const TONE: Record<CardStatus, 'info' | 'warning' | 'success' | 'neutral' | 'danger'> = {
  Applied: 'info',
  Shortlisted: 'warning',
  Active: 'success',
  Completed: 'neutral',
  Rejected: 'danger',
};

/** Derived lifecycle progress — there is no % column (flagged). */
const PROGRESS: Record<string, number> = { IN_PROGRESS: 50, REVISION_REQUESTED: 60, SUBMITTED: 75 };

function cardStatus(application: Application): CardStatus {
  const gigStatus = application.gig?.status;
  if (gigStatus && COMPLETED.includes(gigStatus)) return 'Completed';
  if (gigStatus && ACTIVE_GIG.includes(gigStatus)) return 'Active';
  if (application.status === 'SELECTED' || application.status === 'SHORTLISTED') return 'Shortlisted';
  if (application.status === 'REJECTED') return 'Rejected';
  return 'Applied';
}

function appliedLabel(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'Applied today';
  if (days === 1) return 'Applied yesterday';
  return `Applied on ${new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
}

export default function MyApplicationsScreen() {
  const { token } = useAuth();
  const [filter, setFilter] = useState<CardStatus | 'All'>('All');
  const [notice, setNotice] = useState<string | null>(null);

  const query = useQuery({ queryKey: ['my-gigs'], queryFn: () => getMyGigs(token!), enabled: !!token });
  const applications = useMemo(() => query.data?.applications ?? [], [query.data]);

  const visible = useMemo(
    () =>
      applications
        .filter((application) => filter === 'All' || cardStatus(application) === filter)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [applications, filter],
  );

  return (
    <Screen testID="screen-my-applications">
      <ScreenHeader
        title="My Applications"
        subtitle="Track your progress and earnings"
        actions={[{ icon: 'bell', accessibilityLabel: 'Notifications', onPress: () => router.push('/notifications' as never) }]}
      />

      {/* --- Check-mark filter rail (style 2) --- */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        <Pressable
          accessibilityRole="radio"
          accessibilityLabel="All applications"
          accessibilityState={{ selected: filter === 'All' }}
          onPress={() => setFilter('All')}
          style={styles.allChip}>
          <Icon name="check" size={15} color={color.textPrimary} />
          <Text variant="calloutStrong">All</Text>
        </Pressable>
        {(FILTERS.slice(1) as CardStatus[]).map((item) => (
          <SelectableChip key={item} label={item} selected={filter === item} indicator="none" onToggle={() => setFilter(filter === item ? 'All' : item)} />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {notice ? <InfoBanner tone="info" icon="info" title="Flagged, not faked" description={notice} /> : null}

        {!token ? (
          <EmptyState title="Login to see your applications" icon="clipboard" primaryLabel="Login" onPrimary={() => router.replace('/login' as never)} />
        ) : query.isLoading ? (
          <LoadingSkeleton count={3} variant="card" />
        ) : query.isError ? (
          <ErrorState title="Could not load applications" description={apiErrorMessage(query.error)} retryLabel="Retry" onRetry={() => query.refetch()} />
        ) : visible.length === 0 ? (
          <EmptyState
            title={filter === 'All' ? 'No applications yet' : `No ${filter.toLowerCase()} applications`}
            description={filter === 'All' ? 'Apply to a gig and track every application here.' : 'Try another filter — your other applications are one tap away.'}
            icon="clipboard"
            primaryLabel="Discover gigs"
            onPrimary={() => router.push('/(student)/feed' as never)}
          />
        ) : (
          visible.map((application) => {
            const status = cardStatus(application);
            const gig = application.gig;
            const businessName = gig?.business?.businessProfile?.businessName ?? gig?.business?.name ?? 'Local business';
            const applicantCount = gig?.applications?.length;
            return (
              <View key={application.id} style={[styles.card, status === 'Active' && styles.cardActive]}>
                <View style={styles.cardHead}>
                  <Avatar name={businessName} size="md" tone={status === 'Active' ? color.successSoft : color.primarySoft} />
                  <View style={styles.cardHeadCopy}>
                    <Text variant="calloutStrong" numberOfLines={1}>
                      {businessName}
                    </Text>
                    <Text variant="caption" tone="secondary" numberOfLines={1}>
                      {gig?.location ?? '—'}
                    </Text>
                  </View>
                  <StatusBadge label={status} tone={TONE[status]} size="sm" />
                </View>

                <Text variant="title3" numberOfLines={2}>
                  {gig?.title ?? 'Gig'}
                </Text>
                <Text variant="caption" tone="secondary">
                  {appliedLabel(application.createdAt)}
                  {gig ? ` • Due ${new Date(gig.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}` : ''}
                  {applicantCount ? ` • ${applicantCount} applicants` : ''}
                </Text>

                {status === 'Active' && gig ? (
                  <ProgressBar
                    value={PROGRESS[gig.status] ?? 50}
                    tone="success"
                    showValue
                    label="Work progress"
                    style={styles.progress}
                  />
                ) : null}

                <Divider style={styles.divider} />

                <View style={styles.cardFooter}>
                  <View style={styles.budget}>
                    <Text variant="captionStrong" tone="secondary">
                      Budget
                    </Text>
                    <Text variant="title3" tone="brand">
                      {gig ? `₹${Number(gig.budget).toLocaleString()}` : '—'}
                    </Text>
                  </View>
                  <View style={styles.actions}>
                    {status === 'Completed' ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Rate this gig"
                        onPress={() => router.push(`/rate/${application.gigId}` as never)}
                        style={({ pressed }) => [styles.pillSolid, pressed && styles.pressed]}>
                        <Text variant="captionStrong" style={styles.pillSolidText}>
                          Rate Gig
                        </Text>
                      </Pressable>
                    ) : status === 'Active' ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Open tracker"
                        onPress={() => undefined} // screen 17 ships /tracker/[gigId]
                        style={({ pressed }) => [styles.pillSolid, pressed && styles.pressed]}>
                        <Text variant="captionStrong" style={styles.pillSolidText}>
                          Open Tracker
                        </Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="View status"
                        onPress={() => router.push(`/(student)/gig/${application.gigId}` as never)}
                        style={({ pressed }) => [styles.pillOutline, pressed && styles.pressed]}>
                        <Text variant="captionStrong" tone="brand">
                          View Status
                        </Text>
                      </Pressable>
                    )}
                    {status === 'Applied' || status === 'Shortlisted' ? (
                      <TextLink
                        label="Withdraw"
                        tone="danger"
                        iconRight={null}
                        onPress={() =>
                          setNotice('Withdraw exists only on the retired prototype router — the live API has no withdraw endpoint, so the link is shown but cannot act yet. Flagged, not faked.')
                        }
                      />
                    ) : null}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <BottomTabBar items={STUDENT_TABS} activeKey="mygigs" onSelect={goStudentTab} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rail: { gap: space.md, paddingHorizontal: layout.screenGutter, paddingVertical: space.md, alignItems: 'center' },
  allChip: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.sm },

  content: {
    paddingHorizontal: layout.screenGutter,
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: space['2xl'],
  },

  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.base,
    gap: space.sm,
  },
  cardActive: { borderWidth: 1.5, borderColor: color.primary },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  cardHeadCopy: { flex: 1, gap: 2 },

  progress: { marginTop: space.xs },
  divider: { marginVertical: space.xs },

  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  budget: { gap: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: space.base },

  pillOutline: {
    borderWidth: 1,
    borderColor: color.primary,
    borderRadius: radius.full,
    paddingHorizontal: space.base,
    paddingVertical: space.sm,
  },
  pillSolid: {
    backgroundColor: color.primary,
    borderRadius: radius.full,
    paddingHorizontal: space.base,
    paddingVertical: space.sm,
  },
  pillSolidText: { color: color.textInverse },
  pressed: { opacity: 0.8 },
});
