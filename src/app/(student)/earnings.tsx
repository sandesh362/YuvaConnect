/**
 * Student Earnings — wireframe 20/37. Rebuild in place, route unchanged.
 *
 * Route: /(student)/earnings  ·  Spec: docs/wireframes/20-student-earnings.md
 *
 * Data honesty:
 *  - Total, This Month and the trend series are REAL /api/earnings payments
 *    (RELEASED rows with gigTitle + date). Monthly bucketing, the +N% pill
 *    (last 30 days vs the 30 before) and "Since joining in {month}" (first
 *    payout month) are client-side derivations over that real data.
 *  - "Pending" is NOT exposed by the endpoint (it returns RELEASED only) →
 *    the card shows "—" with a flag hint, never a invented number.
 *  - Transaction captions show the real date + gig title; the business name
 *    is not in the payload → omitted (flagged).
 *  - Gear icon omitted (no settings destination exists — flagged).
 *  - Chart: dependency-free View-based LineChart (expo install is TLS-broken
 *    in this environment; the spec preferred no new dep anyway).
 */
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  BottomTabBar,
  EmptyState,
  ErrorState,
  Icon,
  InfoBanner,
  LineChart,
  LoadingSkeleton,
  Screen,
  ScreenHeader,
  SectionHeader,
  StatBox,
  Text,
} from '@/components/ui';
import { STUDENT_TABS, type TabItem } from '@/components/ui/BottomTabBar';
import { apiErrorMessage } from '@/config/api';
import { getEarnings } from '@/lib/gig-api';
import { goStudentTab } from '@/lib/tab-nav';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

