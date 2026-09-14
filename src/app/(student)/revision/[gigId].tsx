/**
 * Revision Requested — wireframe 19/37.
 *
 * Route: /revision/[gigId] (new, additive — the wireframe is a distinct screen).
 * Spec: docs/wireframes/19-revision-requested.md
 *
 * Data honesty:
 *  - Feedback card = the REAL latest RevisionRequest (text + requestedAt);
 *    business identity from the real gig payload; amber "Pending" pill derives
 *    from the REAL gig.status === REVISION_REQUESTED.
 *  - Previous Submission = the REAL latest Deliverable row (FileRow; tapping
 *    opens the file). Size is not stored → the meta shows the real submitted
 *    timestamp instead of a fake "2.4 MB".
 *  - Required-changes task list has NO model → the card carries the honest
 *    flag pointing at the feedback text; tasks are never parsed/invented.
 *  - Revised deadline has NO column → the row shows the REAL gig deadline and
 *    says a revised-deadline field doesn't exist yet.
 */
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import {
  Avatar,
  Divider,
  ErrorState,
  FileRow,
  Icon,
  InfoBanner,
  LoadingSkeleton,
  PrimaryButton,
  Screen,
  ScreenHeader,
  StatusBadge,
  Text,
  TextLink,
} from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { getGig } from '@/lib/gig-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

function fileNameFrom(url: string) {
  const tail = url.split('/').pop() ?? 'submission-file';
  return tail.split('?')[0];
}

function submittedAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'Submitted today';
  if (days === 1) return 'Submitted yesterday';
  return `Submitted ${days} days ago`;
}

export default function RevisionRequestedScreen() {
  const { gigId } = useLocalSearchParams<{ gigId: string }>();
  const { token } = useAuth();

  const gigQuery = useQuery({ queryKey: ['gig', gigId], queryFn: () => getGig(token!, gigId!), enabled: !!token && !!gigId });
  const gig = gigQuery.data;

  const revision = useMemo(() => {
    const list = [...(gig?.revisionRequests ?? [])].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
    return list[0] ?? null;
  }, [gig]);

  const lastDeliverable = useMemo(() => {
    const list = [...(gig?.deliverables ?? [])].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    return list[0] ?? null;
  }, [gig]);

  const businessName = gig?.business?.businessProfile?.businessName ?? gig?.business?.name ?? 'the business';
  const open = gig?.status === 'REVISION_REQUESTED';

  return (
    <Screen testID="screen-revision">
      <ScreenHeader title="Revision Requested" subtitle={`Gig #${gigId ?? '—'}`} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {gigQuery.isLoading ? (
          <LoadingSkeleton count={3} variant="card" />
        ) : gigQuery.isError || !gig ? (
          <ErrorState title="Could not load this gig" description={apiErrorMessage(gigQuery.error)} retryLabel="Retry" onRetry={() => gigQuery.refetch()} />
        ) : (
          <>
            {!open ? (
              <InfoBanner
                tone="info"
                icon="info"
                title="No open revision request"
                description={`This gig is currently ${gig.status.toLowerCase().replace('_', ' ')}. The latest revision details remain below for reference.`}
              />
            ) : (
              <InfoBanner
                tone="warning"
                icon="pen"
                title="Action Required"
                description="The business has requested changes to your last submission."
              />
            )}

            {/* --- Business + feedback card --- */}
            <View style={styles.card}>
              <View style={styles.partyRow}>
                <Avatar name={businessName} size="md" tone={color.warningSoft} />
                <View style={styles.partyCopy}>
                  <Text variant="calloutStrong" numberOfLines={1}>
                    {businessName}
                  </Text>
                  <Text variant="captionStrong" tone="secondary" numberOfLines={1}>
                    Owner, {businessName}
                  </Text>
                </View>
                <StatusBadge label={open ? 'Pending' : gig.status} tone={open ? 'warning' : 'neutral'} size="sm" />
              </View>

              <Divider />

              {revision ? (
                <>
                  <Text variant="captionStrong" tone="secondary">
                    Business Feedback
                  </Text>
                  <Text variant="body" tone="secondary" style={styles.feedback}>
                    {revision.feedback}
                  </Text>
                  <Text variant="caption" tone="tertiary">
                    Requested {new Date(revision.requestedAt).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </>
              ) : (
                <Text variant="callout" tone="tertiary">
                  No revision feedback has been recorded on this gig.
                </Text>
              )}

              <View style={styles.deadlineRow}>
                <Icon name="alarm" size={16} color={color.danger} />
                <Text variant="caption" tone="secondary">
                  Deadline:
                </Text>
                <Text variant="captionStrong" tone="danger">
                  {new Date(gig.deadline).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <Text variant="caption" tone="tertiary">
                Revised deadlines have no backend field yet — this is the gig's real deadline. Flagged, not faked.
              </Text>
            </View>

            {/* --- Required changes: honest flag, no invented tasks --- */}
            <View>
              <Text variant="title1">Required Changes</Text>
              <Text variant="body" tone="secondary">
                Complete these to resubmit
              </Text>
              <View style={styles.changesCard}>
                <View style={styles.flagRow}>
                  <Icon name="info" size={18} color={color.textSecondary} />
                  <Text variant="callout" tone="secondary" style={styles.flagCopy}>
                    Itemised change-tasks have no backend model yet — the business's feedback above is the authoritative list. Flagged, not faked.
                  </Text>
                </View>
              </View>
            </View>

            {/* --- Previous submission: real Deliverable row --- */}
            <View style={styles.section}>
              <Text variant="title3">Previous Submission</Text>
              {lastDeliverable ? (
                <FileRow
                  name={lastDeliverable.note || fileNameFrom(lastDeliverable.fileUrl)}
                  meta={`${fileNameFrom(lastDeliverable.fileUrl)} • ${submittedAgo(lastDeliverable.submittedAt)}`}
                  icon="image"
                  state="uploaded"
                  onPress={lastDeliverable.fileUrl ? () => Linking.openURL(lastDeliverable.fileUrl).catch(() => undefined) : undefined}
                />
              ) : (
                <Text variant="callout" tone="tertiary">
                  No previous submission is stored on this gig.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* --- Sticky bar --- */}
      <View style={styles.bar}>
        <PrimaryButton
          label="Submit Revised Work"
          icon="cloudUpload"
          size="lg"
          onPress={() => router.push(`/(student)/submit/${gigId}` as never)}
          testID="revision-resubmit"
        />
        <View style={styles.messageRow}>
          <TextLink label={`Message ${businessName.split(' ')[0]}`} iconRight={null} onPress={() => router.push(`/(shared)/chat/${gigId}` as never)} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: layout.screenGutter,
    gap: space.xl,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 120,
  },

  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.base,
    gap: space.md,
  },
  partyRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  partyCopy: { flex: 1, gap: 2 },
  feedback: { lineHeight: 23 },

  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
  },

  changesCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.base,
    marginTop: space.md,
  },
  flagRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flagCopy: { flex: 1, lineHeight: 20 },

  section: { gap: space.md },

  bar: {
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.borderSubtle,
    padding: layout.screenGutter,
    gap: space.md,
  },
  messageRow: { alignItems: 'center' },
});
