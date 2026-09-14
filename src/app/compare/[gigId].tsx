/**
 * Candidate Comparison — wireframe 31/37. NEW additive route /compare/[gigId].
 * Real directory (not a (group)) so the literal URL matches the spec.
 * Specs: docs/wireframes/31-candidate-comparison.md
 *
 * What is REAL:
 *  - Same live feeds as screen 29: GET /api/gigs/:id + /applicants; cards are
 *    the shared CandidateCard (single source, per the GigCard rule).
 *  - Reject → the real PATCH /api/gigs/applications/:id/reject (only while the
 *    gig is OPEN; server enforces), behind a confirm Sheet, with query
 *    invalidation.
 *  - "N Shortlisted" counts real Application.status === SHORTLISTED rows.
 *
 * Flags (never faked):
 *  - Avg. Match: derived on-device from skills overlap (no matchScore column)
 *    — hinted "derived".
 *  - Avg. Exp: there is NO experience column anywhere — tile shows "—".
 *  - Shortlist button: same no-endpoint flag as screen 29.
 *  - Compare Finalists: with no way to shortlist, there are never finalists to
 *    compare — the green button raises the flag notice instead of a fake view.
 *  - Select (inside cards): deep-links Confirm Selection (screen 32).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, ErrorState, Icon, InfoBanner, LoadingSkeleton, Screen, ScreenHeader, Sheet, StatBox, Text } from '@/components/ui';
import { Applicant, CandidateCard, matchPercent } from '@/components/business/candidate-card';
import { apiErrorMessage } from '@/config/api';
import { getApplicants, getGig, rejectApplicant } from '@/lib/gig-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

const SHORTLIST_FLAG =
  'ApplicationStatus.SHORTLISTED exists in the schema, but the live API exposes only select and reject — no endpoint can set it. Flagged, not faked.';

export default function CompareCandidatesScreen() {
  const { gigId } = useLocalSearchParams<{ gigId: string }>();
  const { token } = useAuth();
  const client = useQueryClient();
  const [notice, setNotice] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Applicant | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const rejectMutation = useMutation({
    mutationFn: (applicationId: string) => rejectApplicant(token!, applicationId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['applicants', gigId] });
      setRejectTarget(null);
    },
    onError: (err) => {
      setError(apiErrorMessage(err));
      setRejectTarget(null);
    },
  });

  const gig = gigQuery.data;
  const applicants = applicantsQuery.data ?? [];

  const ranked = useMemo(() => {
    const pending = applicants.filter((applicant) => applicant.status === 'PENDING' || applicant.status === 'SHORTLISTED');
    const scored = pending.map((applicant) => ({ applicant, match: matchPercent(applicant, gig?.skillsRequired ?? []) }));
    scored.sort((a, b) => (b.match ?? -1) - (a.match ?? -1));
    return scored;
  }, [applicants, gig]);

  const avgMatch = useMemo(() => {
    const values = ranked.map((row) => row.match).filter((value): value is number => value !== null);
    if (values.length === 0) return null;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  }, [ranked]);

  const shortlistedCount = applicants.filter((applicant) => applicant.status === 'SHORTLISTED').length;

  return (
    <Screen testID="screen-compare-candidates">
      <ScreenHeader
        title="Applicants"
        subtitle={gig?.title}
        onBack={() => router.back()}
        variant="solid"
        actions={[{ icon: 'options', accessibilityLabel: 'Filter options (flagged)', onPress: () => setNotice('Filtering options have no backend parameters on the applicants endpoint — the icon is kept per the wireframe and flagged.') }]}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statRow}>
          <StatBox variant="plain" icon="people" value={String(applicants.length)} label="Total" hint="applicants" style={styles.stat} testID="compare-stat-total" />
          <StatBox variant="plain" icon="starFilled" value={avgMatch !== null ? `${avgMatch}%` : '—'} label="Avg. Match" hint="derived" style={styles.stat} testID="compare-stat-match" />
          <StatBox variant="plain" icon="stopwatch" value="—" label="Avg. Exp" hint="no exp column" style={styles.stat} testID="compare-stat-exp" />
        </View>

        {notice ? <InfoBanner tone="warning" icon="info" title="Flagged, not faked" description={notice} /> : null}
        {error ? <InfoBanner tone="danger" icon="offline" title="Could not reject" description={error} /> : null}

        {gigQuery.isLoading || applicantsQuery.isLoading ? <LoadingSkeleton count={3} /> : null}
        {gigQuery.isError || applicantsQuery.isError ? (
          <ErrorState
            title="Could not load candidates"
            description={apiErrorMessage(gigQuery.error ?? applicantsQuery.error)}
            onRetry={() => {
              gigQuery.refetch();
              applicantsQuery.refetch();
            }}
          />
        ) : null}

        {!gigQuery.isLoading && !applicantsQuery.isLoading && ranked.length === 0 ? (
          <InfoBanner tone="info" icon="info" title="No candidates to compare" description="Every applicant has been decided on, or nobody has applied yet." />
        ) : null}

        {ranked.map(({ applicant, match }) => (
          <View key={applicant.id} style={styles.pairBlock}>
            <CandidateCard
              applicant={applicant}
              match={match}
              gigId={gigId}
              onShortlist={() => setNotice(SHORTLIST_FLAG)}
              onOpenProfile={() => router.push(`/candidate/${applicant.student.id}?gigId=${gigId}` as never)}
              onSelect={() => router.push(`/assign/${applicant.id}?gigId=${gigId}` as never)}
            />
            {/* Compare-mode action row: solid Shortlist + outline Reject (real) */}
            <View style={styles.pairActions}>
              <Button label="Shortlist" size="sm" style={styles.pairBtn} onPress={() => setNotice(SHORTLIST_FLAG)} testID={`compare-shortlist-${applicant.id}`} />
              <Button
                label="Reject"
                variant="secondary"
                size="sm"
                style={styles.pairBtn}
                onPress={() => setRejectTarget(applicant)}
                testID={`compare-reject-${applicant.id}`}
              />
            </View>
          </View>
        ))}

        <InfoBanner
          tone="info"
          icon="info"
          title="How comparison is computed"
          description="Cards are the same shared component as Manage Applicants. Avg. Match is derived on-device from skills overlap — there is no matchScore column — and Avg. Exp has no data anywhere in the schema, so it stays honest with an em dash."
        />
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky comparison bar */}
      <View style={styles.stickyBar}>
        <View style={styles.stickyText}>
          <Text variant="bodyStrong">{`${shortlistedCount} Shortlisted`}</Text>
          <Text variant="caption" tone="tertiary">
            Reviewing finalized candidates
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Compare finalists"
          onPress={() =>
            setNotice(
              'Compare Finalists needs shortlisted candidates, and the live API has no shortlist endpoint — the count above is the real SHORTLISTED status and will stay 0 until the backend ships one. Flagged, not faked.',
            )
          }
          style={({ pressed }) => [styles.compareBtn, pressed && styles.pressed]}
          testID="compare-finalists">
          <Icon name="compare" size={16} color={color.surface} />
          <Text variant="callout" style={styles.compareLabel}>
            Compare Finalists
          </Text>
        </Pressable>
      </View>

      <Sheet visible={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Reject applicant?">
        <Text variant="body" tone="secondary">
          {rejectTarget
            ? `This sends ${rejectTarget.student.name} a real rejection notification and closes their application for "${gig?.title ?? 'this gig'}". Only open gigs allow rejections.`
            : ''}
        </Text>
        <Button
          label={rejectMutation.isPending ? 'Rejecting…' : 'Reject Applicant'}
          variant="danger"
          size="lg"
          loading={rejectMutation.isPending}
          onPress={() => rejectTarget && rejectMutation.mutate(rejectTarget.id)}
          testID="compare-reject-confirm"
        />
        <Button label="Keep Applicant" variant="secondary" size="lg" onPress={() => setRejectTarget(null)} />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.base,
    paddingBottom: space['2xl'],
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  statRow: { flexDirection: 'row', gap: space.md },
  stat: { flex: 1 },

  pairBlock: { gap: space.sm },
  pairActions: { flexDirection: 'row', gap: space.sm },
  pairBtn: { flex: 1 },

  bottomSpacer: { height: space.lg },
  stickyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.base,
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.divider,
    paddingHorizontal: layout.screenGutter,
    paddingVertical: space.md,
    ...shadow.sm,
  },
  stickyText: { flex: 1, gap: 2 },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: color.successStrong,
    borderRadius: radius.full,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  compareLabel: { color: color.surface, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
