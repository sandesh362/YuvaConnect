/**
 * Ratings & Reviews Flow — wireframe 6/37.
 *
 * Route: /rate/[gigId] (new, additive). Spec: docs/wireframes/06-ratings-reviews.md
 *
 * Data honesty:
 *  - rateGig() is participant-only, completed-gigs-only (APPROVED/PAID/CLOSED),
 *    one rating per user; the ratee is derived server-side. The screen guards
 *    the same statuses client-side and explains when rating isn't open yet.
 *  - The "what went well" tags have NO column: selected tags are composed
 *    into the comment as a leading "Went well: …" line — real text, honestly
 *    composed, schema gap flagged.
 *  - The payout strip renders the gig's REAL Payment (amount + status); it is
 *    hidden when the gig has no payment row.
 *  - If getMyRating() returns an existing rating, the form prefills and
 *    submitting is disabled — one rating per gig is a server rule.
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  Avatar,
  BottomActionBar,
  Card,
  ChipGroup,
  Divider,
  Icon,
  IconButton,
  InfoBanner,
  PrimaryButton,
  RatingInput,
  Screen,
  StatusBadge,
  SuccessState,
  Text,
  TextField,
} from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { getGig } from '@/lib/gig-api';
import { getMyRating, rateGig } from '@/lib/trust-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

const RATABLE = ['APPROVED', 'PAID', 'CLOSED'] as const;

const TAGS = ['Reliable', 'High Quality', 'On Time', 'Good Communication', 'Professional'];

export default function RateExperienceScreen() {
  const { gigId } = useLocalSearchParams<{ gigId: string }>();
  const { token } = useAuth();

  const [score, setScore] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [feedback, setFeedback] = useState('');

  const gigQuery = useQuery({ queryKey: ['gig', gigId], queryFn: () => getGig(token!, gigId!), enabled: !!token && !!gigId });
  const myRatingQuery = useQuery({ queryKey: ['my-rating', gigId], queryFn: () => getMyRating(token!, gigId!), enabled: !!token && !!gigId });

  const existing = myRatingQuery.data ?? null;
  const [prefilled, setPrefilled] = useState(false);
  if (existing && !prefilled) {
    setPrefilled(true);
    setScore(existing.score);
    setFeedback(existing.comment ?? '');
  }

  const gig = gigQuery.data;
  const ratable = !!gig && (RATABLE as readonly string[]).includes(gig.status);
  const businessName = gig?.business?.businessProfile?.businessName ?? gig?.business?.name ?? 'the business';

  const submitMutation = useMutation({
    mutationFn: () => {
      const parts = [
        tags.length ? `Went well: ${tags.join(', ')}.` : '',
        feedback.trim(),
      ].filter(Boolean);
      return rateGig(token!, gigId!, { score, comment: parts.join(' ') || undefined });
    },
    onSuccess: () => myRatingQuery.refetch(),
  });

  const comment = submitMutation.error ? apiErrorMessage(submitMutation.error) : null;

  return (
    <Screen testID="screen-rate">
      {/* --- Sheet-style header --- */}
      <View style={styles.header}>
        <IconButton name="close" accessibilityLabel="Close" onPress={() => router.back()} />
        <View style={styles.headerBody}>
          <Text variant="heading">Rate Experience</Text>
          <Text variant="caption" tone="secondary">
            Gig ID: #{gigId ?? '—'}
          </Text>
        </View>
      </View>

      <ScrollView style={{flex:1}} contentContainerStyle={[styles.content, {flexGrow:1}]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {!token ? (
          <InfoBanner tone="info" icon="info" title="Login required" description="Login to rate a completed gig." />
        ) : gigQuery.isLoading ? (
          <InfoBanner tone="neutral" icon="info" title="Loading gig…" />
        ) : !gig ? (
          <InfoBanner tone="danger" icon="offline" title="Gig not found" description="This gig does not exist or you are not a participant." />
        ) : (
          <>
            {/* --- Hero --- */}
            <SuccessState
              fill={false}
              title="Gig Completed!"
              description={`You've successfully finished the ${gig.title} for ${businessName}.`}
            />

            {/* --- Rating card --- */}
            <Card style={styles.card}>
              <Text variant="heading" style={styles.cardHeading}>
                How was your experience with
              </Text>
              <View style={styles.partyRow}>
                <Avatar name={businessName} size="md" tone={color.successSoft} />
                <View style={styles.partyBody}>
                  <Text variant="calloutStrong" numberOfLines={1}>
                    {businessName}
                  </Text>
                  <View style={styles.partyMeta}>
                    <Icon name="mapPinFilled" size={12} color={color.textSecondary} />
                    <Text variant="caption" tone="secondary" numberOfLines={1}>
                      {gig.location}
                    </Text>
                  </View>
                </View>
              </View>

              <RatingInput
                value={score}
                onChange={existing ? () => undefined : setScore}
                size={40}
                starColor={color.textPrimary}
                emptyColor={color.textPrimary}
                style={styles.stars}
              />

              <Divider style={styles.divider} />

              {existing ? (
                <InfoBanner
                  tone="success"
                  icon="checkCircleFilled"
                  title="You already rated this gig"
                  description="One rating per gig — this is your submitted review."
                />
              ) : (
                <>
                  <Text variant="calloutStrong" style={styles.tagsLabel}>
                    What went well?
                  </Text>
                  <ChipGroup
                    chips={TAGS.map((tag) => ({
                      label: tag,
                      selected: tags.includes(tag),
                      selectedStyle: 'soft' as const,
                      onToggle: () => setTags((current) => (current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag])),
                    }))}
                  />
                  <TextField
                    label="Additional Feedback"
                    value={feedback}
                    onChangeText={setFeedback}
                    placeholder="Tell us more about your experience..."
                    type="textarea"
                    helperText="Your review helps the YuvaConnect community."
                    maxLength={1000}
                    style={styles.feedback}
                  />
                </>
              )}
            </Card>

            {/* --- Guards --- */}
            {!ratable ? (
              <InfoBanner
                tone="warning"
                icon="alarm"
                title="Ratings open once the gig is completed"
                description="You can rate after the work is approved, paid or closed."
              />
            ) : null}
            {comment ? (
              <Text variant="callout" tone="danger">
                {comment}
              </Text>
            ) : null}

            {/* --- Payout strip: real Payment row only --- */}
            {gig.payment ? (
              <View style={styles.payout}>
                <View style={styles.payoutCopy}>
                  <Text variant="captionStrong" tone="secondary">
                    Earnings Released
                  </Text>
                  <Text variant="price">₹{Number(gig.payment.amount).toLocaleString()}.00</Text>
                </View>
                <StatusBadge
                  label={gig.payment.status === 'RELEASED' ? 'PAID' : gig.payment.status}
                  tone={gig.payment.status === 'RELEASED' ? 'success' : gig.payment.status === 'HELD' ? 'warning' : 'neutral'}
                />
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <BottomActionBar>
        <PrimaryButton
          label={submitMutation.isPending ? 'Submitting…' : 'Submit Review'}
          disabled={!ratable || score === 0 || !!existing || submitMutation.isPending}
          onPress={() => submitMutation.mutate()}
          testID="rate-submit"
        />
      </BottomActionBar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    paddingHorizontal: space.sm,
    paddingVertical: space.md,
    borderBottomWidth: 1,
    borderBottomColor: color.borderSubtle,
  },
  headerBody: { flex: 1, gap: 2 },

  content: {
    padding: layout.screenGutter,
    gap: space.xl,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 160,
  },

  card: { gap: space.md },
  cardHeading: { textAlign: 'center' },
  partyRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, alignSelf: 'center' },
  partyBody: { gap: 2 },
  partyMeta: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  stars: { marginTop: space.sm },
  divider: { marginVertical: space.sm },
  tagsLabel: { marginTop: space.xs },
  feedback: { marginTop: space.sm },

  payout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    backgroundColor: color.primarySoft,
    borderRadius: radius.lg,
    paddingHorizontal: space.base,
    paddingVertical: space.base,
  },
  payoutCopy: { gap: 2 },
});
