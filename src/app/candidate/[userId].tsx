/**
 * Candidate Profile View — wireframe 30/37. NEW additive route /candidate/[userId].
 * Specs: docs/wireframes/30-candidate-profile.md
 *
 * Real directory (not a (group)) so the literal URL matches the spec — the
 * same expo-router lesson as /business/verify.
 *
 * What is REAL:
 *  - Identity (name, college, skills, avgRating, pastGigCount) comes from
 *    GET /api/gigs/:gigId/applicants when opened with ?gigId= (Manage
 *    Applicants deep-links it) — the live API has no public GET /users/:id.
 *  - Rating summary + Business Reviews = GET /api/users/:id/ratings (real
 *    fromUser names, scores, comments, gig titles).
 *
 * Flags (never faked):
 *  - Distance: no geo backend — tile shows "—" with a hint.
 *  - Degree/year ("B.Tech • Final Year"): StudentProfile has no such columns —
 *    the caption shows the real college only.
 *  - Green verified tick: User.isVerified is not exposed on any payload this
 *    screen can reach — omitted, not faked.
 *  - Portfolio: no public endpoint for another user's items (and PortfolioItem
 *    lacks the category/business/amount the wireframe draws) — the section
 *    carries a flag notice instead of cards.
 *  - Share + Heart (Saved Talent): no backend — flag notices on tap.
 *  - Chat: real per-gig thread when ?gigId= is present; flagged otherwise.
 *  - Select Student: deep-links Confirm Selection (screen 32) when the
 *    application is resolvable via the ?gigId= applicants payload.
 */
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  Button,
  ErrorState,
  Icon,
  IconButton,
  InfoBanner,
  LoadingSkeleton,
  RatingStars,
  Screen,
  ScreenHeader,
  StatBox,
  Text,
} from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { getApplicants } from '@/lib/gig-api';
import { getUserRatings } from '@/lib/trust-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { Application, Rating } from '@/types/api';

type ApplicantStudent = {
  id: string;
  name: string;
  email: string;
  studentProfile?: { college: string; skills: string[]; bio: string; profileImageUrl: string | null } | null;
};
type Applicant = Application & { student: ApplicantStudent; avgRating: number; totalRatings: number; pastGigCount: number };

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase();
}

