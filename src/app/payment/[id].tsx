/**
 * Business Payment Details — wireframe 35/37. NEW additive route /payment/[id].
 * Real directory (not a (group)) so the literal URL matches the spec.
 * Specs: docs/wireframes/35-business-payments.md
 *
 * What is REAL:
 *  - The Payment row itself (amount, status, razorpayOrderId/PaymentId,
 *    createdAt, updatedAt) — fetched through GET /api/gigs/:gigId (the live
 *    API has no GET /payment/:id, so the tracker deep-links ?gigId=).
 *  - Gig title/budget, assigned student name via the real applicants payload.
 *  - Hero title, pill and Transaction ID all reflect the real payment status.
 *  - Help icon → the real /(shared)/support route.
 *
 * Flags (never faked):
 *  - Platform Fee (5%) + GST (18% on fee): NOT stored on Payment — computed
 *    client-side and labelled as an illustrative pilot breakdown.
 *  - Timeline: only createdAt (order) and updatedAt (release) are real
 *    timestamps; the hold step has no stored time and Razorpay settlement is
 *    not tracked by the pilot backend — both rows say so.
 *  - Gig photo thumb: gigs have no image column — an icon tile renders instead.
 *  - Download Invoice: no endpoint — raises the flag notice.
 *  - Blue verified check omitted (isVerified not exposed), consistent with 29/30/34.
 */
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, ErrorState, Icon, InfoBanner, LoadingSkeleton, Screen, ScreenHeader, Text } from '@/components/ui';
import { Applicant } from '@/components/business/candidate-card';
import { apiErrorMessage } from '@/config/api';
import { getApplicants, getGig } from '@/lib/gig-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { PaymentStatus } from '@/types/api';

const STATUS_SKIN: Record<PaymentStatus, { title: string; pill: string; pillFg: string; pillBg: string }> = {
  RELEASED: { title: 'Payment Released', pill: 'COMPLETED', pillFg: color.successStrong, pillBg: color.successSoft },
  HELD: { title: 'Payment Held in Escrow', pill: 'IN ESCROW', pillFg: color.primary, pillBg: color.primarySoft },
  PENDING: { title: 'Payment Pending', pill: 'PENDING', pillFg: color.textSecondary, pillBg: color.surfaceMuted },
  REFUNDED: { title: 'Payment Refunded', pill: 'REFUNDED', pillFg: color.textSecondary, pillBg: color.surfaceMuted },
  FAILED: { title: 'Payment Failed', pill: 'FAILED', pillFg: color.danger, pillBg: color.dangerSoft },
};

