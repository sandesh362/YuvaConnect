/**
 * Deliverable Submission ("Submit Work") — wireframe 18/37.
 *
 * Route: /submit/[gigId] (new, additive). Spec: docs/wireframes/18-deliverable-submission.md
 *
 * Data honesty:
 *  - Submission is FULLY REAL: submitGig({ fileUrl, note }) creates a Deliverable row and
 *    moves the gig to SUBMITTED. "Upload Media" → expo-image-picker → POST /api/upload;
 *    "Add Link" → the URL goes into the same real fileUrl field.
 *  - "Submission History / N Versions" = the REAL Deliverable rows, numbered by submission
 *    order; the washed-red feedback cards are the REAL RevisionRequest rows, attached to
 *    the version they followed by timestamp.
 *  - The amber/red status swatches are DERIVED (attached revision → red; latest version
 *    while SUBMITTED → amber; latest while APPROVED/PAID/CLOSED → green) — the API stores
 *    no per-version status column.
 *  - The "Deliverables Checklist" of REQUIRED tasks still has no backend column: it shows
 *    your real submitted items as checked rows and says so when empty (screen-17 pattern).
 */
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import {
  Button,
  ChecklistItem,
  Divider,
  ErrorState,
  Icon,
  InfoBanner,
  LoadingSkeleton,
  PrimaryButton,
  Screen,
  ScreenHeader,
  Text,
  TextField,
} from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { getGig, submitGig } from '@/lib/gig-api';
import { uploadImage } from '@/lib/profile-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { Deliverable } from '@/types/api';

const APPROVED_STATES = ['APPROVED', 'PAID', 'CLOSED'];

