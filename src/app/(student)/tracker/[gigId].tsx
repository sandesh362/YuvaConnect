/**
 * Active Work Tracker (student) — wireframe 17/37.
 *
 * Route: /tracker/[gigId] (new, additive). Spec: docs/wireframes/17-active-work-tracker.md
 *
 * Data honesty:
 *  - Stepper position derives from the REAL GigStatus lifecycle.
 *  - Deliverables: there is NO required-tasks column, so the checklist lists the
 *    REAL submitted Deliverable rows (tap opens the file); when none exist the
 *    section shows the honest flag instead of an invented task list. The "N/3
 *    Done" counter becomes "N submitted" for the same reason.
 *  - Revision notice = the latest REAL RevisionRequest.feedback, with Chat
 *    deep-linking to the existing chat route.
 *  - Business verified tick omitted (field not in payload).
 *  - "Submit Final Work" opens the real submitGig sheet here (screen 18 will
 *    restyle this flow to its own wireframe); "Message Business" deep-links to
 *    the real chat.
 */
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';

import {
  Button,
  ChecklistItem,
  Divider,
  ErrorState,
  Icon,
  IconButton,
  InfoBanner,
  LoadingSkeleton,
  MilestoneStepper,
  PrimaryButton,
  Screen,
  ScreenHeader,
  SectionHeader,
  Sheet,
  Text,
  TextField,
  TextLink,
} from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { getGig, submitGig } from '@/lib/gig-api';
import { uploadImage } from '@/lib/profile-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

const STEPS = ['Assigned', 'Started', 'Submitted', 'Review', 'Paid'];
const STATUS_STEP: Record<string, number> = {
  ASSIGNED: 0,
  IN_PROGRESS: 1,
  SUBMITTED: 2,
  REVISION_REQUESTED: 2,
  APPROVED: 3,
  PAID: 4,
  CLOSED: 4,
};