/** Earnings export swaps Messages for Earnings in the tab bar (per-export variant). */
const EARNINGS_TABS: TabItem[] = STUDENT_TABS.filter((tab) => tab.key !== 'messages').flatMap((tab) =>
  tab.key === 'mygigs'
    ? [tab, { key: 'earnings', label: 'Earnings', icon: 'wallet', activeIcon: 'walletFilled' } as TabItem]
    : [tab],
);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function EarningsScreen() {
  const { token } = useAuth();
  const [showAll, setShowAll] = useState(false);

  const query = useQuery({ queryKey: ['earnings'], queryFn: () => getEarnings(token!), enabled: !!token });
  const payments = query.data?.payments ?? [];
  const total = Number(query.data?.total ?? 0);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    const sixtyDaysAgo = Date.now() - 60 * 86400000;

    let thisMonth = 0;
    let last30 = 0;
    let prev30 = 0;
    let firstDate: number | null = null;
    const buckets = new Map<string, { label: string; value: number; time: number }>();

    for (const payment of payments) {
      const amount = Number(payment.amount);
      const time = new Date(payment.date).getTime();
      if (time >= monthStart) thisMonth += amount;
      if (time >= thirtyDaysAgo) last30 += amount;
      else if (time >= sixtyDaysAgo) prev30 += amount;
      if (firstDate === null || time < firstDate) firstDate = time;
      const key = payment.date.slice(0, 7);
      const stamp = new Date(payment.date);
      const existing = buckets.get(key);
      buckets.set(key, { label: MONTHS[stamp.getMonth()], value: (existing?.value ?? 0) + amount, time: stamp.getTime() });
    }

    const series = [...buckets.values()].sort((a, b) => a.time - b.time).slice(-6);
    const trendPct = prev30 > 0 ? ((last30 - prev30) / prev30) * 100 : null;
    const joinedMonth = firstDate ? MONTHS[new Date(firstDate).getMonth()] : null;

    return { thisMonth, series, trendPct, joinedMonth };
  }, [payments]);

  const visible = showAll ? payments : payments.slice(0, 3);

  return (
    <Screen testID="screen-earnings">
      <ScreenHeader title="Earnings" subtitle="Track your income & growth" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!token ? (
          <EmptyState title="Login to see your earnings" icon="wallet" primaryLabel="Login" onPrimary={() => router.replace('/login' as never)} />
        ) : query.isLoading ? (
          <LoadingSkeleton count={3} variant="card" />
        ) : query.isError ? (
          <ErrorState title="Could not load earnings" description={apiErrorMessage(query.error)} retryLabel="Retry" onRetry={() => query.refetch()} />
        ) : (
          <>
            {/* --- Solid blue hero --- */}
            <View style={styles.hero}>
              <View style={styles.heroTop}>
                <Text variant="captionStrong" style={styles.heroCaption}>
                  Total Earnings
                </Text>
                <Icon name="walletFilled" size={22} color="rgba(255,255,255,0.9)" />
              </View>
              <Text variant="display" style={styles.heroTotal}>
                ₹{total.toLocaleString()}
              </Text>
              {stats.trendPct !== null ? (
                <View style={styles.heroRow}>
                  <View style={styles.heroPill}>
                    <Icon name="trendUp" size={13} color={color.textInverse} />
                    <Text variant="captionStrong" style={styles.heroPillText}>
                      {stats.trendPct >= 0 ? '+' : ''}
                      {stats.trendPct.toFixed(1)}%
                    </Text>
                  </View>
                  <Text variant="caption" style={styles.heroSince}>
                    Since joining in {stats.joinedMonth ?? '—'}
                  </Text>
                </View>
              ) : (
                <Text variant="caption" style={styles.heroSince}>
                  {stats.joinedMonth ? `Since joining in ${stats.joinedMonth}` : 'Released payments only'}
                </Text>
              )}
            </View>

            {/* --- Stat cards --- */}
            <View style={styles.statRow}>
              <StatBox variant="plain" label="This Month" value={`₹${stats.thisMonth.toLocaleString()}`} style={styles.statCell} />
              <StatBox
                variant="plain"
                label="Pending"
                value="—"
                hint="not exposed by the earnings API"
                style={styles.statCell}
              />
            </View>

            {/* --- Income trend chart --- */}
            <View style={styles.card}>
              <Text variant="title3">Income Trend</Text>
              {stats.series.length ? (
                <LineChart data={stats.series.map((point) => point.value)} labels={stats.series.map((point) => point.label)} />
              ) : (
                <Text variant="callout" tone="tertiary">
                  Your monthly trend appears here once released payments span a month.
                </Text>
              )}
            </View>

            {/* --- Recent transactions --- */}
            <View style={styles.section}>
              <SectionHeader
                title="Recent Transactions"
                actionLabel={payments.length > 3 ? (showAll ? 'Show less' : 'View All') : undefined}
                onAction={payments.length > 3 ? () => setShowAll((value) => !value) : undefined}
              />
              {payments.length === 0 ? (
                <InfoBanner
                  tone="neutral"
                  icon="wallet"
                  title="No released payments yet"
                  description="Money lands here the moment a business releases escrow on one of your gigs."
                />
              ) : (
                visible.map((payment) => (
                  <View key={payment.id} style={styles.txRow}>
                    <View style={styles.txWell}>
                      <Icon name="check" size={18} color={color.textPrimary} />
                    </View>
                    <View style={styles.txCopy}>
                      <Text variant="calloutStrong" numberOfLines={1}>
                        {payment.gigTitle}
                      </Text>
                      <Text variant="caption" tone="secondary" numberOfLines={1}>
                        {new Date(payment.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                      </Text>
                    </View>
                    <Text variant="calloutStrong">+₹{Number(payment.amount).toLocaleString()}</Text>
                  </View>
                ))
              )}
              <Text variant="caption" tone="tertiary">
                Released payments only — pending/in-review amounts and business names are not exposed by /api/earnings yet (flagged).
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <BottomTabBar items={EARNINGS_TABS} activeKey="earnings" onSelect={goStudentTab} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: layout.screenGutter,
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 120,
  },

  hero: {
    backgroundColor: color.primary,
    borderRadius: 20,
    padding: space.xl,
    gap: space.sm,
    ...shadow.primary,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroCaption: { color: color.textInverse },
  heroTotal: { color: color.textInverse },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.xs },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.full,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  heroPillText: { color: color.textInverse },
  heroSince: { color: 'rgba(255,255,255,0.85)' },

  statRow: { flexDirection: 'row', gap: space.md },
  statCell: { flex: 1 },

  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.base,
    gap: space.base,
    marginTop: space.md,
  },

  section: { gap: space.md, marginTop: space.md },
  txRow: {
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
  txWell: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: color.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txCopy: { flex: 1, gap: 2 },
});