export default function CandidateProfileScreen() {
  const { userId, gigId } = useLocalSearchParams<{ userId: string; gigId?: string }>();
  const { token } = useAuth();
  const [notice, setNotice] = useState<string | null>(null);

  const applicantsQuery = useQuery({
    queryKey: ['applicants', gigId, token],
    queryFn: () => getApplicants(token!, gigId!) as Promise<Applicant[]>,
    enabled: !!token && !!gigId,
  });
  const ratingsQuery = useQuery({
    queryKey: ['user-ratings', userId, token],
    queryFn: () => getUserRatings(token!, userId),
    enabled: !!token && !!userId,
  });

  const applicant = applicantsQuery.data?.find((item) => item.student.id === userId);
  const student = applicant?.student;
  const summary = ratingsQuery.data?.summary;
  const ratings: Rating[] = ratingsQuery.data?.ratings ?? [];
  const rating = summary?.avgRating ?? applicant?.avgRating ?? 0;
  const totalRatings = summary?.totalRatings ?? applicant?.totalRatings ?? 0;
  const skills = student?.studentProfile?.skills ?? [];
  const college = student?.studentProfile?.college ?? '';

  const isLoading = (!!gigId && applicantsQuery.isLoading) || ratingsQuery.isLoading;
  const loadError = applicantsQuery.error ?? ratingsQuery.error;

  return (
    <Screen testID="screen-candidate-profile">
      <ScreenHeader
        title=""
        onBack={() => router.back()}
        variant="solid"
        actions={[
          {
            icon: 'share',
            accessibilityLabel: 'Share profile',
            onPress: () => setNotice('Profile sharing has no backend link or endpoint yet — flagged, not faked.'),
          },
          {
            icon: 'heart',
            accessibilityLabel: 'Save to Saved Talent',
            onPress: () => setNotice('Saved Talent has no backend (decision: ship-empty + flagged, screen 37). The heart is kept per the wireframe and raises this notice.'),
          },
        ]}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {notice ? <InfoBanner tone="warning" icon="info" title="Flagged, not faked" description={notice} /> : null}

        {isLoading ? <LoadingSkeleton count={2} /> : null}
        {loadError && !isLoading ? (
          <ErrorState
            title="Could not load candidate"
            description={apiErrorMessage(loadError)}
            onRetry={() => {
              if (gigId) applicantsQuery.refetch();
              ratingsQuery.refetch();
            }}
          />
        ) : null}

        {!isLoading && !loadError ? (
          <>
            {!student ? (
              <InfoBanner
                tone="info"
                icon="info"
                title="Limited profile"
                description="The live API has no public GET /users/:id. Identity and skills load when this screen is opened from Manage Applicants (which passes the gig). Ratings below are fetched by user id and are real either way."
              />
            ) : null}

            {/* Avatar + identity */}
            <View style={styles.identityBlock}>
              <View style={styles.avatarCircle} accessibilityLabel={student?.name ?? 'Candidate'}>
                <Text variant="title1" style={styles.avatarText}>
                  {initialsOf(student?.name ?? 'Candidate')}
                </Text>
              </View>
              <Text variant="title1">{student?.name ?? 'Candidate'}</Text>
              {college ? (
                <Text variant="bodyStrong" style={styles.collegeLink}>
                  {college}
                </Text>
              ) : null}
              <Text variant="caption" tone="tertiary">
                Degree and year are not stored on StudentProfile — the real college line is all the schema holds.
              </Text>
            </View>

            {/* Stats */}
            <View style={styles.statRow}>
              <StatBox variant="plain" icon="starFilled" value={rating > 0 ? rating.toFixed(1) : '—'} label="Rating" hint={`${totalRatings} reviews`} style={styles.stat} testID="candidate-stat-rating" />
              <StatBox variant="plain" icon="briefcase" value={String(applicant?.pastGigCount ?? '—')} label="Gigs" hint="completed" style={styles.stat} testID="candidate-stat-gigs" />
              <StatBox variant="plain" icon="mapPin" value="—" label="Distance" hint="no geo backend" style={styles.stat} testID="candidate-stat-distance" />
            </View>

            {/* Expertise */}
            <Text variant="title2">Expertise</Text>
            <Text variant="caption" tone="tertiary">
              Skill sets from the student profile
            </Text>
            {skills.length > 0 ? (
              <View style={styles.skillWrap}>
                {skills.map((skill) => (
                  <View key={skill} style={styles.skillPill}>
                    <Text variant="captionStrong" style={styles.skillLabel}>
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text variant="body" tone="tertiary">
                No skills listed{student ? '' : ' — open from Manage Applicants to load them'}.
              </Text>
            )}

            {/* Portfolio — flagged, no public endpoint */}
            <Text variant="title2">Portfolio</Text>
            <Text variant="caption" tone="tertiary">
              Recent work on YuvaConnect
            </Text>
            <InfoBanner
              tone="info"
              icon="image"
              title="Portfolio is not public yet"
              description="Portfolio items belong to the student's own profile — the live API exposes no endpoint to read another user's items, and PortfolioItem has no category/business/amount columns the wireframe draws. Flagged, not faked."
            />

            {/* Business reviews — real */}
            <Text variant="title2">Business Reviews</Text>
            <Text variant="caption" tone="tertiary">
              What owners say
            </Text>
            {ratings.length === 0 ? (
              <Text variant="body" tone="tertiary">
                No reviews yet — ratings appear after completed gigs.
              </Text>
            ) : (
              ratings.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewTop}>
                    <Text variant="bodyStrong" numberOfLines={1} style={styles.reviewName}>
                      {review.fromUser?.name ?? 'Business'}
                    </Text>
                    <RatingStars value={review.score} size={14} showValue={false} starColor={color.textPrimary} />
                  </View>
                  {review.gig?.title ? (
                    <Text variant="caption" tone="tertiary" numberOfLines={1}>
                      {review.gig.title}
                    </Text>
                  ) : null}
                  {review.comment ? (
                    <Text variant="body" tone="secondary" numberOfLines={3} style={styles.reviewBody}>
                      {review.comment}
                    </Text>
                  ) : null}
                </View>
              ))
            )}
          </>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sticky action bar */}
      <View style={styles.stickyBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Chat with candidate"
          onPress={() =>
            gigId
              ? router.push(`/(shared)/chat/${gigId}` as never)
              : setNotice('Chat is per-gig on the live backend. Open this profile from Manage Applicants to message with gig context.')
          }
          style={({ pressed }) => [styles.chatButton, pressed && styles.pressed]}
          testID="candidate-chat">
          <Icon name="chat" size={22} color={color.primary} />
        </Pressable>
        <Button
          label="Select Student"
          size="lg"
          style={styles.selectButton}
          disabled={!applicant || !gigId}
          onPress={() => applicant && gigId && router.push(`/assign/${applicant.id}?gigId=${gigId}` as never)}
          testID="candidate-select"
        />
      </View>
    </Screen>
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

  identityBlock: { alignItems: 'center', gap: space.sm, paddingVertical: space.md },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: color.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  avatarText: { color: color.primary },
  collegeLink: { color: color.primary, fontWeight: '700' },

  statRow: { flexDirection: 'row', gap: space.md },
  stat: { flex: 1 },

  skillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  skillPill: {
    backgroundColor: color.successSoft,
    borderRadius: radius.full,
    paddingHorizontal: space.base,
    paddingVertical: space.sm,
  },
  skillLabel: { color: color.successStrong },

  reviewCard: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.lg,
    padding: space.base,
    gap: space.sm,
  },
  reviewTop: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  reviewName: { flex: 1 },
  reviewBody: { lineHeight: 20 },

  bottomSpacer: { height: space.lg },
  stickyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.divider,
    paddingHorizontal: layout.screenGutter,
    paddingVertical: space.md,
  },
  chatButton: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
  },
  selectButton: { flex: 1 },
  pressed: { opacity: 0.7 },
});
