/**
 * Manage Applicants — wireframe 29/37. Rebuild in place, route unchanged.
 *
 * Route: /(business)/applicants/[gigId]  ·  Spec: docs/wireframes/29-applicant-management.md
 *
 * What is REAL:
 *  - GET /api/gigs/:id (title, budget) + GET /api/gigs/:id/applicants — each
 *    applicant carries student name, college, skills, avgRating, totalRatings
 *    and pastGigCount straight from the live API.
 *  - Mint segments filter by the real Application.status (PENDING /
 *    SHORTLISTED / SELECTED).
 *  - Message → the real per-gig chat route.
 *
 * Flags (never faked):
 *  - "98% Match": there is no matchScore column. The pill shows a DERIVED
 *    skills-overlap percentage (student skills ∩ gig skillsRequired), labelled
 *    as derived — same approved treatment as screen 12.
 *  - Shortlist: ApplicationStatus.SHORTLISTED exists but the LIVE API has no
 *    shortlist endpoint (only select/reject). The Shortlisted tab therefore
 *    always reads empty and the Shortlist button raises a flag notice.
 *  - Blue verified check: the applicants payload does not expose
 *    User.isVerified — omitted rather than faked.
 *  - Select: wired when Confirm Selection (screen 32) ships; quiet no-op until
 *    then, per the approved placeholder pattern.
 */
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  BottomTabBar,
  Button,
  EmptyState,
  ErrorState,
  Icon,
  InfoBanner,
  LoadingSkeleton,
  Screen,
  ScreenHeader,
  Text,
} from '@/components/ui';
import { BUSINESS_TABS } from '@/components/ui/BottomTabBar';
import { apiErrorMessage } from '@/config/api';
import { getApplicants, getGig } from '@/lib/gig-api';
import { goBusinessTab } from '@/lib/tab-nav';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { Application } from '@/types/api';

type Applicant = Application & {
  student: {
    id: string;
    name: string;
    email: string;
    studentProfile?: { college: string; skills: string[]; bio: string; profileImageUrl: string | null; avgRating: number; totalRatings: number } | null;
  };
  avgRating: number;
  totalRatings: number;
  pastGigCount: number;
};

type TabKey = 'applied' | 'shortlisted' | 'selected';
type SortKey = 'match' | 'rating' | 'gigs';

const SORT_LABEL: Record<SortKey, string> = { match: 'Best Match', rating: 'Highest Rated', gigs: 'Most Gigs' };

function matchPercent(applicant: Applicant, skillsRequired: string[]): number | null {
  const skills = applicant.student.studentProfile?.skills ?? [];
  if (skillsRequired.length === 0 || skills.length === 0) return null;
  const wanted = skillsRequired.map((skill) => skill.toLowerCase());
  const hits = wanted.filter((skill) => skills.some((have) => have.toLowerCase() === skill || have.toLowerCase().includes(skill) || skill.includes(have.toLowerCase())));
  return Math.round((hits.length / wanted.length) * 100);
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase();
}

