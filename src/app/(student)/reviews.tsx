/**
 * Student Reviews ("Reviews & Ratings") — wireframe 24/37.
 *
 * Route: /reviews (new, additive; ?userId= defaults to me).
 * Spec: docs/wireframes/24-student-reviews.md
 *
 * Data honesty:
 *  - Everything comes from the REAL GET /api/users/:id/ratings: summary,
 *    individual Rating rows (score, comment, createdAt, fromUser, gig title).
 *  - The histogram is a client aggregate of those real scores.
 *  - The mint tag pills (On Time / Pro Communication…) have NO column and are
 *    never parsed out of comments — the slot carries a flag caption instead.
 *  - Review cards omit the export's ₹ amount / "Verified MSME" overline /
 *    completion date: the Rating payload has none of those. The date shown is
 *    the real rating date, labelled as such.
 *  - The footer trust line is reworded to a claim the data actually supports:
 *    reviews only ever come from gig counterparties (participants).
 */
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import {
  Avatar,
  BottomTabBar,
  Divider,
  EmptyState,
  ErrorState,
  Icon,
  LoadingSkeleton,
  RatingStars,
  Screen,
  ScreenHeader,
  SectionHeader,
  Text,
} from '@/components/ui';
import { STUDENT_TABS } from '@/components/ui/BottomTabBar';
import { apiErrorMessage } from '@/config/api';
import { getUserRatings } from '@/lib/trust-api';
import { goStudentTab } from '@/lib/tab-nav';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

type SortKey = 'newest' | 'oldest' | 'highest';
const SORT_LABEL: Record<SortKey, string> = { newest: 'Newest', oldest: 'Oldest', highest: 'Highest' };

