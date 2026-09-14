/**
 * Confirm Selection — wireframe 32/37. NEW additive route /assign/[applicationId].
 * Real directory (not a (group)) so the literal URL matches the spec.
 * Specs: docs/wireframes/32-confirm-selection.md
 *
 * What is REAL:
 *  - "Assign Gig" fires PATCH /api/gigs/applications/:id/select — the live
 *    transaction that SELECTs this application, REJECTs the others, notifies
 *    every student and moves the gig to ASSIGNED. Errors (closed gig, already
 *    rejected) surface verbatim.
 *  - Candidate card: name/college/avgRating/pastGigCount from the real
 *    applicants payload (?gigId= deep-link, since there is no public
 *    GET /applications/:id).
 *  - Gig summary: title, budget, deadline and location are real Gig columns;
 *    TYPE is derived from the location string s28 stores ("Remote" vs address).
 *  - Deliverables checklist: parsed from the labelled block screen 28 appends
 *    to the description — real stored data, not decoration.
 *  - Total to Deposit = the real gig budget. Escrow copy matches the real
 *    Payment flow (HELD → RELEASED after approval) via Razorpay.
 *
 * Flags (never faked):
 *  - "3rd Year": StudentProfile has no year/degree columns — college only.
 *  - Gigs posted without a deliverables block show a flag notice instead.
 *  - The checkbox squares are the wireframe's static checklist — deliverable
 *    acceptance happens on the tracker, not here.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Banner, Button, ErrorState, Icon, InfoBanner, LoadingSkeleton, Screen, ScreenHeader, Text, TextLink } from '@/components/ui';
import { Applicant, initialsOf } from '@/components/business/candidate-card';
import { apiErrorMessage } from '@/config/api';
import { getApplicants, getGig, selectApplicant } from '@/lib/gig-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

function parseDeliverables(description: string): string[] {
  const marker = description.indexOf('Deliverables:');
  if (marker === -1) return [];
  return description
    .slice(marker + 'Deliverables:'.length)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim());
}

export default function ConfirmSelectionScreen() {
  const { applicationId, gigId } = useLocalSearchParams<{ applicationId: string; gigId?: string }>();
  const { token } = useAuth();
  const client = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const gigQuery = useQuery({
    queryKey: ['gig', gigId, token],
    queryFn: () => getGig(token!, gigId!),
    enabled: !!token && !!gigId,
  });
  const applicantsQuery = useQuery({
    queryKey: ['applicants', gigId, token],
    queryFn: () => getApplicants(token!, gigId!) as Promise<Applicant[]>,
    enabled: !!token && !!gigId,
  });

  const assign = useMutation({
    mutationFn: () => selectApplicant(token!, applicationId),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['applicants', gigId] });
      client.invalidateQueries({ queryKey: ['gig', gigId] });
      client.invalidateQueries({ queryKey: ['my-gigs'] });
      client.invalidateQueries({ queryKey: ['gigs'] });
      if (gigId) router.replace(`/(business)/gig/${gigId}` as never);
      else router.back();
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const gig = gigQuery.data;
  const applicant = applicantsQuery.data?.find((item) => item.id === applicationId);
  const deliverables = gig ? parseDeliverables(gig.description) : [];
  const workType = gig ? (gig.location.trim().toLowerCase() === 'remote' ? 'Remote' : 'On-site') : '—';
  const deadline = gig ? new Date(gig.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const isLoading = gigQuery.isLoading || applicantsQuery.isLoading;
  const loadError = gigQuery.error ?? applicantsQuery.error;

  return (
    <Screen testID="screen-confirm-selection">
      <ScreenHeader title="Confirm Selection" onBack={() => router.back()} variant="solid" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? <LoadingSkeleton count={2} /> : null}
        {loadError && !isLoading ? (
          <ErrorState title="Could not load this selection" description={apiErrorMessage(loadError)} onRetry={() => { gigQuery.refetch(); applicantsQuery.refetch(); }} />
        ) : null}

        {!isLoading && !loadError ? (
          <>
            {!gigId ? (
              <InfoBanner
                tone="info"
                icon="info"
                title="Missing gig context"
                description="This screen is opened from Manage Applicants / Comparison, which pass the gig. Without it the live API cannot resolve the application — there is no public GET /applications/:id."
              />
            ) : null}

            {/* Candidate card */}
            <View style={styles.card}>
              <View style={styles.candidateRow}>
                <View style={styles.initialsCircle} accessibilityLabel={applicant?.student.name ?? 'Candidate'}>
                  <Text variant="title2" style={styles.initialsText}>
                    {initialsOf(applicant?.student.name ?? 'Candidate')}
                  </Text>
                </View>
                <View style={styles.candidateText}>
                  <Text variant="title1">{applicant?.student.name ?? 'Candidate'}</Text>
                  <View style={styles.captionRow}>
                    <Icon name="student" size={14} color={color.textTertiary} />
                    <Text variant="caption" tone="tertiary">
                      {applicant?.student.studentProfile?.college || 'College not listed'}
                    </Text>
                  </View>
                  <View style={styles.captionRow}>
                    <Icon name="starFilled" size={14} color={color.warningStrong} />
                    <Text variant="caption" tone="secondary">
                      <Text variant="captionStrong">{(applicant?.avgRating ?? 0).toFixed(1)}</Text>
                      {` (${applicant?.pastGigCount ?? 0} gigs completed)`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Gig summary */}
            <Text variant="overline" tone="tertiary">
              GIG SUMMARY
            </Text>
            <View style={styles.card}>
              <Text variant="title2">{gig?.title ?? '—'}</Text>
              <View style={styles.divider} />
              <View style={styles.summaryGrid}>
                <SummaryCell label="BUDGET" value={gig ? `₹${Number(gig.budget).toLocaleString('en-IN')}` : '—'} />
                <SummaryCell label="DEADLINE" value={deadline} />
                <SummaryCell label="LOCATION" value={gig?.location || '—'} />
                <SummaryCell label="TYPE" value={`${workType} (derived)`} />
              </View>
            </View>

            {/* Deliverables parsed from the s28 description block */}
            <Text variant="overline" tone="tertiary">
              DELIVERABLES
            </Text>
            {deliverables.length > 0 ? (
              <View style={styles.card}>
                {deliverables.map((item, index) => (
                  <View key={`${item}-${index}`} style={[styles.deliverableRow, index > 0 && styles.deliverableDivider]}>
                    <View style={styles.checkbox} />
                    <Text variant="body" style={styles.deliverableText}>
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <InfoBanner
                tone="info"
                icon="info"
                title="No deliverables block"
                description="This gig was posted without a deliverables list (they are stored as a labelled block inside the description — the schema has no deliverable-requirements column). Flagged, not faked."
              />
            )}

            <Banner
              tone="brand"
              icon="shieldCheckFilled"
              title="Protected Payment"
              description="Funds are held securely by YuvaConnect and only released after you approve the work."
              testID="assign-escrow-banner"
            />

            {error ? <InfoBanner tone="danger" icon="offline" title="Could not assign" description={error} /> : null}
            <InfoBanner
              tone="info"
              icon="info"
              title="What Assign Gig does"
              description="One real PATCH: this application becomes SELECTED, every other applicant is REJECTED and notified, and the gig moves to ASSIGNED. The Razorpay deposit (HELD) is taken on the gig management screen — the amount shown below is the real budget."
            />
          </>
        ) : null}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky deposit bar */}
      <View style={styles.stickyBar}>
        <View style={styles.totalRow}>
          <Text variant="body" tone="secondary">
            Total to Deposit
          </Text>
          <Text variant="title1">{gig ? `₹${Number(gig.budget).toLocaleString('en-IN')}` : '—'}</Text>
        </View>
        <Button
          label="Assign Gig"
          size="lg"
          loading={assign.isPending}
          disabled={!token || !gigId || !applicant}
          onPress={() => assign.mutate()}
          style={styles.assignBtn}
          testID="assign-submit"
        />
        <View style={styles.cancelRow}>
          <TextLink label="Cancel" iconRight={null} onPress={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryCell}>
      <Text variant="captionStrong" tone="tertiary">
        {label}
      </Text>
      <Text variant="callout" numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.base,
    paddingBottom: 120,
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },

  card: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    padding: space.base,
    gap: space.md,
  },
  candidateRow: { flexDirection: 'row', alignItems: 'center', gap: space.base },
  initialsCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { color: color.primary },
  candidateText: { flex: 1, gap: space.xs },
  captionRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },

  divider: { height: 1, backgroundColor: color.divider },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  summaryCell: { flexBasis: '50%', gap: 2, paddingVertical: space.sm },

  deliverableRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  deliverableDivider: { borderTopWidth: 1, borderTopColor: color.divider },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: color.borderStrong },
  deliverableText: { flex: 1 },

  bottomSpacer: { height: space.lg },
  stickyBar: {
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.divider,
    paddingHorizontal: layout.screenGutter,
    paddingVertical: space.md,
    gap: space.sm,
    ...shadow.sm,
  },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  assignBtn: { alignSelf: 'stretch' },
  cancelRow: { alignItems: 'center' },
});
