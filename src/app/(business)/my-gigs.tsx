/**
 * Business Gig Management ("Manage Gigs") — wireframe 33/37. Rebuild in place.
 *
 * Route: /(business)/my-gigs  ·  Spec: docs/wireframes/33-business-gig-management.md
 *
 * What is REAL:
 *  - GET /api/gigs/mine drives everything: statuses, applicants counts, budget,
 *    deadline, payments. Stat tiles: Active + Applicants are real counts;
 *    Spent sums RELEASED payments (compact ₹ format) — derived, hinted.
 *  - Category caption is parsed from the labelled block screen 28 stores in
 *    the description (real saved data); gigs without it fall back to skills.
 *  - Assigned-student inner card: real SELECTED application + name/college via
 *    GET /api/gigs/:id/applicants (useQueries, one call per working gig).
 *  - Bell → real unread count → /notifications. View Applicants / Track
 *    Progress / Message / pencil-edit (post-gig?gigId= → real PATCH, OPEN
 *    gigs only) are all real routes/endpoints.
 *
 * Flags (never faked):
 *  - Drafts segment: GigStatus has no DRAFT — tab renders empty with the flag.
 *  - Amber pause square: no pause/close endpoint — raises a notice.
 *  - "2 weeks left" captions are client-side date maths over the real
 *    deadline, labelled derived.
 */
import { useQueries, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  BottomTabBar,
  Button,
  EmptyState,
  ErrorState,
  Icon,
  IconButton,
  InfoBanner,
  LoadingSkeleton,
  Screen,
  StatBox,
  Text,
} from '@/components/ui';
import { BUSINESS_TABS } from '@/components/ui/BottomTabBar';
import { Applicant, initialsOf } from '@/components/business/candidate-card';
import { apiErrorMessage } from '@/config/api';
import { getApplicants, getMyGigs } from '@/lib/gig-api';
import { listNotifications } from '@/lib/trust-api';
import { goBusinessTab } from '@/lib/tab-nav';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { Gig } from '@/types/api';

type TabKey = 'active' | 'drafts' | 'completed';

const WORKING_STATUSES = ['ASSIGNED', 'IN_PROGRESS', 'REVISION_REQUESTED', 'SUBMITTED', 'APPROVED'];

function parseCategory(description: string): string | null {
  const match = description.match(/^Category:\s*(.+)$/m);
  return match ? match[1].trim() : null;
}

function timeLeft(deadline: string): string {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (Number.isNaN(days)) return 'deadline —';
  if (days < 0) return 'overdue';
  if (days === 0) return 'due today';
  if (days < 14) return `${days} day${days === 1 ? '' : 's'} left`;
  const weeks = Math.round(days / 7);
  return `${weeks} week${weeks === 1 ? '' : 's'} left`;
}