export default function ReviewsScreen() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const { token, user } = useAuth();
  const [sort, setSort] = useState<SortKey>('newest');

  const target = userId || user?.id;
  const query = useQuery({
    queryKey: ['user-ratings', target],
    queryFn: () => getUserRatings(token!, target!),
    enabled: !!token && !!target,
  });

  const summary = query.data?.summary;
  const ratings = useMemo(() => {
    const list = [...(query.data?.ratings ?? [])];
    if (sort === 'newest') list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (sort === 'oldest') list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (sort === 'highest') list.sort((a, b) => b.score - a.score || b.createdAt.localeCompare(a.createdAt));
    return list;
  }, [query.data, sort]);

  const histogram = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const rating of ratings) counts[Math.min(4, Math.max(0, Math.round(rating.score) - 1))] += 1;
    const total = ratings.length || 1;
    return [5, 4, 3, 2, 1].map((star) => ({ star, count: counts[star - 1], pct: (counts[star - 1] / total) * 100 }));
  }, [ratings]);

  const share = async () => {
    try {
      await Share.share({ message: `My YuvaConnect reviews${summary ? ` — ${summary.avgRating.toFixed(1)}/5 from ${summary.totalRatings} ratings` : ''}` });
    } catch {
      // platform without Share support — silent, flagged in spec
    }
  };

  const cycleSort = () => setSort((current) => (current === 'newest' ? 'oldest' : current === 'oldest' ? 'highest' : 'newest'));

  return (
    <Screen testID="screen-reviews">
      <ScreenHeader title="Reviews & Ratings" onBack={() => router.back()} actions={[{ icon: 'shareIos', accessibilityLabel: 'Share reviews', onPress: share }]} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!token || !target ? (
          <EmptyState title="Login to see reviews" icon="star" primaryLabel="Login" onPrimary={() => router.replace('/login' as never)} />
        ) : query.isLoading ? (
          <LoadingSkeleton count={3} variant="card" />
        ) : query.isError ? (
          <ErrorState title="Could not load reviews" description={apiErrorMessage(query.error)} retryLabel="Retry" onRetry={() => query.refetch()} />
        ) : !summary || summary.totalRatings === 0 ? (
          <EmptyState
            title="No reviews yet"
            description="Reviews appear here after businesses rate your completed gigs."
            icon="star"
            wellSize="lg"
          />
        ) : (
          <>
            {/* --- Summary card --- */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <Text variant="display">{summary.avgRating.toFixed(1)}</Text>
                  <RatingStars value={summary.avgRating} size={16} showValue={false} starColor={color.textPrimary} emptyColor={color.textPrimary} />
                  <Text variant="caption" tone="secondary">
                    Based on {summary.totalRatings} rating{summary.totalRatings === 1 ? '' : 's'}
                  </Text>
                </View>
                <View style={styles.histogram}>
                  {histogram.map((row) => (
                    <View key={row.star} style={styles.histRow}>
                      <Text variant="caption" tone="secondary" style={styles.histLabel}>
                        {row.star}
                      </Text>
                      <View style={styles.histTrack}>
                        <View style={[styles.histFill, { width: `${row.pct}%` }]} />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
              <Divider />
              <View style={styles.flagRow}>
                <Icon name="info" size={14} color={color.textSecondary} />
                <Text variant="caption" tone="tertiary" style={styles.flagCopy}>
                  Skill tags (On Time, Pro Communication…) have no backend column yet — shown nowhere rather than invented.
                </Text>
              </View>
            </View>

            {/* --- Recent feedback --- */}
            <SectionHeader title="Recent Feedback" />
            <Pressable accessibilityRole="button" accessibilityLabel={`Sort: ${SORT_LABEL[sort]}`} onPress={cycleSort} style={styles.sortRow}>
              <Text variant="calloutStrong" tone="brand">
                {SORT_LABEL[sort]}
              </Text>
              <Icon name="shuffle" size={14} color={color.primary} />
            </Pressable>

            {ratings.map((rating) => (
              <View key={rating.id} style={styles.reviewCard}>
                <View style={styles.reviewHead}>
                  <Avatar name={rating.fromUser?.name ?? 'Business'} size="md" tone={color.successSoft} />
                  <View style={styles.reviewHeadCopy}>
                    <Text variant="calloutStrong" numberOfLines={1}>
                      {rating.fromUser?.name ?? 'Business'}
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      Rated {new Date(rating.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                </View>
                {rating.gig?.title ? (
                  <Text variant="title3" numberOfLines={2}>
                    {rating.gig.title}
                  </Text>
                ) : null}
                {rating.comment ? (
                  <Text variant="callout" tone="secondary" style={styles.reviewBody}>
                    {rating.comment}
                  </Text>
                ) : null}
                <RatingStars value={rating.score} size={14} showValue={false} starColor={color.textPrimary} emptyColor={color.textPrimary} />
              </View>
            ))}

            {/* --- Trust footer (reworded to a supportable claim) --- */}
            <View style={styles.trustFooter}>
              <Icon name="shieldCheckFilled" size={16} color={color.textPrimary} />
              <Text variant="caption" tone="secondary" style={styles.trustCopy}>
                All reviews come from businesses you completed gigs with.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <BottomTabBar items={STUDENT_TABS} activeKey="profile" onSelect={goStudentTab} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: layout.screenGutter,
    gap: space.md,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 120,
  },

  summaryCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.base,
    gap: space.md,
  },
  summaryRow: { flexDirection: 'row', gap: space.base },
  summaryLeft: { width: '38%', gap: space.sm },
  histogram: { flex: 1, gap: space.sm, justifyContent: 'center' },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  histLabel: { width: 10, textAlign: 'right' },
  histTrack: { flex: 1, height: 8, borderRadius: radius.full, backgroundColor: color.skeletonBase, overflow: 'hidden' },
  histFill: { height: 8, borderRadius: radius.full, backgroundColor: color.star },
  flagRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flagCopy: { flex: 1, lineHeight: 17 },

  sortRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, alignSelf: 'flex-end' },

  reviewCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.base,
    gap: space.sm,
  },
  reviewHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  reviewHeadCopy: { flex: 1, gap: 2 },
  reviewBody: { lineHeight: 21 },

  trustFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingTop: space.md },
  trustCopy: { flexShrink: 1 },
});