function versionStamp(iso: string) {
  return new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function SubmitWorkScreen() {
  const { gigId } = useLocalSearchParams<{ gigId: string }>();
  const { token } = useAuth();
  const client = useQueryClient();

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [linkMode, setLinkMode] = useState(false);
  const [linkDraft, setLinkDraft] = useState('');
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);

  const gigQuery = useQuery({ queryKey: ['gig', gigId], queryFn: () => getGig(token!, gigId!), enabled: !!token && !!gigId });
  const gig = gigQuery.data;

  const submitMutation = useMutation({
    mutationFn: () => submitGig(token!, gigId!, { fileUrl: fileUrl ?? '', note: note.trim() }),
    onSuccess: () => {
      setFileUrl(null);
      setFileName(null);
      setNote('');
      setLinkMode(false);
      setLinkDraft('');
      client.invalidateQueries({ queryKey: ['gig', gigId] });
      client.invalidateQueries({ queryKey: ['my-gigs'] });
    },
  });

  const pickMedia = async () => {
    if (!token) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as never, quality: 0.9 });
    if (result.canceled) return;
    setUploading(true);
    try {
      const asset = result.assets[0];
      setFileUrl(await uploadImage(token, asset as ImagePicker.ImagePickerAsset));
      setFileName(asset.fileName ?? 'uploaded-media.jpg');
      setLinkMode(false);
    } finally {
      setUploading(false);
    }
  };

  /** Versions newest-first; each carries the revision feedback that followed it. */
  const versions = useMemo(() => {
    const deliverables: Deliverable[] = [...(gig?.deliverables ?? [])].sort((a, b) =>
      b.submittedAt.localeCompare(a.submittedAt),
    );
    const revisions = [...(gig?.revisionRequests ?? [])].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt));
    return deliverables.map((deliverable, index) => {
      const newer = index > 0 ? deliverables[index - 1].submittedAt : null;
      const revision =
        revisions.find((item) => item.requestedAt >= deliverable.submittedAt && (!newer || item.requestedAt < newer)) ?? null;
      return { deliverable, revision, number: deliverables.length - index };
    });
  }, [gig]);

  const canSubmit = !!gig && ['IN_PROGRESS', 'REVISION_REQUESTED'].includes(gig.status);

  const swatchFor = (index: number, hasRevision: boolean) => {
    if (hasRevision) return color.danger;
    if (index === 0 && gig) {
      if (gig.status === 'SUBMITTED') return color.warningStrong;
      if (APPROVED_STATES.includes(gig.status)) return color.success;
    }
    return color.borderStrong;
  };

  return (
    <Screen testID="screen-submit">
      <ScreenHeader title="Submit Work" subtitle={gig?.title ?? '…'} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {gigQuery.isLoading ? (
          <LoadingSkeleton count={3} variant="card" />
        ) : gigQuery.isError || !gig ? (
          <ErrorState title="Could not load this gig" description={apiErrorMessage(gigQuery.error)} retryLabel="Retry" onRetry={() => gigQuery.refetch()} />
        ) : (
          <>
            {/* --- Checklist: real submitted items (required-task column doesn't exist) --- */}
            <View style={styles.card}>
              <Text variant="title3">Deliverables Checklist</Text>
              {versions.length ? (
                versions.map(({ deliverable, number }) => (
                  <ChecklistItem key={deliverable.id} label={`Version ${number}.0 — ${deliverable.note || 'submitted'}`} checked />
                ))
              ) : (
                <View style={styles.flagRow}>
                  <Icon name="info" size={18} color={color.textSecondary} />
                  <Text variant="callout" tone="secondary" style={styles.flagCopy}>
                    Required-task checklists have no backend column yet — completed rows appear here as you submit real versions. Flagged, not faked.
                  </Text>
                </View>
              )}
            </View>

            {/* --- Upload tiles --- */}
            <Text variant="title2">Upload Files</Text>
            <View style={styles.tileRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Upload media"
                onPress={pickMedia}
                style={({ pressed }) => [styles.tile, styles.tileMedia, pressed && styles.pressed]}>
                <Icon name="cloudUpload" size={26} color={color.primary} />
                <Text variant="calloutStrong" style={styles.tileMediaLabel}>
                  {uploading ? 'Uploading…' : 'Upload Media'}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add link"
                onPress={() => setLinkMode((value) => !value)}
                style={({ pressed }) => [styles.tile, styles.tileLink, pressed && styles.pressed]}>
                <Icon name="link" size={26} color={color.successStrong} />
                <Text variant="calloutStrong" style={styles.tileLinkLabel}>
                  Add Link
                </Text>
              </Pressable>
            </View>

            {linkMode ? (
              <View style={styles.linkRow}>
                <TextField
                  label="Deliverable link"
                  icon="link"
                  value={linkDraft}
                  onChangeText={setLinkDraft}
                  placeholder="https://drive.google.com/..."
                  autoCapitalize="none"
                  keyboardType="url"
                  style={styles.linkField}
                />
                <Button
                  label="Use link"
                  variant="secondary"
                  fullWidth={false}
                  disabled={!/^https?:\/\/.+/i.test(linkDraft.trim())}
                  onPress={() => {
                    setFileUrl(linkDraft.trim());
                    setFileName(linkDraft.trim());
                    setLinkMode(false);
                  }}
                />
              </View>
            ) : null}

            {fileUrl ? (
              <View style={styles.pickedRow}>
                <Icon name="document" size={16} color={color.textSecondary} />
                <Text variant="caption" tone="secondary" numberOfLines={1} style={styles.pickedName}>
                  {fileName ?? fileUrl}
                </Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Remove file" onPress={() => { setFileUrl(null); setFileName(null); }}>
                  <Icon name="close" size={16} color={color.textSecondary} />
                </Pressable>
              </View>
            ) : null}

            <TextField
              label="Message to Business"
              value={note}
              onChangeText={setNote}
              placeholder="Explain what you've completed in this version..."
              type="textarea"
              testID="submit-note"
            />

            {submitMutation.isError ? (
              <InfoBanner tone="danger" icon="offline" title="Could not submit" description={apiErrorMessage(submitMutation.error)} />
            ) : null}

            <PrimaryButton
              label={submitMutation.isPending ? 'Submitting…' : 'Submit for Review'}
              icon="send"
              size="lg"
              disabled={!canSubmit || !fileUrl || !note.trim()}
              onPress={() => submitMutation.mutate()}
              testID="submit-send"
            />
            {!canSubmit ? (
              <Text variant="caption" tone="tertiary" style={styles.hint}>
                Submissions open while work is in progress or after a revision request.
              </Text>
            ) : null}

            <Divider />

            {/* --- Submission history: real Deliverable + RevisionRequest rows --- */}
            <View style={styles.historyHead}>
              <Text variant="title2">Submission History</Text>
              <Text variant="captionStrong" tone="secondary">
                {versions.length} Version{versions.length === 1 ? '' : 's'}
              </Text>
            </View>

            {versions.length === 0 ? (
              <Text variant="callout" tone="tertiary">
                No versions submitted yet — your first submission appears here.
              </Text>
            ) : (
              versions.map(({ deliverable, revision, number }, index) => (
                <View key={deliverable.id} style={styles.versionCard}>
                  <View style={styles.versionHead}>
                    <View style={styles.versionCopy}>
                      <Text variant="title3">Version {number}.0</Text>
                      <Text variant="caption" tone="secondary">
                        {versionStamp(deliverable.submittedAt)}
                      </Text>
                    </View>
                    <View style={[styles.swatch, { backgroundColor: swatchFor(index, !!revision) }]} />
                  </View>
                  {deliverable.note ? (
                    <Text variant="callout" tone="secondary" style={styles.versionNote}>
                      “{deliverable.note}”
                    </Text>
                  ) : null}
                  {deliverable.fileUrl ? (
                    <Text variant="caption" tone="tertiary" numberOfLines={1}>
                      {deliverable.fileUrl}
                    </Text>
                  ) : null}
                  {revision ? (
                    <View style={styles.feedbackCard}>
                      <Icon name="chat" size={16} color={color.danger} />
                      <View style={styles.feedbackCopy}>
                        <Text variant="calloutStrong" tone="danger">
                          Feedback from Business
                        </Text>
                        <Text variant="callout" tone="secondary" style={styles.feedbackText}>
                          {revision.feedback}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* --- Protection strip --- */}
      <View style={styles.protectBar}>
        <Icon name="shieldCheckFilled" size={18} color={color.textPrimary} />
        <Text variant="captionStrong" style={styles.protectCopy}>
          Your work is protected. Payments are released upon approval.
        </Text>
      </View>
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

  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.base,
    gap: space.sm,
  },
  flagRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flagCopy: { flex: 1, lineHeight: 20 },

  tileRow: { flexDirection: 'row', gap: space.md },
  tile: {
    flex: 1,
    height: 110,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  tileMedia: { backgroundColor: color.primarySoft, borderWidth: 1.5, borderColor: color.primary },
  tileMediaLabel: { color: color.primaryText },
  tileLink: { backgroundColor: color.successSoft, borderWidth: 1.5, borderColor: color.success },
  tileLinkLabel: { color: color.successStrong },
  pressed: { opacity: 0.85 },

  linkRow: { flexDirection: 'row', alignItems: 'flex-end', gap: space.md },
  linkField: { flex: 1 },

  pickedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
  },
  pickedName: { flex: 1 },

  hint: { textAlign: 'center' },
  historyHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  versionCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
    padding: space.base,
    gap: space.sm,
  },
  versionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  versionCopy: { flex: 1, gap: 2 },
  swatch: { width: 56, height: 10, borderRadius: 2 },
  versionNote: { lineHeight: 20 },

  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    backgroundColor: color.dangerSoft,
    borderRadius: radius.md,
    padding: space.base,
  },
  feedbackCopy: { flex: 1, gap: space.xs },
  feedbackText: { lineHeight: 20 },

  protectBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    backgroundColor: color.surfaceMuted,
    paddingVertical: space.base,
    paddingHorizontal: layout.screenGutter,
  },
  protectCopy: { color: color.textPrimary },
});