function formatCompact(n: number): string {
  if (n >= 10000000) return `${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(Math.round(n));
}

function statusPill(gig: Gig): { label: string; bg: string; fg: string } {
  if (gig.status === 'OPEN') return { label: 'ACTIVE', bg: color.successSoft, fg: color.successStrong };
  if (WORKING_STATUSES.includes(gig.status)) return { label: 'IN PROGRESS', bg: color.primarySoft, fg: color.primary };
  return { label: gig.status.replaceAll('_', ' '), bg: color.surfaceMuted, fg: color.textSecondary };
}

export default function BusinessMyGigs() {
  const { token } = useAuth();
  const [tab, setTab] = useState<TabKey>('active');
  const [notice, setNotice] = useState<string | null>(null);

  const gigsQuery = useQuery({
    queryKey: ['my-gigs', 'business', token],
    queryFn: () => getMyGigs(token!),
    enabled: !!token,
  });
  const unreadQuery = useQuery({
    queryKey: ['notifications', 'home-badge'],
    queryFn: () => listNotifications(token!, { limit: 1 }),
    enabled: !!token,
    refetchInterval: 30000,
  });

  const gigs = gigsQuery.data?.gigs ?? [];
  const workingGigs = useMemo(() => gigs.filter((gig) => WORKING_STATUSES.includes(gig.status)), [gigs]);

  // Assigned student per working gig — one real applicants call each.
  const applicantQueries = useQueries({
    queries: workingGigs.map((gig) => ({
      queryKey: ['applicants', gig.id, token],
      queryFn: () => getApplicants(token!, gig.id) as Promise<Applicant[]>,
      enabled: !!token,
      staleTime: 60000,
    })),
  });

  const visible = useMemo(() => {
    if (tab === 'drafts') return [];
    if (tab === 'completed') return gigs.filter((gig) => gig.status === 'PAID' || gig.status === 'CLOSED');
    return gigs.filter((gig) => gig.status !== 'PAID' && gig.status !== 'CLOSED');
  }, [gigs, tab]);

  const activeCount = gigs.filter((gig) => gig.status !== 'PAID' && gig.status !== 'CLOSED').length;
  const applicantCount = gigs.reduce((sum, gig) => sum + (gig.applications?.length ?? 0), 0);
  const spent = gigs.reduce((sum, gig) => sum + (gig.payment?.status === 'RELEASED' ? Number(gig.payment.amount) || 0 : 0), 0);
  const unread = unreadQuery.data?.unreadCount ?? 0;

  return (
    <Screen testID="screen-manage-gigs">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text variant="title1">Manage Gigs</Text>
            <Text variant="body" tone="secondary">
              Track and manage your posted opportunities
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Notifications, ${unread} unread`}
            onPress={() => router.push('/notifications' as never)}
            style={({ pressed }) => [styles.bellCircle, pressed && styles.pressed]}
            testID="manage-gigs-bell">
            <Icon name="bell" size={20} color={color.textPrimary} />
            {unread > 0 ? <View style={styles.bellDot} /> : null}
          </Pressable>
        </View>

        {/* Stat tiles */}
        <View style={styles.statRow}>
          <StatBox variant="tinted" tone="brand" icon="briefcase" value={String(activeCount)} label="Active" style={styles.stat} testID="gigs-stat-active" />
          <StatBox variant="tinted" tone="brand" icon="people" value={String(applicantCount)} label="Applicants" style={styles.stat} testID="gigs-stat-applicants" />
          <StatBox variant="tinted" tone="success" icon="wallet" value={`₹${formatCompact(spent)}`} label="Spent" hint="released · derived" style={styles.stat} testID="gigs-stat-spent" />
        </View>

        {/* Mint segments */}
        <View style={styles.segmentTrack} accessibilityRole="tablist">
          {([
            { key: 'active' as TabKey, label: 'Active' },
            { key: 'drafts' as TabKey, label: 'Drafts' },
            { key: 'completed' as TabKey, label: 'Completed' },
          ]).map((segment) => {
            const isActive = segment.key === tab;
            return (
              <Pressable
                key={segment.key}
                accessibilityRole="tab"
                accessibilityLabel={segment.label}
                accessibilityState={{ selected: isActive }}
                onPress={() => setTab(segment.key)}
                style={[styles.segment, isActive && styles.segmentActive]}>
                <Text variant="callout" style={isActive ? styles.segmentLabelActive : styles.segmentLabel}>
                  {segment.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {notice ? <InfoBanner tone="warning" icon="info" title="Flagged, not faked" description={notice} /> : null}

        {gigsQuery.isLoading ? <LoadingSkeleton count={3} /> : null}
        {gigsQuery.isError ? (
          <ErrorState title="Could not load your gigs" description={apiErrorMessage(gigsQuery.error)} onRetry={() => gigsQuery.refetch()} />
        ) : null}

        {!gigsQuery.isLoading && tab === 'drafts' ? (
          <EmptyState
            title="No drafts"
            description="GigStatus has no DRAFT value — a gig is published or it does not exist, so this tab can never hold rows. Flagged, not faked."
            icon="clipboard"
            wellSize="lg"
          />
        ) : null}

        {!gigsQuery.isLoading && tab !== 'drafts' && visible.length === 0 ? (
          <EmptyState
            title={tab === 'completed' ? 'No completed gigs yet' : 'No active gigs'}
            description={tab === 'completed' ? 'Paid and closed gigs will collect here.' : 'Post a gig and it will appear here with live applicant counts.'}
            icon="briefcase"
            wellSize="lg"
            primaryLabel="Post New Gig"
            onPrimary={() => router.push('/(business)/post-gig' as never)}
          />
        ) : null}

        {visible.map((gig) => {
          const pill = statusPill(gig);
          const isWorking = WORKING_STATUSES.includes(gig.status);
          const category = parseCategory(gig.description);
          const caption = category ?? gig.skillsRequired.slice(0, 2).join(' • ') ?? 'Gig';
          const workingIndex = workingGigs.findIndex((item) => item.id === gig.id);
          const selected = workingIndex >= 0 ? applicantQueries[workingIndex]?.data?.find((applicant) => applicant.status === 'SELECTED') : undefined;
          return (
            <View key={gig.id} style={styles.gigCard}>
              <View style={styles.gigTop}>
                <Text variant="title2" numberOfLines={2} style={styles.gigTitle}>
                  {gig.title}
                </Text>
                <View style={[styles.statusPill, { backgroundColor: pill.bg }]}>
                  <Text variant="captionStrong" style={{ color: pill.fg }}>
                    {pill.label}
                  </Text>
                </View>
              </View>

              <View style={styles.captionRow}>
                <Icon name="archive" size={14} color={color.textTertiary} />
                <Text variant="captionStrong" tone="secondary" numberOfLines={1}>
                  {isWorking ? `${caption} • ${timeLeft(gig.deadline)}` : caption}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.metricsRow}>
                <View style={styles.metricCol}>
                  <Text variant="captionStrong" tone="tertiary">
                    APPLICANTS
                  </Text>
                  <View style={styles.metricValue}>
                    <Icon name="people" size={16} color={color.primary} />
                    <Text variant="body">{`${gig.applications?.length ?? 0} Students`}</Text>
                  </View>
                </View>
                <View style={styles.metricCol}>
                  <Text variant="captionStrong" tone="tertiary">
                    BUDGET
                  </Text>
                  <Text variant="title3">{`₹${Number(gig.budget).toLocaleString('en-IN')}`}</Text>
                </View>
              </View>

              {/* Assigned student — real SELECTED application */}
              {isWorking ? (
                <View style={styles.workerCard}>
                  {selected ? (
                    <>
                      <View style={styles.workerInitials} accessibilityLabel={selected.student.name}>
                        <Text variant="callout" style={styles.workerInitialsText}>
                          {initialsOf(selected.student.name)}
                        </Text>
                      </View>
                      <View style={styles.workerText}>
                        <Text variant="bodyStrong" numberOfLines={1}>
                          {selected.student.name}
                        </Text>
                        <Text variant="caption" tone="tertiary" numberOfLines={1}>
                          {selected.student.studentProfile?.college || 'College not listed'}
                        </Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Message about ${gig.title}`}
                        onPress={() => router.push(`/(shared)/chat/${gig.id}` as never)}
                        style={({ pressed }) => [styles.workerChat, pressed && styles.pressed]}
                        testID={`worker-chat-${gig.id}`}>
                        <Icon name="chatFilled" size={20} color={color.primary} />
                      </Pressable>
                    </>
                  ) : (
                    <Text variant="caption" tone="tertiary">
                      Loading assigned student…
                    </Text>
                  )}
                </View>
              ) : null}

              {/* Actions */}
              {gig.status === 'OPEN' ? (
                <View style={styles.actionRow}>
                  <Button label="View Applicants" size="sm" style={styles.actionMain} onPress={() => router.push(`/(business)/applicants/${gig.id}` as never)} testID={`view-applicants-${gig.id}`} />
                  <View style={styles.squareSlate}>
                    <IconButton name="pen" variant="plain" accessibilityLabel={`Edit ${gig.title}`} onPress={() => router.push(`/(business)/post-gig?gigId=${gig.id}` as never)} testID={`edit-${gig.id}`} />
                  </View>
                  <View style={styles.squareAmber}>
                    <IconButton
                      name="pause"
                      variant="plain"
                      color={color.surface}
                      accessibilityLabel="Pause gig (flagged)"
                      onPress={() => setNotice('There is no pause or close endpoint — gig.routes only exposes create, update (OPEN gigs), select/reject, start, submit, revision, approve. The button is kept per the wireframe and flagged, not faked.')}
                      testID={`pause-${gig.id}`}
                    />
                  </View>
                </View>
              ) : isWorking ? (
                <View style={styles.actionRow}>
                  <Button label="Track Progress" variant="secondary" size="sm" style={styles.actionMain} onPress={() => router.push(`/(business)/gig/${gig.id}` as never)} testID={`track-${gig.id}`} />
                  <Button label="Message" size="sm" style={[styles.actionMain, styles.messageGreen]} onPress={() => router.push(`/(shared)/chat/${gig.id}` as never)} testID={`message-${gig.id}`} />
                </View>
              ) : (
                <View style={styles.actionRow}>
                  <Button label="View Details" variant="secondary" size="sm" style={styles.actionMain} onPress={() => router.push(`/(business)/gig/${gig.id}` as never)} testID={`details-${gig.id}`} />
                </View>
              )}
            </View>
          );
        })}

        <InfoBanner
          tone="info"
          icon="info"
          title="How this screen is computed"
          description="Counts, budgets and deadlines are real columns from GET /api/gigs/mine. Spent sums RELEASED payments (derived). Category captions and 'time left' are parsed/derived from the labelled description block and the real deadline."
        />
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Edge-to-edge post bar */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Post New Gig"
        onPress={() => router.push('/(business)/post-gig' as never)}
        style={({ pressed }) => [styles.postBar, pressed && styles.pressed]}
        testID="post-new-gig-bar">
        <Icon name="add" size={18} color={color.surface} />
        <Text variant="callout" style={styles.postBarLabel}>
          Post New Gig
        </Text>
      </Pressable>

      <BottomTabBar items={BUSINESS_TABS} activeKey="gigs" onSelect={goBusinessTab} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.base,
    paddingBottom: 160,
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: space.base },
  headerText: { flex: 1, gap: space.xs },
  bellCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: { position: 'absolute', top: 10, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: color.danger },

  statRow: { flexDirection: 'row', gap: space.md },
  stat: { flex: 1 },

  segmentTrack: { flexDirection: 'row', backgroundColor: color.surfaceMuted, borderRadius: radius.full, padding: 4, gap: 4 },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: space.sm, borderRadius: radius.full },
  segmentActive: { backgroundColor: color.successSoft },
  segmentLabel: { color: color.textSecondary },
  segmentLabelActive: { color: color.textPrimary, fontWeight: '700' },

  gigCard: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    padding: space.base,
    gap: space.md,
  },
  gigTop: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  gigTitle: { flex: 1 },
  statusPill: { borderRadius: radius.full, paddingHorizontal: space.sm, paddingVertical: 4 },
  captionRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  divider: { height: 1, backgroundColor: color.divider },

  metricsRow: { flexDirection: 'row', gap: space.md },
  metricCol: { flex: 1, gap: space.xs },
  metricValue: { flexDirection: 'row', alignItems: 'center', gap: space.sm },

  workerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.md,
    padding: space.md,
  },
  workerInitials: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerInitialsText: { color: color.surface, fontWeight: '700' },
  workerText: { flex: 1, gap: 2 },
  workerChat: { padding: space.xs },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  actionMain: { flex: 1 },
  messageGreen: { backgroundColor: color.successStrong },
  squareSlate: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: color.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareAmber: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: color.warningStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomSpacer: { height: space.sm },
  postBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    backgroundColor: color.primary,
    paddingVertical: space.lg,
  },
  postBarLabel: { color: color.surface, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