export default function ManageApplicantsScreen() {
  const { gigId } = useLocalSearchParams<{ gigId: string }>();
  const { token } = useAuth();
  const [tab, setTab] = useState<TabKey>('applied');
  const [sort, setSort] = useState<SortKey>('match');
  const [notice, setNotice] = useState<string | null>(null);

  const gigQuery = useQuery({
    queryKey: ['gig', gigId, token],
    queryFn: () => getGig(token!, gigId),
    enabled: !!token && !!gigId,
  });
  const applicantsQuery = useQuery({
    queryKey: ['applicants', gigId, token],
    queryFn: () => getApplicants(token!, gigId) as Promise<Applicant[]>,
    enabled: !!token && !!gigId,
  });

  const gig = gigQuery.data;
  const applicants = applicantsQuery.data ?? [];

  const visible = useMemo(() => {
    const status = tab === 'applied' ? 'PENDING' : tab === 'shortlisted' ? 'SHORTLISTED' : 'SELECTED';
    const filtered = applicants.filter((applicant) => applicant.status === status);
    const scored = filtered.map((applicant) => ({ applicant, match: matchPercent(applicant, gig?.skillsRequired ?? []) }));
    scored.sort((a, b) => {
      if (sort === 'rating') return b.applicant.avgRating - a.applicant.avgRating;
      if (sort === 'gigs') return b.applicant.pastGigCount - a.applicant.pastGigCount;
      return (b.match ?? -1) - (a.match ?? -1);
    });
    return scored;
  }, [applicants, tab, sort, gig]);

  const counts = useMemo(
    () => ({
      applied: applicants.filter((applicant) => applicant.status === 'PENDING').length,
      shortlisted: applicants.filter((applicant) => applicant.status === 'SHORTLISTED').length,
      selected: applicants.filter((applicant) => applicant.status === 'SELECTED').length,
    }),
    [applicants],
  );

  const cycleSort = () => setSort((current) => (current === 'match' ? 'rating' : current === 'rating' ? 'gigs' : 'match'));

  return (
    <Screen testID="screen-manage-applicants">
      <ScreenHeader title="Manage Applicants" onBack={() => router.back()} variant="solid" />

      {gig ? (
        <View style={styles.gigIntro}>
          <Text variant="body" numberOfLines={2}>
            {gig.title}
          </Text>
          <Text variant="captionStrong" tone="secondary">{`\u20B9${Number(gig.budget).toLocaleString('en-IN')} \u2022 ${applicants.length} Applicants`}</Text>
        </View>
      ) : null}

      {/* Mint segmented control */}
      <View style={styles.segmentTrack} accessibilityRole="tablist">
        {([
          { key: 'applied' as TabKey, label: 'Applied' },
          { key: 'shortlisted' as TabKey, label: 'Shortlisted' },
          { key: 'selected' as TabKey, label: 'Selected' },
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

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.countRow}>
          <Text variant="body">{`${visible.length} Candidates`}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={`Sort: ${SORT_LABEL[sort]}`} onPress={cycleSort} style={styles.sortButton} testID="applicants-sort">
            <Icon name="compare" size={16} color={color.primary} />
            <Text variant="callout" style={styles.sortLabel}>
              {SORT_LABEL[sort]}
            </Text>
          </Pressable>
        </View>

        {notice ? <InfoBanner tone="warning" icon="info" title="Flagged, not faked" description={notice} /> : null}

        {gigQuery.isLoading || applicantsQuery.isLoading ? <LoadingSkeleton count={3} /> : null}
        {gigQuery.isError || applicantsQuery.isError ? (
          <ErrorState
            title="Could not load applicants"
            description={apiErrorMessage(gigQuery.error ?? applicantsQuery.error)}
            onRetry={() => {
              gigQuery.refetch();
              applicantsQuery.refetch();
            }}
          />
        ) : null}

        {!gigQuery.isLoading && !applicantsQuery.isLoading && visible.length === 0 ? (
          <EmptyState
            title={tab === 'shortlisted' ? 'No shortlisted candidates' : tab === 'selected' ? 'No selected candidate yet' : 'No pending applications'}
            description={
              tab === 'shortlisted'
                ? 'The live API has no shortlist endpoint, so this tab stays empty — flagged below, never faked.'
                : 'Applications to this gig will appear here as students apply.'
            }
            icon="people"
            wellSize="lg"
          />
        ) : null}

        {visible.map(({ applicant, match }) => (
          <View key={applicant.id} style={styles.candidateCard}>
            <View style={styles.candidateTop}>
              <View style={styles.initialsCircle} accessibilityLabel={applicant.student.name}>
                <Text variant="title3" style={styles.initialsText}>
                  {initialsOf(applicant.student.name)}
                </Text>
              </View>
              <View style={styles.candidateIdentity}>
                <Text variant="title3" numberOfLines={1}>
                  {applicant.student.name}
                </Text>
                <Text variant="caption" tone="tertiary" numberOfLines={1}>
                  {applicant.student.studentProfile?.college || 'College not listed'}
                </Text>
              </View>
            </View>

            <View style={styles.statRow}>
              {match !== null ? (
                <View style={styles.matchPill} accessibilityLabel={`${match} percent match, derived from skills overlap`}>
                  <Icon name="flashFilled" size={12} color={color.successStrong} />
                  <Text variant="captionStrong" style={styles.matchLabel}>
                    {`${match}% Match`}
                  </Text>
                </View>
              ) : null}
              <View style={styles.statItem}>
                <Icon name="starFilled" size={14} color={color.warningStrong} />
                <Text variant="captionStrong">{applicant.avgRating.toFixed(1)}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="briefcase" size={14} color={color.textTertiary} />
                <Text variant="caption" tone="tertiary">
                  {`${applicant.pastGigCount} Gigs`}
                </Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.actionRow}>
              <Button
                label={applicant.status === 'SHORTLISTED' ? 'Shortlisted' : 'Shortlist'}
                variant="secondary"
                size="sm"
                style={styles.actionBtn}
                onPress={() =>
                  setNotice('ApplicationStatus.SHORTLISTED exists in the schema, but the live API exposes only select and reject — no endpoint can set it. The button is kept per the wireframe and flagged, not faked.')
                }
                testID={`shortlist-${applicant.id}`}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Message about ${gig?.title ?? 'this gig'}`}
                onPress={() => router.push(`/(shared)/chat/${gigId}` as never)}
                style={({ pressed }) => [styles.messageBtn, pressed && styles.pressed]}
                testID={`message-${applicant.id}`}>
                <Icon name="chat" size={16} color={color.primary} />
                <Text variant="callout" style={styles.messageLabel}>
                  Message
                </Text>
              </Pressable>
              <Button
                label="Select"
                size="sm"
                style={styles.actionBtn}
                onPress={() => undefined /* Confirm Selection (screen 32) wires this */}
                testID={`select-${applicant.id}`}
              />
            </View>
          </View>
        ))}

        <InfoBanner
          tone="info"
          icon="info"
          title="How this list is computed"
          description="Names, colleges, ratings and gig counts come straight from GET /api/gigs/:id/applicants. Match % is derived on-device from skills overlap — there is no matchScore column. The verified check is omitted because the payload does not expose User.isVerified."
        />
      </ScrollView>

      <BottomTabBar items={BUSINESS_TABS} activeKey="gigs" onSelect={goBusinessTab} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gigIntro: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.sm,
    gap: space.xs,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },

  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.full,
    padding: 4,
    gap: 4,
    marginHorizontal: layout.screenGutter,
    marginTop: space.md,
    maxWidth: layout.maxContentWidth,
    width: 'auto',
    alignSelf: 'center',
  },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: space.sm, borderRadius: radius.full },
  segmentActive: { backgroundColor: color.successSoft },
  segmentLabel: { color: color.textSecondary },
  segmentLabelActive: { color: color.textPrimary, fontWeight: '700' },

  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.base,
    paddingBottom: space['2xl'],
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sortButton: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  sortLabel: { color: color.primary, fontWeight: '700' },

  candidateCard: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    padding: space.base,
    gap: space.md,
  },
  candidateTop: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  initialsCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { color: color.primary },
  candidateIdentity: { flex: 1, gap: 2 },

  statRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  matchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: color.successSoft,
    borderRadius: radius.full,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
  },
  matchLabel: { color: color.successStrong },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  cardDivider: { height: 1, backgroundColor: color.divider },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  actionBtn: { flex: 1 },
  messageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs, flex: 1, paddingVertical: space.sm },
  messageLabel: { color: color.primary, fontWeight: '600' },
  pressed: { opacity: 0.7 },
});