function formatMoney(n: number): string {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function PaymentDetailsScreen() {
  const { id, gigId } = useLocalSearchParams<{ id: string; gigId?: string }>();
  const { token } = useAuth();
  const [notice, setNotice] = useState<string | null>(null);

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

  const gig = gigQuery.data;
  const payment = gig?.payment ?? null;
  const selected = applicantsQuery.data?.find((applicant) => applicant.status === 'SELECTED');
  const skin = STATUS_SKIN[payment?.status ?? 'PENDING'];

  const amount = payment ? Number(payment.amount) : 0;
  const fee = amount * 0.05;
  const gst = fee * 0.18;
  const payout = amount - fee - gst;

  return (
    <Screen testID="screen-payment-details">
      <ScreenHeader
        title="Payment Details"
        onBack={() => router.back()}
        variant="solid"
        actions={[{ icon: 'help', accessibilityLabel: 'Help & Support', onPress: () => router.push('/(shared)/support' as never) }]}
      />

      <ScrollView style={{flex:1}} contentContainerStyle={[styles.content, {flexGrow:1}]} showsVerticalScrollIndicator={false}>
        {notice ? <InfoBanner tone="warning" icon="info" title="Flagged, not faked" description={notice} /> : null}

        {!gigId ? (
          <InfoBanner
            tone="info"
            icon="info"
            title="Missing gig context"
            description="The live API has no GET /payment/:id — this screen reads the payment through its gig. Open it from the Work Tracker, which passes ?gigId=."
          />
        ) : null}

        {gigQuery.isLoading ? <LoadingSkeleton count={2} /> : null}
        {gigQuery.isError ? (
          <ErrorState title="Could not load payment" description={apiErrorMessage(gigQuery.error)} onRetry={() => gigQuery.refetch()} />
        ) : null}

        {gig && payment ? (
          <>
            {/* Hero */}
            <View style={styles.heroCard}>
              <View style={styles.heroCircle}>
                <Icon name="wallet" size={32} color={color.textPrimary} />
              </View>
              <Text variant="title1" style={styles.heroTitle}>
                {skin.title}
              </Text>
              <Text variant="captionStrong" tone="secondary">
                {`Transaction ID: ${payment.razorpayPaymentId ?? payment.razorpayOrderId}`}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: skin.pillBg }]}>
                <Text variant="captionStrong" style={{ color: skin.pillFg }}>
                  {skin.pill}
                </Text>
              </View>
            </View>

            {/* Gig summary */}
            <Text variant="title3">Gig Summary</Text>
            <View style={styles.card}>
              <View style={styles.gigRow}>
                <View style={styles.gigThumb} accessibilityLabel="Gig icon">
                  <Icon name="briefcase" size={24} color={color.primary} />
                </View>
                <View style={styles.gigText}>
                  <Text variant="title3" numberOfLines={1}>
                    {gig.title}
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    {selected ? `Assigned to ${selected.student.name}` : 'No student assigned'}
                  </Text>
                </View>
              </View>
              <Text variant="caption" tone="tertiary">
                Gigs have no image column — an icon tile stands in for the wireframe's photo thumb.
              </Text>
            </View>

            {/* Breakdown — client-computed, labelled */}
            <Text variant="title3">Payment Breakdown</Text>
            <View style={styles.card}>
              <BreakdownRow label="Gig Amount" value={formatMoney(amount)} />
              <BreakdownRow label="Platform Fee (5%)" value={`- ${formatMoney(fee)}`} valueColor={color.danger} />
              <BreakdownRow label="GST (18% on fee)" value={`- ${formatMoney(gst)}`} valueColor={color.danger} />
              <View style={styles.divider} />
              <BreakdownRow label="Total Payout" value={formatMoney(payout)} valueColor={color.successStrong} bold />
              <Text variant="caption" tone="tertiary">
                Fee and GST are not stored on the Payment row — this is the pilot's illustrative 5% + 18%-on-fee breakdown, computed on-device from the real amount.
              </Text>
            </View>

            {/* Timeline — real timestamps only */}
            <Text variant="title3">Transaction Timeline</Text>
            <View style={styles.card}>
              <TimelineRow icon="checkCircleFilled" title="Payment Order Created" caption={formatWhen(payment.createdAt)} done />
              <TimelineRow
                icon="checkCircleFilled"
                title="Funds Held in Escrow"
                caption="Hold time is not stored separately — the pilot backend keeps created/updated only"
                done={payment.status !== 'PENDING' && payment.status !== 'FAILED'}
              />
              {payment.status === 'RELEASED' ? (
                <TimelineRow icon="checkCircleFilled" title="Payment Released" caption={formatWhen(payment.updatedAt)} done />
              ) : (
                <TimelineRow icon="clock" title="Payment Release" caption="Opens when you approve submitted work" done={false} />
              )}
              <TimelineRow icon="clock" title="Settlement" caption="Razorpay settlement is not tracked by the pilot backend" done={false} />
            </View>

            <Button
              label="Download Invoice"
              variant="secondary"
              size="lg"
              icon="download"
              onPress={() => setNotice('There is no invoice endpoint or PDF generation in the backend — the button is kept per the wireframe and flagged, not faked.')}
              testID="payment-invoice"
            />
          </>
        ) : null}

        {gig && !payment ? (
          <InfoBanner tone="info" icon="wallet" title="No payment on this gig" description="A Payment row is created when the gig is funded (create-order). This gig has none yet." />
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.backWrap}>
        <Button label="Back to Dashboard" variant="secondary" onPress={() => router.replace('/home' as never)} testID="payment-back-dashboard" />
      </View>
    </Screen>
  );
}

function BreakdownRow({ label, value, valueColor, bold }: { label: string; value: string; valueColor?: string; bold?: boolean }) {
  return (
    <View style={styles.breakdownRow}>
      <Text variant={bold ? 'bodyStrong' : 'body'}>{label}</Text>
      <Text variant={bold ? 'bodyStrong' : 'body'} style={[styles.breakdownValue, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

function TimelineRow({ icon, title, caption, done }: { icon: 'checkCircleFilled' | 'clock'; title: string; caption: string; done: boolean }) {
  return (
    <View style={styles.timelineRow}>
      {done ? (
        <Icon name={icon} size={28} color={color.textPrimary} />
      ) : (
        <View style={styles.timelineOutline}>
          <Icon name={icon} size={16} color={color.textTertiary} />
        </View>
      )}
      <View style={styles.timelineText}>
        <Text variant="body" tone={done ? 'primary' : 'secondary'}>
          {title}
        </Text>
        <Text variant="caption" tone="tertiary">
          {caption}
        </Text>
      </View>
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

  heroCard: { alignItems: 'center', gap: space.sm, paddingVertical: space.md },
  heroCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: color.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { textAlign: 'center' },
  statusPill: { borderRadius: radius.full, paddingHorizontal: space.base, paddingVertical: 4, marginTop: space.xs },

  card: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    padding: space.base,
    gap: space.md,
  },
  gigRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  gigThumb: { width: 56, height: 56, borderRadius: 12, backgroundColor: color.primarySoft, alignItems: 'center', justifyContent: 'center' },
  gigText: { flex: 1, gap: 2 },

  breakdownRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  breakdownValue: { textAlign: 'right' },
  divider: { height: 1, backgroundColor: color.divider },

  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  timelineOutline: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: color.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineText: { flex: 1, gap: 2 },

  bottomSpacer: { height: space.sm },
  backWrap: { alignItems: 'center', paddingHorizontal: layout.screenGutter, paddingBottom: space.lg },
});
