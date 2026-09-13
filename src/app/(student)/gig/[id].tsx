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
  StatusBadge,
  Text,
  TextField,
} from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { applyToGig, getGig, startGig, submitGig } from '@/lib/gig-api';
import { getUserRatings } from '@/lib/trust-api';
import { uploadImage } from '@/lib/profile-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import * as ImagePicker from 'expo-image-picker';

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
  const [submitOpen, setSubmitOpen] = useState(false);
  const [proposal, setProposal] = useState('');
  const [experience, setExperience] = useState('');
  const [availability, setAvailability] = useState('');
  const [deliverNote, setDeliverNote] = useState('');
  const [deliverFile, setDeliverFile] = useState<string | null>(null);

  const gigQuery = useQuery({ queryKey: ['gig', id], queryFn: () => getGig(token!, id!), enabled: !!token && !!id });
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
    mutationFn: () => applyToGig(token!, id!, { proposal: proposal.trim(), relevantExperience: experience.trim(), availability: availability.trim() }),
    onSuccess: () => {
      setApplyOpen(false);
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

  const pickDeliverable = async () => {
    if (!token) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as never, quality: 0.8 });
    if (result.canceled) return;
    const url = await uploadImage(token, result.assets[0] as ImagePicker.ImagePickerAsset);
    setDeliverFile(url);
  };

  const submitMutation = useMutation({
    mutationFn: () => submitGig(token!, id!, { fileUrl: deliverFile ?? '', note: deliverNote.trim() }),
    onSuccess: () => {
      setSubmitOpen(false);
      setNotice('Deliverable submitted for review.');
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
              onPress={() => setSubmitOpen(true)}
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

      {/* --- Apply sheet (real applyToGig contract) --- */}
      <Sheet visible={applyOpen} onClose={() => setApplyOpen(false)} title="Apply for this Gig" testID="sheet-apply">
        <TextField label="Proposal" value={proposal} onChangeText={setProposal} placeholder="Why are you a good fit?" type="textarea" />
        <TextField label="Relevant Experience" value={experience} onChangeText={setExperience} placeholder="Similar work you've done" type="textarea" />
        <TextField label="Availability" value={availability} onChangeText={setAvailability} placeholder="e.g. Evenings and weekends" />
        {applyMutation.isError ? <InfoBanner tone="danger" icon="offline" title="Could not apply" description={apiErrorMessage(applyMutation.error)} /> : null}
        <PrimaryButton
          label={applyMutation.isPending ? 'Submitting…' : 'Submit Application'}
          disabled={!proposal.trim()}
          onPress={() => applyMutation.mutate()}
        />
      </Sheet>

      {/* --- Submit deliverable sheet (functionality preserved until screen 18) --- */}
      <Sheet visible={submitOpen} onClose={() => setSubmitOpen(false)} title="Submit Deliverable" testID="sheet-submit">
        <TextField label="Note for the business" value={deliverNote} onChangeText={setDeliverNote} placeholder="What did you deliver?" type="textarea" />
        <Button label={deliverFile ? 'Replace file' : 'Attach file'} variant="secondary" icon="cloudUpload" onPress={pickDeliverable} />
        {deliverFile ? <Text variant="caption" tone="secondary" numberOfLines={1}>{deliverFile}</Text> : null}
        {submitMutation.isError ? <InfoBanner tone="danger" icon="offline" title="Could not submit" description={apiErrorMessage(submitMutation.error)} /> : null}
        <PrimaryButton
          label={submitMutation.isPending ? 'Submitting…' : 'Submit for review'}
          disabled={!deliverNote.trim()}
          onPress={() => submitMutation.mutate()}
        />
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
  pendingCopy: { flex: 1 },
});
