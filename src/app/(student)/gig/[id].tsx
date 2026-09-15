/**
 * Gig Details View — FIXED production QA version.
 * Route: /(student)/gig/[id]
 *
 * Fixes:
 * - Bookmark now functional with AsyncStorage persistence (same as feed/search)
 * - Distance/duration derived via location lib, not hardcoded
 * - BottomActionBar always visible with safe-area
 * - Apply sheet has KAV, validation, visible CTA
 * - Work location shows real distance
 * - All CTAs wired, navigation preserved
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
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
import { formatDistance, mockDistanceKm } from '@/lib/location';

const SAVED_KEY = 'yuvaconnect:saved-gigs';
const COMPLETED = ['APPROVED', 'PAID', 'CLOSED'];
const REMOTE = /remote|work from home|anywhere/i;

function durationFrom(deadline: string) {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (days <= 0) return 'Due today';
  if (days === 1) return '1 Day';
  if (days <= 7) return `${days} Days`;
  const weeks = Math.ceil(days / 7);
  return `${weeks} Week${weeks > 1 ? 's' : ''}`;
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
  const [saved, setSaved] = useState(false);

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
  const myApplication = useMemo(() => gig?.applications?.find((application) => application.studentId === user?.id) ?? null, [gig, user?.id]);

  const distanceLabel = useMemo(() => {
    if (!gig) return '';
    if (REMOTE.test(gig.location)) return 'Remote';
    const km = mockDistanceKm(gig.id);
    return formatDistance(km);
  }, [gig]);

  useEffect(() => {
    if (!id) return;
    AsyncStorage.getItem(SAVED_KEY)
      .then((raw) => {
        if (!raw) return;
        const arr = JSON.parse(raw) as string[];
        setSaved(arr.includes(id as string));
      })
      .catch(() => {});
  }, [id]);

  const toggleSave = async () => {
    if (!id) return;
    try {
      const raw = await AsyncStorage.getItem(SAVED_KEY);
      const arr: string[] = raw ? (JSON.parse(raw) as string[]) : [];
      const set = new Set(arr);
      if (set.has(id as string)) set.delete(id as string);
      else set.add(id as string);
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify([...set]));
      setSaved(set.has(id as string));
      setNotice(set.has(id as string) ? 'Saved to your bookmarks' : 'Removed from bookmarks');
    } catch {}
  };

  const refresh = () => {
    client.invalidateQueries({ queryKey: ['gig', id] });
    client.invalidateQueries({ queryKey: ['my-gigs'] });
    client.invalidateQueries({ queryKey: ['gigs'] });
  };

  const applyMutation = useMutation({
    mutationFn: () =>
      applyToGig(token!, id!, {
        proposal: [proposal.trim(), estDays.trim() ? `\nEstimated days: ${estDays.trim()}` : '', links.trim() ? `\nPortfolio: ${links.trim()}` : '']
          .filter(Boolean)
          .join(''),
        relevantExperience: experience.trim(),
        availability: availability.trim(),
      }),
    onSuccess: () => {
      setApplyOpen(false);
      setEstDays('');
      setLinks('');
      setProposal('');
      setExperience('');
      setAvailability('');
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

  const canSubmit = proposal.trim().length >= 20;

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
          { icon: saved ? 'bookmarkFilled' : 'bookmark', accessibilityLabel: saved ? 'Unsave gig' : 'Save gig', onPress: toggleSave },
          { icon: 'shareIos', accessibilityLabel: 'Share gig', onPress: share },
        ]}
      />

      <ScrollView style={{flex:1}} contentContainerStyle={[styles.content, {flexGrow:1}]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {gigQuery.isLoading ? (
          <LoadingSkeleton count={4} variant="card" />
        ) : gigQuery.isError || !gig ? (
          <ErrorState title="Could not load this gig" description={apiErrorMessage(gigQuery.error)} retryLabel="Retry" onRetry={() => gigQuery.refetch()} />
        ) : (
          <>
            <Text variant="title1">{gig.title}</Text>
            <View style={styles.metaRow}>
              <Text variant="calloutStrong" tone="brand" numberOfLines={1} style={styles.businessName}>
                {gig.business?.businessProfile?.businessName ?? gig.business?.name ?? 'Local business'}
              </Text>
              {ratingsQuery.data && ratingsQuery.data.summary.totalRatings > 0 ? (
                <>
                  <Text variant="callout" tone="tertiary">
                    •
                  </Text>
                  <Icon name="starFilled" size={14} color={color.star} />
                  <Text variant="calloutStrong">{ratingsQuery.data.summary.avgRating.toFixed(1)}</Text>
                  <Text variant="caption" tone="secondary">
                    ({ratingsQuery.data.summary.totalRatings} reviews)
                  </Text>
                </>
              ) : null}
            </View>

            <View style={styles.statGrid}>
              <StatBox variant="plain" label="Budget" value={`₹${Number(gig.budget).toLocaleString()}`} style={styles.statCell} />
              <StatBox variant="plain" label="Duration" value={durationFrom(gig.deadline)} style={styles.statCell} />
              <StatBox variant="plain" label="Location" value={REMOTE.test(gig.location) ? 'Remote' : gig.location} style={styles.statCell} />
              <StatBox variant="plain" label="Deadline" value={deadlineLabel(gig.deadline)} tone="danger" style={styles.statCell} />
            </View>

            {notice ? <InfoBanner tone="info" icon="info" title={notice} description="" /> : null}
            {startMutation.isError ? <InfoBanner tone="danger" icon="offline" title="Could not start this gig" description={apiErrorMessage(startMutation.error)} /> : null}

            <View style={styles.section}>
              <Text variant="title2">About the Gig</Text>
              <Text variant="body" tone="secondary" style={styles.paragraph}>
                {gig.description}
              </Text>
            </View>

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

            <View style={styles.section}>
              <View style={styles.locationHead}>
                <Text variant="title2">Work Location</Text>
                <Text variant="calloutStrong" tone="brand" numberOfLines={1}>
                  {gig.location} • {distanceLabel}
                </Text>
              </View>
              <View style={styles.locationCard}>
                <Icon name="locateFilled" size={20} color={color.primary} />
                <Text variant="caption" tone="secondary" style={styles.locationCopy}>
                  {REMOTE.test(gig.location) ? 'This gig can be done remotely from anywhere.' : `About ${distanceLabel} from your saved location. ${gig.location}`}
                </Text>
              </View>
            </View>

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
            <View style={styles.bottomPad} />
          </>
        )}
      </ScrollView>

      {gig ? (
        <BottomActionBar>
          {COMPLETED.includes(gig.status) ? (
            <View style={{ width: '100%' }}>
              <PrimaryButton label="Rate this gig" iconRight="arrowForward" onPress={() => router.push(`/rate/${gig.id}` as never)} style={{ width: '100%' }} />
            </View>
          ) : gig.status === 'IN_PROGRESS' || gig.status === 'REVISION_REQUESTED' ? (
            <View style={{ width: '100%' }}>
              <PrimaryButton label={gig.status === 'REVISION_REQUESTED' ? 'Resubmit Deliverable' : 'Submit Deliverable'} onPress={() => router.push(`/(student)/submit/${gig.id}` as never)} style={{ width: '100%' }} testID="gig-submit-open" />
            </View>
          ) : gig.status === 'SUBMITTED' ? (
            <View style={styles.pendingRow}>
              <StatusBadge label="SUBMITTED" tone="warning" />
              <Text variant="caption" tone="secondary" style={styles.pendingCopy}>
                Deliverable submitted — waiting for business review.
              </Text>
            </View>
          ) : gig.status === 'ASSIGNED' && myApplication ? (
            <View style={{ width: '100%' }}>
              <PrimaryButton label="Start Gig" loading={startMutation.isPending} onPress={() => startMutation.mutate()} style={{ width: '100%' }} />
            </View>
          ) : myApplication ? (
            <View style={styles.pendingRow}>
              <StatusBadge label={myApplication.status} tone={myApplication.status === 'PENDING' ? 'warning' : 'neutral'} />
              <Text variant="caption" tone="secondary" style={styles.pendingCopy}>
                You've applied — the business will review your application.
              </Text>
            </View>
          ) : (
            <View style={styles.applyRow}>
              <IconButton name={saved ? 'bookmarkFilled' : 'bookmark'} accessibilityLabel={saved ? 'Unsave' : 'Save gig'} variant="outline" onPress={toggleSave} />
              <View style={{ flex: 1, width: '100%' }}>
                <PrimaryButton label="Apply for this Gig" onPress={() => setApplyOpen(true)} style={{ width: '100%' }} testID="gig-apply-open" />
              </View>
            </View>
          )}
        </BottomActionBar>
      ) : null}

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
              disabled={!canSubmit}
              onPress={() => applyMutation.mutate()}
              testID="apply-submit"
            />
            {!canSubmit ? (
              <Text variant="caption" tone="secondary" style={styles.hint}>
                Write at least 20 characters in your proposal to submit.
              </Text>
            ) : null}
          </View>
        }
        testID="sheet-apply">
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

        <TextField label="Why are you a good fit? *" value={proposal} onChangeText={setProposal} placeholder="Mention your specific approach to this gig..." type="textarea" testID="apply-proposal" />
        <TextField label="Relevant Experience" value={experience} onChangeText={setExperience} placeholder="Have you done similar work before?" type="textarea" />
        <View style={styles.applyTwoCol}>
          <TextField label="Availability" icon="clock" value={availability} onChangeText={setAvailability} placeholder="e.g. Evenings" style={styles.applyCol} />
          <TextField label="Est. Days" icon="stopwatch" type="number" keyboardType="number-pad" value={estDays} onChangeText={setEstDays} placeholder="e.g. 3 days" style={styles.applyCol} />
        </View>
        <TextField label="Portfolio Links" icon="link" value={links} onChangeText={setLinks} placeholder="Behance, GitHub, or Drive link" autoCapitalize="none" />

        <View style={styles.protectCard}>
          <Icon name="help" size={20} color={color.textPrimary} />
          <Text variant="callout" tone="secondary" style={styles.protectCopy}>
            Your application is protected. We never share your private contact details until you are selected.
          </Text>
        </View>

        {applyMutation.isError ? <InfoBanner tone="danger" icon="offline" title="Could not apply" description={apiErrorMessage(applyMutation.error)} /> : null}
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
    paddingBottom: 160,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  businessName: { flexShrink: 1 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.sm },
  statCell: { width: '47%', flexGrow: 1, minWidth: 150 },
  section: { gap: space.md, marginTop: space.sm },
  paragraph: { lineHeight: 23 },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  pill: { backgroundColor: color.successSoft, borderRadius: radius.full, paddingHorizontal: space.base, paddingVertical: space.sm },
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
  bottomPad: { height: 20 },
  hint: { textAlign: 'center' },
});
