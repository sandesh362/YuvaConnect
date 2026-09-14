/**
 * Business Active Work Tracker — wireframe 34/37. Rebuild in place.
 *
 * Route: /(business)/gig/[id]  ·  Spec: docs/wireframes/34-business-work-tracker.md
 * (The spec allowed sharing /tracker/[gigId] or rebuilding the business gig
 * route — this rebuilds the existing route screen 33's "Track Progress" and
 * "View Details" already point at, so no URL changes.)
 *
 * What is REAL (the whole escrow chain is live):
 *  - GET /api/gigs/:id → status, budget, deliverables[], revisionRequests[],
 *    payment. Vertical stepper state derives from the real GigStatus.
 *  - Assigned student: real SELECTED application → name/college/rating via
 *    GET /api/gigs/:id/applicants.
 *  - Fund: POST payment create-order → RazorpayCheckout → verify-payment
 *    (Payment PENDING→HELD) — preserved from the previous build. The Razorpay
 *    module is loaded LAZILY at tap time (dynamic import + catch): its
 *    top-level `new NativeEventEmitter(undefined)` throws in Expo Go, which
 *    does not ship Razorpay's native code — a top-level import crashed the
 *    whole app at startup there. Without the native module the funding step
 *    shows an explanatory flag instead (custom dev client or web needed).
 *  - Request Revision: Sheet → PATCH requestRevision (SUBMITTED only, real
 *    feedback row + student notification + REVISION_REQUESTED).
 *  - Approve & Pay: POST release-payment (SUBMITTED + HELD → RELEASED, gig
 *    PAID, student notified). approveGig is a 410 pointing here — this IS the
 *    approval endpoint.
 *  - Deliverable rows are real submissions (tap opens the real fileUrl);
 *    "V1 Submission" card shows the latest real deliverable note.
 *  - Completed gigs prompt the real rating flow at /(shared)/rate/[gigId]
 *    when getMyRating() is null.
 *
 * Flags (never faked):
 *  - Outline-circle rows under submissions are the deliverable REQUIREMENTS
 *    parsed from the labelled block screen 28 stores in the description —
 *    the schema has no deliverable-requirements column, and submissions are
 *    not matched to them (no linkage exists).
 *  - Verified check omitted (isVerified not exposed); "3rd Year" omitted
 *    (no year/degree columns) — same flags as screens 29/30.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  Button,
  ErrorState,
  Icon,
  InfoBanner,
  LoadingSkeleton,
  MilestoneStepper,
  Screen,
  ScreenHeader,
  Sheet,
  Text,
  TextField,
} from '@/components/ui';
import type { Milestone } from '@/components/ui';
import { Applicant, initialsOf } from '@/components/business/candidate-card';
import { apiErrorMessage } from '@/config/api';
import { createPaymentOrder, getApplicants, getGig, releasePayment, requestRevision, verifyPayment, type RazorpayPaymentResponse } from '@/lib/gig-api';
import { getMyRating } from '@/lib/trust-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { Gig } from '@/types/api';

const COMPLETED = ['APPROVED', 'PAID', 'CLOSED'];

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

function milestonesFor(gig: Gig): Milestone[] {
  const status = gig.status;
  const stepDone = (step: number): boolean => {
    if (step === 1) return status !== 'OPEN';
    if (step === 2) return ['IN_PROGRESS', 'REVISION_REQUESTED', 'SUBMITTED', ...COMPLETED].includes(status);
    if (step === 3) return ['SUBMITTED', ...COMPLETED].includes(status);
    return status === 'PAID' || status === 'CLOSED';
  };
  const labels = ['Assigned', 'Work Started', 'Submitted for Review', 'Approved & Paid'];
  const firstOpen = labels.findIndex((_, index) => !stepDone(index + 1));
  return labels.map((label, index) => ({
    key: label,
    label,
    status: stepDone(index + 1) ? 'done' : index === firstOpen ? 'current' : 'pending',
    meta: stepDone(index + 1) ? new Date(gig.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : undefined,
  }));
}

export default function BusinessWorkTrackerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useAuth();
  const client = useQueryClient();
  const [feedback, setFeedback] = useState('');
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gigQuery = useQuery({
    queryKey: ['gig', id, token],
    queryFn: () => getGig(token!, id),
    enabled: !!token && !!id,
  });
  const applicantsQuery = useQuery({
    queryKey: ['applicants', id, token],
    queryFn: () => getApplicants(token!, id) as Promise<Applicant[]>,
    enabled: !!token && !!id,
  });

  const gig = gigQuery.data;
  const selected = applicantsQuery.data?.find((applicant) => applicant.status === 'SELECTED');
  const hasSelected = gig?.applications?.some((application) => application.status === 'SELECTED') ?? false;
  const canRate = hasSelected && !!gig && COMPLETED.includes(gig.status);

  const myRatingQuery = useQuery({
    queryKey: ['my-rating', id],
    queryFn: () => getMyRating(token!, id),
    enabled: !!token && !!id && canRate,
  });

  const refresh = () => {
    client.invalidateQueries({ queryKey: ['gig', id] });
    client.invalidateQueries({ queryKey: ['my-gigs'] });
    client.invalidateQueries({ queryKey: ['applicants', id] });
  };

  const fund = useMutation({
    mutationFn: async () => {
      // Deferred on purpose: importing react-native-razorpay throws in Expo Go
      // (no native module → NativeEventEmitter invariant), which used to kill
      // the app at startup because route modules load eagerly.
      let RazorpayCheckout: { open: (options: Record<string, unknown>) => Promise<RazorpayPaymentResponse> };
      try {
        const mod = await import('react-native-razorpay');
        RazorpayCheckout = (mod.default ?? mod) as typeof RazorpayCheckout;
      } catch {
        throw new Error('RAZORPAY_NATIVE_MISSING');
      }
      const { order } = await createPaymentOrder(token!, id);
      const result = await RazorpayCheckout.open({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'YuvaConnect',
        description: `Fund ${gig?.title ?? 'gig'}`,
        order_id: order.id,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: color.primary },
      });
      await verifyPayment(token!, id, result);
    },
    onSuccess: refresh,
    onError: (err) =>
      setError(
        err instanceof Error && err.message === 'RAZORPAY_NATIVE_MISSING'
          ? 'Razorpay checkout needs its native module, which Expo Go does not include. Fund gigs from the web preview, or build a custom dev client (npx expo run:android / run:ios). Everything else on this screen works in Expo Go.'
          : apiErrorMessage(err),
      ),
  });

  const revision = useMutation({
    mutationFn: () => requestRevision(token!, id, feedback.trim()),
    onSuccess: () => {
      setRevisionOpen(false);
      setFeedback('');
      refresh();
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const release = useMutation({
    mutationFn: () => releasePayment(token!, id),
    onSuccess: () => {
      refresh();
      client.invalidateQueries({ queryKey: ['my-rating', id] });
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  if (gigQuery.isLoading) {
    return (
      <Screen testID="screen-business-tracker">
        <ScreenHeader title="Work Tracker" onBack={() => router.back()} variant="solid" />
        <View style={styles.body}>
          <LoadingSkeleton count={3} />
        </View>
      </Screen>
    );
  }
  if (gigQuery.isError || !gig) {
    return (
      <Screen testID="screen-business-tracker">
        <ScreenHeader title="Work Tracker" onBack={() => router.back()} variant="solid" />
        <View style={styles.body}>
          <ErrorState title="Could not load this gig" description={apiErrorMessage(gigQuery.error)} onRetry={() => gigQuery.refetch()} />
        </View>
      </Screen>
    );
  }

  const deliverables = gig.deliverables ?? [];
  const latest = deliverables[0];
  const requirements = parseDeliverables(gig.description);
  const latestRevision = gig.revisionRequests?.[0];
  const needsFunding = !gig.payment || (gig.payment.status !== 'HELD' && gig.payment.status !== 'RELEASED');
  const isSubmitted = gig.status === 'SUBMITTED';
  const canRelease = isSubmitted && gig.payment?.status === 'HELD';
  const firstName = selected?.student.name.split(' ')[0] ?? 'Student';

  return (
    <Screen testID="screen-business-tracker">
      <ScreenHeader title="Work Tracker" subtitle={gig.title} onBack={() => router.back()} variant="solid" />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {error ? <InfoBanner tone="danger" icon="offline" title="Action failed" description={error} /> : null}

        {/* Assigned student */}
        {selected ? (
          <View style={styles.card}>
            <View style={styles.studentRow}>
              <View style={styles.initialsCircle} accessibilityLabel={selected.student.name}>
                <Text variant="title3" style={styles.initialsText}>
                  {initialsOf(selected.student.name)}
                </Text>
              </View>
              <View style={styles.studentText}>
                <Text variant="title3">{selected.student.name}</Text>
                <Text variant="caption" tone="tertiary" numberOfLines={1}>
                  {selected.student.studentProfile?.college || 'College not listed'}
                </Text>
              </View>
              <View style={styles.ratingPill}>
                <Icon name="starFilled" size={12} color={color.successStrong} />
                <Text variant="captionStrong" style={styles.ratingLabel}>
                  {selected.avgRating.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <InfoBanner
            tone="info"
            icon="people"
            title="No student assigned yet"
            description="Select an applicant from Manage Applicants — the tracker fills in once an application is SELECTED and the gig moves to ASSIGNED."
          />
        )}

        {/* Real revision request state */}
        {gig.status === 'REVISION_REQUESTED' && latestRevision ? (
          <InfoBanner
            tone="warning"
            icon="refresh"
            title="Revision requested"
            description={`Your feedback from ${new Date(latestRevision.requestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: “${latestRevision.feedback}” — ${firstName} can submit again.`}
          />
        ) : null}

        {/* Funding — the real escrow precondition */}
        {hasSelected && needsFunding && gig.status !== 'OPEN' ? (
          <View style={styles.card}>
            <Text variant="title3">Fund this gig</Text>
            <Text variant="body" tone="secondary">
              {`The server blocks work from starting until ₹${Number(gig.budget).toLocaleString('en-IN')} is held in escrow. Razorpay creates the order; the payment stays HELD until you approve the work.`}
            </Text>
            <Button
              label={fund.isPending ? 'Opening Razorpay…' : `Deposit ₹${Number(gig.budget).toLocaleString('en-IN')}`}
              loading={fund.isPending}
              onPress={() => fund.mutate()}
              testID="tracker-fund"
            />
          </View>
        ) : null}

        {/* Project status */}
        <View style={styles.card}>
          <Text variant="title3">Project Status</Text>
          <MilestoneStepper milestones={milestonesFor(gig)} orientation="vertical" connectors={false} />
        </View>

        {/* Deliverables */}
        <View style={styles.sectionHead}>
          <Text variant="title1">Deliverables</Text>
          <Text variant="caption" tone="tertiary">
            {`${deliverables.length} file${deliverables.length === 1 ? '' : 's'} submitted`}
          </Text>
        </View>
        <View style={styles.card}>
          {deliverables.length === 0 && requirements.length === 0 ? (
            <Text variant="body" tone="tertiary">
              Nothing submitted yet — submissions appear here the moment the student uploads.
            </Text>
          ) : null}
          {deliverables.map((item, index) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Open submission ${deliverables.length - index}`}
              onPress={() => Linking.openURL(item.fileUrl).catch(() => undefined)}
              style={({ pressed }) => [styles.fileRow, index > 0 && styles.rowDivider, pressed && styles.pressed]}
              testID={`deliverable-${item.id}`}>
              <Icon name="checkCircleFilled" size={20} color={color.successStrong} />
              <View style={styles.fileText}>
                <Text variant="body" numberOfLines={1}>
                  {item.note?.trim() || `Submission ${deliverables.length - index}`}
                </Text>
                <Text variant="caption" tone="tertiary">
                  {new Date(item.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </Text>
              </View>
              <Icon name="chevronRight" size={16} color={color.textTertiary} />
            </Pressable>
          ))}
          {requirements.map((requirement, index) => (
            <View key={`${requirement}-${index}`} style={[styles.fileRow, (index > 0 || deliverables.length > 0) && styles.rowDivider]}>
              <View style={styles.outlineCircle} />
              <View style={styles.fileText}>
                <Text variant="body" tone="secondary" numberOfLines={1}>
                  {requirement}
                </Text>
                <Text variant="caption" tone="tertiary">
                  Required — from your gig post
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Latest submission card */}
        {latest ? (
          <View style={styles.submissionCard}>
            <View style={styles.submissionHead}>
              <Icon name="document" size={22} color={color.primary} />
              <Text variant="title3">{`V${deliverables.length} Submission`}</Text>
            </View>
            {latest.note?.trim() ? (
              <Text variant="body" tone="secondary" numberOfLines={3} style={styles.submissionBody}>
                {latest.note}
              </Text>
            ) : null}
            <View style={styles.submissionActions}>
              <Button label="Review Files" variant="secondary" size="sm" style={styles.reviewBtn} onPress={() => Linking.openURL(latest.fileUrl).catch(() => undefined)} testID="tracker-review-files" />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Message ${firstName}`}
                onPress={() => router.push(`/(shared)/chat/${gig.id}` as never)}
                style={({ pressed }) => [styles.messageLink, pressed && styles.pressed]}
                testID="tracker-message">
                <Icon name="chat" size={16} color={color.primary} />
                <Text variant="callout" style={styles.messageLabel}>
                  {`Message ${firstName}`}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* Payment row → real details screen (wireframe 35) */}
        {gig.payment ? (
          <Button
            label={`View Payment Details · ${gig.payment.status === 'RELEASED' ? 'Released' : gig.payment.status === 'HELD' ? 'Held in escrow' : gig.payment.status}`}
            variant="secondary"
            icon="wallet"
            onPress={() => router.push(`/payment/${gig.payment!.id}?gigId=${gig.id}` as never)}
            testID="tracker-payment-details"
          />
        ) : null}

        {/* Completed → real rating flow */}
        {canRate ? (
          myRatingQuery.data === null ? (
            <InfoBanner
              tone="success"
              icon="starFilled"
              title="Gig complete — rate your student"
              description="One rating per gig, participant-only. The full ratings flow (wireframe 6) opens in its own screen."
              actionLabel="Rate Now"
              onAction={() => router.push(`/(shared)/rate/${gig.id}` as never)}
            />
          ) : (
            <InfoBanner tone="success" icon="checkCircleFilled" title="Rated" description="You have already rated this gig — thank you." />
          )
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky decision bar */}
      <View style={styles.stickyBar}>
        <Button
          label="Request Revision"
          size="lg"
          style={[styles.stickyBtn, styles.revisionGreen]}
          disabled={!isSubmitted}
          onPress={() => setRevisionOpen(true)}
          testID="tracker-request-revision"
        />
        <Button
          label="Approve & Pay"
          size="lg"
          style={styles.stickyBtn}
          disabled={!canRelease}
          loading={release.isPending}
          onPress={() => release.mutate()}
          testID="tracker-approve-pay"
        />
      </View>
      {!isSubmitted ? (
        <View style={styles.stickyCaption}>
          <Text variant="caption" tone="tertiary">
            {hasSelected
              ? `Revision and release open when ${firstName} submits (gig is ${gig.status.replaceAll('_', ' ')}).`
              : 'Select an applicant first — these actions need an assigned gig.'}
          </Text>
        </View>
      ) : !canRelease ? (
        <View style={styles.stickyCaption}>
          <Text variant="caption" tone="tertiary">
            {gig.payment?.status === 'HELD' ? '' : 'Approve & Pay needs the escrowed payment in HELD state.'}
          </Text>
        </View>
      ) : null}

      {/* Revision feedback sheet */}
      <Sheet visible={revisionOpen} onClose={() => setRevisionOpen(false)} title="Request Revision">
        <Text variant="body" tone="secondary">
          {`Tell ${firstName} exactly what to change. This creates a real revision request, moves the gig to REVISION_REQUESTED and notifies them.`}
        </Text>
        <TextField label="What needs to change?" type="textarea" value={feedback} onChangeText={setFeedback} placeholder="e.g. Templates need the updated brand palette from the style guide." testID="tracker-feedback" />
        <Button
          label={revision.isPending ? 'Sending…' : 'Send Revision Request'}
          size="lg"
          loading={revision.isPending}
          disabled={!feedback.trim()}
          onPress={() => revision.mutate()}
          testID="tracker-send-revision"
        />
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.base,
    paddingBottom: space['2xl'],
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

  studentRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  initialsCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { color: color.primary },
  studentText: { flex: 1, gap: 2 },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: color.successSoft,
    borderRadius: radius.full,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
  },
  ratingLabel: { color: color.successStrong },

  sectionHead: { gap: space.xs, paddingTop: space.sm },

  fileRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  rowDivider: { borderTopWidth: 1, borderTopColor: color.divider },
  fileText: { flex: 1, gap: 2 },
  outlineCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: color.borderStrong },

  submissionCard: {
    backgroundColor: color.primarySoft,
    borderRadius: radius.lg,
    padding: space.base,
    gap: space.md,
  },
  submissionHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  submissionBody: { lineHeight: 20 },
  submissionActions: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  reviewBtn: { flex: 1 },
  messageLink: { flexDirection: 'row', alignItems: 'center', gap: space.xs, flex: 1, justifyContent: 'center' },
  messageLabel: { color: color.primary, fontWeight: '600' },

  bottomSpacer: { height: space.sm },
  stickyBar: {
    flexDirection: 'row',
    gap: space.md,
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.divider,
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.md,
  },
  stickyBtn: { flex: 1 },
  revisionGreen: { backgroundColor: color.successStrong },
  stickyCaption: {
    backgroundColor: color.surface,
    paddingHorizontal: layout.screenGutter,
    paddingBottom: space.md,
    alignItems: 'center',
  },
  pressed: { opacity: 0.7 },
});