function daysLeft(deadline: string) {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (days < 0) return 'overdue';
  if (days === 0) return 'due today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export default function WorkTrackerScreen() {
  const { gigId } = useLocalSearchParams<{ gigId: string }>();
  const { token } = useAuth();
  const client = useQueryClient();

  const [submitOpen, setSubmitOpen] = useState(false);
  const [note, setNote] = useState('');
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const gigQuery = useQuery({ queryKey: ['gig', gigId], queryFn: () => getGig(token!, gigId!), enabled: !!token && !!gigId });
  const gig = gigQuery.data;

  const submitMutation = useMutation({
    mutationFn: () => submitGig(token!, gigId!, { fileUrl: fileUrl ?? '', note: note.trim() }),
    onSuccess: () => {
      setSubmitOpen(false);
      client.invalidateQueries({ queryKey: ['gig', gigId] });
      client.invalidateQueries({ queryKey: ['my-gigs'] });
    },
  });

  const pickFile = async () => {
    if (!token) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as never, quality: 0.8 });
    if (result.canceled) return;
    setFileUrl(await uploadImage(token, result.assets[0] as ImagePicker.ImagePickerAsset));
  };

  const latestRevision = gig?.revisionRequests?.[0];
  const deliverables = gig?.deliverables ?? [];
  const canSubmit = !!gig && ['IN_PROGRESS', 'REVISION_REQUESTED'].includes(gig.status);

  return (
    <Screen testID="screen-tracker">
      <ScreenHeader
        title="Work Tracker"
        subtitle={`GIG-ID: #${gigId ?? '—'}`}
        onBack={() => router.back()}
        trailing={<IconButton name="help" accessibilityLabel="Support" onPress={() => router.push('/support' as never)} />}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {gigQuery.isLoading ? (
          <LoadingSkeleton count={3} variant="card" />
        ) : gigQuery.isError || !gig ? (
          <ErrorState title="Could not load this gig" description={apiErrorMessage(gigQuery.error)} retryLabel="Retry" onRetry={() => gigQuery.refetch()} />
        ) : (
          <>
            {/* --- Gig summary card --- */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHead}>
                <View style={styles.summaryTile}>
                  <Icon name="storefront" size={26} color={color.primary} />
                </View>
                <View style={styles.summaryCopy}>
                  <Text variant="title3" numberOfLines={2}>
                    {gig.title}
                  </Text>
                  <Text variant="caption" tone="secondary" numberOfLines={1}>
                    {gig.business?.businessProfile?.businessName ?? gig.business?.name ?? 'Local business'}
                  </Text>
                </View>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.summaryStats}>
                <View style={styles.statCol}>
                  <Text variant="overline" tone="tertiary" uppercase>
                    Budget
                  </Text>
                  <Text variant="title3">₹{Number(gig.budget).toLocaleString()}</Text>
                </View>
                <View style={styles.statCol}>
                  <Text variant="overline" tone="tertiary" uppercase>
                    Deadline
                  </Text>
                  <Text variant="calloutStrong" tone="danger">
                    {new Date(gig.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} ({daysLeft(gig.deadline)})
                  </Text>
                </View>
              </View>
            </View>

            {/* --- Milestone stepper --- */}
            <View style={styles.card}>
              <Text variant="title3">Milestone Progress</Text>
              <MilestoneStepper
                orientation="horizontal"
                connectors={false}
                milestones={STEPS.map((label, index) => {
                  const current = STATUS_STEP[gig.status] ?? 0;
                  return {
                    key: label,
                    label,
                    status: (index < current ? 'done' : index === current ? 'current' : 'pending') as 'done' | 'current' | 'pending',
                  };
                })}
              />
              {gig.status === 'OPEN' ? (
                <InfoBanner tone="info" icon="info" title="Work has not started yet" description="The tracker activates once the business assigns you and funds the escrow." />
              ) : null}
            </View>

            {/* --- Deliverables: real submitted rows, honest empty state --- */}
            <View>
              <SectionHeader title="Deliverables Checklist" actionLabel={deliverables.length ? `${deliverables.length} submitted` : undefined} />
              <View style={styles.card}>
                {deliverables.length ? (
                  deliverables.map((item) => (
                    <ChecklistItem
                      key={item.id}
                      label={item.note || 'Deliverable submitted'}
                      checked
                      onToggle={item.fileUrl ? () => Linking.openURL(item.fileUrl).catch(() => undefined) : undefined}
                    />
                  ))
                ) : (
                  <View style={styles.flagRow}>
                    <Icon name="info" size={18} color={color.textSecondary} />
                    <Text variant="callout" tone="secondary" style={styles.flagCopy}>
                      Required-task checklists have no backend column yet — this section lists your real submitted deliverables (none so far). Flagged, not faked.
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* --- Revision notice: latest real revision --- */}
            {latestRevision ? (
              <View style={styles.revisionRow}>
                <View style={styles.infoWell}>
                  <Icon name="info" size={16} color={color.textInverse} />
                </View>
                <Text variant="callout" style={styles.revisionCopy}>
                  {latestRevision.feedback}
                </Text>
                <TextLink label="Chat" iconRight={null} onPress={() => router.push(`/(shared)/chat/${gigId}` as never)} />
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      {gig ? (
        <View style={styles.bar}>
          <PrimaryButton
            label="Submit Final Work"
            icon="cloudUpload"
            size="lg"
            disabled={!canSubmit}
            onPress={() => setSubmitOpen(true)}
            testID="tracker-submit"
          />
          {!canSubmit ? (
            <Text variant="caption" tone="tertiary" style={styles.barHint}>
              Submissions open while work is in progress or after a revision request.
            </Text>
          ) : null}
          <Button
            label="Message Business"
            variant="secondary"
            size="lg"
            icon="chat"
            onPress={() => router.push(`/(shared)/chat/${gigId}` as never)}
          />
        </View>
      ) : null}

      {/* --- Real submitGig sheet; screen 18 restyles this flow --- */}
      <Sheet visible={submitOpen} onClose={() => setSubmitOpen(false)} title="Submit Deliverable" testID="sheet-tracker-submit">
        <TextField label="Note for the business" value={note} onChangeText={setNote} placeholder="What did you deliver?" type="textarea" />
        <Button label={fileUrl ? 'Replace file' : 'Attach file'} variant="secondary" icon="cloudUpload" onPress={pickFile} />
        {fileUrl ? (
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {fileUrl}
          </Text>
        ) : null}
        {submitMutation.isError ? (
          <InfoBanner tone="danger" icon="offline" title="Could not submit" description={apiErrorMessage(submitMutation.error)} />
        ) : null}
        <PrimaryButton
          label={submitMutation.isPending ? 'Submitting…' : 'Submit for review'}
          disabled={!note.trim()}
          onPress={() => submitMutation.mutate()}
        />
      </Sheet>
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
    paddingBottom: space['2xl'],
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
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  summaryTile: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: color.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCopy: { flex: 1, gap: space.xs },
  divider: { marginVertical: space.xs },
  summaryStats: { flexDirection: 'row', gap: space.xl },
  statCol: { gap: 2 },

  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.base,
    gap: space.base,
  },
  flagRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flagCopy: { flex: 1, lineHeight: 20 },

  revisionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.primarySoft,
    borderRadius: radius.md,
    paddingHorizontal: space.base,
    paddingVertical: space.base,
  },
  infoWell: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revisionCopy: { flex: 1, color: color.textPrimary, lineHeight: 20 },

  bar: {
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.borderSubtle,
    padding: layout.screenGutter,
    gap: space.md,
  },
  barHint: { textAlign: 'center' },
});
