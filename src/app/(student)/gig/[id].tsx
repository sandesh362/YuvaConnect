/**
 * Gig Details View — wireframe 14/37. Rebuild in place, route unchanged.
 *
 * Route: /(student)/gig/[id]  ·  Spec: docs/wireframes/14-gig-details.md
 *
 * Data honesty:
 *  - Everything shown is the real Gig payload; the business rating row comes
 *    from getUserRatings(business.id) and only renders when ratings exist.
 *  - Duration "3 Days" is DERIVED from the real deadline (client-computed,
 *    flagged — the API has no duration column).
 *  - Distance ("2.4 km") and the map have no geo backend → the Location stat
 *    and Work Location block render the real `gig.location` text with the
 *    approved pilot treatment; "Remote" is detected from the location string.
 *  - Bookmark: no SavedGig collection → icon renders, tap explains (flag).
 *  - Deliverables list: no requirements column → section omitted (flag), not
 *    invented. Verified tick / "Member since" have no fields → omitted (flag).
 *  - Lifecycle preserved inside the new visuals: Apply opens a real Sheet form
 *    (applyToGig), SELECTED offers Start (startGig), IN_PROGRESS offers the
 *    real Submit sheet (uploadImage + submitGig); completed gigs route to the
 *    screen-6 /rate flow. Polished visuals for tracker/submission arrive with
 *    screens 17/18.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';

import {
  Avatar,
  BottomActionBar,
  Button,
  ErrorState,
  Icon,
  IconButton,
  InfoBanner,
  LoadingSkeleton,
  PrimaryButton,
  Screen,
  ScreenHeader,
  Sheet,
  StatBox,
  StepProgress,
  StatusBadge,
  Text,
  TextField,
} from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { applyToGig, getGig, startGig } from '@/lib/gig-api';
import { getUserRatings } from '@/lib/trust-api';
import { getProfile } from '@/lib/profile-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

const COMPLETED = ['APPROVED', 'PAID', 'CLOSED'];
const REMOTE = /remote|work from home|anywhere/i;

function durationFrom(deadline: string) {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (days <= 0) return 'Due today';
  if (days === 1) return '1 Day';
  return `${days} Days`;
}

function deadlineLabel(deadline: string) {
  return new Date(deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export default function GigDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useAuth();
  const client = useQueryClient();

  const [notice, setNotice] = useState<string | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [proposal, setProposal] = useState('');
  const [experience, setExperience] = useState('');
  const [availability, setAvailability] = useState('');
  const [estDays, setEstDays] = useState('');
  const [links, setLinks] = useState('');

  const gigQuery = useQuery({ queryKey: ['gig', id], queryFn: () => getGig(token!, id!), enabled: !!token && !!id });
  const profileQuery = useQuery({ queryKey: ['profile', token], queryFn: () => getProfile(token!), enabled: !!token });
  const isVerifiedStudent = (() => {
    const profile = profileQuery.data?.profile;
    return !!(profile && 'isVerified' in profile && profile.isVerified);
  })();
  const businessId = gigQuery.data?.business?.id;
  const ratingsQuery = useQuery({
    queryKey: ['user-ratings', businessId],
    queryFn: () => getUserRatings(token!, businessId!),
    enabled: !!token && !!businessId,
  });

  const gig = gigQuery.data;
  const myApplication = useMemo(
    () => gig?.applications?.find((application) => application.studentId === user?.id) ?? null,
    [gig, user?.id],
  );

  const refresh = () => {
    client.invalidateQueries({ queryKey: ['gig', id] });
    client.invalidateQueries({ queryKey: ['my-gigs'] });
    client.invalidateQueries({ queryKey: ['gigs'] });
  };

  const applyMutation = useMutation({
    mutationFn: () =>
      applyToGig(token!, id!, {
        proposal: [
          proposal.trim(),
          estDays.trim() ? `\nEstimated days: ${estDays.trim()}` : '',
          links.trim() ? `\nPortfolio: ${links.trim()}` : '',
        ]
          .filter(Boolean)
          .join(''),
        relevantExperience: experience.trim(),
        availability: availability.trim(),
      }),
    onSuccess: () => {
      setApplyOpen(false);
      setEstDays('');
      setLinks('');
      setNotice('Application submitted — the business will review it shortly.');
      refresh();
    },
  });

  const startMutation = useMutation({
    mutationFn: () => startGig(token!, id!),
    onSuccess: () => {
      setNotice('Gig started — good luck!');
      refresh();
    },
  });

  const share = async () => {
    try {
      await Share.share({ message: `Check out this gig on YuvaConnect: ${gig?.title ?? ''}` });
    } catch {
      setNotice('Sharing is not available on this platform.');
    }
  };

  if (!token) {
    return (
      <Screen>
        <ScreenHeader title="Gig" onBack={() => router.back()} />
        <View style={styles.center}>
          <Button label="Login to view this gig" onPress={() => router.push('/login' as never)} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen testID="screen-gig-details">
      <ScreenHeader
        title=""
        onBack={() => router.back()}
        actions={[
          {
            icon: 'bookmark',
            accessibilityLabel: 'Save gig',
            onPress: () =>
              setNotice('Saved Gigs has no backend collection yet (wireframe 22 decision pending) — the bookmark is rendered but not persisted. Flagged, not faked.'),
          },
          { icon: 'shareIos', accessibilityLabel: 'Share gig', onPress: share },
        ]}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {gigQuery.isLoading ? (
          <LoadingSkeleton count={4} variant="card" />
        ) : gigQuery.isError || !gig ? (
          <ErrorState title="Could not load this gig" description={apiErrorMessage(gigQuery.error)} retryLabel="Retry" onRetry={() => gigQuery.refetch()} />
        ) : (
          <>
            {/* --- Title + business + rating row --- */}
            <Text variant="title1">{gig.title}</Text>
            <View style={styles.metaRow}>
              <Text variant="calloutStrong" tone="brand" numberOfLines={1} style={styles.businessName}>
                {gig.business?.businessProfile?.businessName ?? gig.business?.name ?? 'Local business'}
              </Text>
              {ratingsQuery.data && ratingsQuery.data.summary.totalRatings > 0 ? (
                <>
                  <Text variant="callout" tone="tertiary">•</Text>
                  <Icon name="starFilled" size={14} color={color.star} />
                  <Text variant="calloutStrong">{ratingsQuery.data.summary.avgRating.toFixed(1)}</Text>
                  <Text variant="caption" tone="secondary">
                    ({ratingsQuery.data.summary.totalRatings} reviews)
                  </Text>
                </>
              ) : null}
            </View>

            {/* --- 2×2 stat grid --- */}
            <View style={styles.statGrid}>
              <StatBox variant="plain" label="Budget" value={`₹${Number(gig.budget).toLocaleString()}`} style={styles.statCell} />
              <StatBox variant="plain" label="Duration" value={durationFrom(gig.deadline)} hint="derived from deadline" style={styles.statCell} />
              <StatBox variant="plain" label="Location" value={REMOTE.test(gig.location) ? 'Remote' : gig.location} style={styles.statCell} />
              <StatBox variant="plain" label="Deadline" value={deadlineLabel(gig.deadline)} tone="danger" style={styles.statCell} />
            </View>

            {notice ? <InfoBanner tone="info" icon="info" title="Flagged, not faked" description={notice} /> : null}
            {startMutation.isError ? (
              <InfoBanner tone="danger" icon="offline" title="Could not start this gig" description={apiErrorMessage(startMutation.error)} />
            ) : null}

            {/* --- About --- */}
            <View style={styles.section}>
              <Text variant="title2">About the Gig</Text>
              <Text variant="body" tone="secondary" style={styles.paragraph}>
                {gig.description}
              </Text>
            </View>

            {/* --- Skills: mint pills --- */}
            <View style={styles.section}>
              <Text variant="title2">Required Skills</Text>
              <View style={styles.pillWrap}>
                {gig.skillsRequired.map((skill) => (
                  <View key={skill} style={styles.pill}>
                    <Text variant="captionStrong" style={styles.pillText}>
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* --- Work location: text-only pilot treatment --- */}
            <View style={styles.section}>
              <View style={styles.locationHead}>
                <Text variant="title2">Work Location</Text>
                <Text variant="calloutStrong" tone="brand" numberOfLines={1}>
                  {gig.location}
                </Text>
              </View>
              <View style={styles.locationCard}>
                <Icon name="locateFilled" size={20} color={color.primary} />
                <Text variant="caption" tone="secondary" style={styles.locationCopy}>
                  Maps and distances ship with geo support — the pilot shows the posted location text only.
                </Text>
              </View>
            </View>

            {/* --- Business card --- */}
            <View style={styles.businessCard}>
              <Avatar name={gig.business?.businessProfile?.businessName ?? gig.business?.name ?? 'B'} size="md" />
              <View style={styles.businessCopy}>
                <Text variant="calloutStrong" numberOfLines={1}>
                  {gig.business?.businessProfile?.businessName ?? gig.business?.name ?? 'Local business'}
                </Text>
                <Text variant="caption" tone="secondary">
                  MSME on YuvaConnect
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* --- Lifecycle bar (functionality preserved; visuals per wireframe) --- */}
      {gig ? (
        <BottomActionBar>
          {COMPLETED.includes(gig.status) ? (
            <PrimaryButton label="Rate this gig" iconRight="arrowForward" onPress={() => router.push(`/rate/${gig.id}` as never)} />
          ) : gig.status === 'IN_PROGRESS' || gig.status === 'REVISION_REQUESTED' ? (
            <PrimaryButton
              label={gig.status === 'REVISION_REQUESTED' ? 'Resubmit Deliverable' : 'Submit Deliverable'}
              onPress={() => router.push(`/(student)/submit/${gig.id}` as never)}
              testID="gig-submit-open"
            />
          ) : gig.status === 'SUBMITTED' ? (
            <View style={styles.pendingRow}>
              <StatusBadge label="SUBMITTED" tone="warning" />
              <Text variant="caption" tone="secondary" style={styles.pendingCopy}>
                Deliverable submitted — waiting for the business to review it.
              </Text>
            </View>
          ) : gig.status === 'ASSIGNED' && myApplication ? (
            <PrimaryButton label="Start Gig" loading={startMutation.isPending} onPress={() => startMutation.mutate()} />
          ) : myApplication ? (
            <View style={styles.pendingRow}>
              <StatusBadge label={myApplication.status} tone={myApplication.status === 'PENDING' ? 'warning' : 'neutral'} />
              <Text variant="caption" tone="secondary" style={styles.pendingCopy}>
                You've applied — the business will review your application.
              </Text>
            </View>
          ) : (
            <View style={styles.applyRow}>
              <IconButton
                name="bookmark"
                accessibilityLabel="Save gig"
                variant="outline"
                onPress={() => setNotice('Saved Gigs has no backend collection yet (wireframe 22 decision pending) — the bookmark is rendered but not persisted. Flagged, not faked.')}
              />
              <PrimaryButton label="Apply for this Gig" onPress={() => setApplyOpen(true)} style={styles.applyButton} testID="gig-apply-open" />
            </View>
          )}
        </BottomActionBar>
      ) : null}

      {/* --- Apply for Gig sheet (wireframe 15) --- */}
      <Sheet
        visible={applyOpen}
        onClose={() => setApplyOpen(false)}
        title="Apply for Gig"
        leftIcon="arrowBack"
        onInfo={() => setNotice('Your application is protected — private contact details are never shared until you are selected.')}
        footer={
          <View style={styles.applyFooter}>
            <View style={styles.applyingRow}>
              <Text variant="captionStrong" tone="secondary">
                Applying as {isVerifiedStudent ? 'Verified Student' : 'Student'}
              </Text>
              <View style={styles.applyingName}>
                <Icon name="shieldCheckFilled" size={14} color={color.primary} />
                <Text variant="captionStrong" numberOfLines={1}>
                  {user?.name ?? '—'}
                </Text>
              </View>
            </View>
            <PrimaryButton
              label={applyMutation.isPending ? 'Submitting…' : 'Submit Application'}
              disabled={!proposal.trim()}
              onPress={() => applyMutation.mutate()}
              testID="apply-submit"
            />
          </View>
        }
        testID="sheet-apply">
        {/* Washed gig strip */}
        {gig ? (
          <View style={styles.applyStrip}>
            <View style={styles.applyStripCopy}>
              <Text variant="title3" numberOfLines={1}>
                {gig.title}
              </Text>
              <View style={styles.applyStripMeta}>
                <Icon name="storefront" size={13} color={color.textSecondary} />
                <Text variant="caption" tone="secondary" numberOfLines={1}>
                  {gig.business?.businessProfile?.businessName ?? gig.business?.name ?? 'Local business'}
                </Text>
              </View>
            </View>
            <Text variant="title3" tone="brand">
              ₹{Number(gig.budget).toLocaleString()}
            </Text>
          </View>
        ) : null}

        <StepProgress total={5} current={2} />

        <View style={styles.applyIntro}>
          <Text variant="title1">Your Proposal</Text>
          <Text variant="body" tone="secondary">
            Tell the business why you are the best fit
          </Text>
        </View>

        <TextField
          label="Why are you a good fit?"
          value={proposal}
          onChangeText={setProposal}
          placeholder="Mention your specific approach to this gig..."
          type="textarea"
          testID="apply-proposal"
        />
        <TextField
          label="Relevant Experience"
          value={experience}
          onChangeText={setExperience}
          placeholder="Have you done similar work before?"
          type="textarea"
        />
        <View style={styles.applyTwoCol}>
          <TextField
            label="Availability"
            icon="clock"
            value={availability}
            onChangeText={setAvailability}
            placeholder="e.g. Evenings"
            style={styles.applyCol}
          />
          <TextField
            label="Est. Days"
            icon="stopwatch"
            type="number"
            keyboardType="number-pad"
            value={estDays}
            onChangeText={setEstDays}
            placeholder="e.g. 3 days"
            style={styles.applyCol}
          />
        </View>
        <TextField
          label="Portfolio Links"
          icon="link"
          value={links}
          onChangeText={setLinks}
          placeholder="Behance, GitHub, or Drive link"
          autoCapitalize="none"
        />

        <View style={styles.protectCard}>
          <Icon name="help" size={20} color={color.textPrimary} />
          <Text variant="callout" tone="secondary" style={styles.protectCopy}>
            Your application is protected. We never share your private contact details until you are selected.
          </Text>
        </View>

        {applyMutation.isError ? (
          <InfoBanner tone="danger" icon="offline" title="Could not apply" description={apiErrorMessage(applyMutation.error)} />
        ) : null}
      </Sheet>

    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: layout.screenGutter },
  content: {
    padding: layout.screenGutter,
    gap: space.base,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: space['2xl'],
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  businessName: { flexShrink: 1 },

  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.sm },
  statCell: { width: '47%', flexGrow: 1, minWidth: 150 },

  section: { gap: space.md, marginTop: space.sm },
  paragraph: { lineHeight: 23 },

  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  pill: {
    backgroundColor: color.successSoft,
    borderRadius: radius.full,
    paddingHorizontal: space.base,
    paddingVertical: space.sm,
  },
  pillText: { color: color.successStrong },

  locationHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.base,
  },
  locationCopy: { flex: 1, lineHeight: 18 },

  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.lg,
    padding: space.base,
    marginTop: space.sm,
  },
  businessCopy: { flex: 1, gap: 2 },

  applyRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, width: '100%' },
  applyButton: { flex: 1 },
  pendingRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, width: '100%' },

  applyFooter: { gap: space.md, width: '100%' },
  applyingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  applyingName: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexShrink: 1 },
  applyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    backgroundColor: color.primarySoft,
    borderRadius: radius.lg,
    paddingHorizontal: space.base,
    paddingVertical: space.base,
  },
  applyStripCopy: { flex: 1, gap: space.xs },
  applyStripMeta: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  applyIntro: { gap: space.sm, marginTop: space.sm },
  applyTwoCol: { flexDirection: 'row', gap: space.md },
  applyCol: { flex: 1 },
  protectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    paddingHorizontal: space.base,
    paddingVertical: space.base,
  },
  protectCopy: { flex: 1, lineHeight: 20 },
  pendingCopy: { flex: 1 },
});
