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
 *  - Message → the real per-gig chat route. Header compare icon → the real
 *    additive /compare/[gigId] route (screen 31).
 *
 * Flags (never faked):
 *  - "98% Match": no matchScore column — the pill shows a DERIVED
 *    skills-overlap percentage, labelled as derived (screen-12 treatment).
 *  - Shortlist: ApplicationStatus.SHORTLISTED exists but the LIVE API has no
 *    shortlist endpoint (only select/reject). The Shortlisted tab reads empty
 *    and the button raises a flag notice.
 *  - Blue verified check: applicants payload does not expose User.isVerified —
 *    omitted rather than faked.
 *  - Select: deep-links Confirm Selection /assign/[applicationId] (screen 32).
 */
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  BottomTabBar,
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
import { Applicant, CandidateCard, matchPercent } from '@/components/business/candidate-card';
import { apiErrorMessage } from '@/config/api';
import { getApplicants, getGig } from '@/lib/gig-api';
import { goBusinessTab } from '@/lib/tab-nav';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

type TabKey = 'applied' | 'shortlisted' | 'selected';
type SortKey = 'match' | 'rating' | 'gigs';

const SORT_LABEL: Record<SortKey, string> = { match: 'Best Match', rating: 'Highest Rated', gigs: 'Most Gigs' };

const SHORTLIST_FLAG =
  'ApplicationStatus.SHORTLISTED exists in the schema, but the live API exposes only select and reject — no endpoint can set it. The button is kept per the wireframe and flagged, not faked.';

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

  const cycleSort = () => setSort((current) => (current === 'match' ? 'rating' : current === 'rating' ? 'gigs' : 'match'));

  return (
    <Screen testID="screen-manage-applicants">
      <ScreenHeader
        title="Manage Applicants"
        onBack={() => router.back()}
        variant="solid"
        actions={[
          {
            icon: 'compare',
            accessibilityLabel: 'Compare candidates',
            onPress: () => router.push(`/compare/${gigId}` as never),
          },
        ]}
      />

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
          <CandidateCard
            key={applicant.id}
            applicant={applicant as Applicant}
            match={match}
            gigId={gigId}
            onShortlist={() => setNotice(SHORTLIST_FLAG)}
            onOpenProfile={() => router.push(`/candidate/${applicant.student.id}?gigId=${gigId}` as never)}
            onSelect={() => router.push(`/assign/${applicant.id}?gigId=${gigId}` as never)}
          />
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
    paddingBottom: 120,
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sortButton: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  sortLabel: { color: color.primary, fontWeight: '700' },
});
