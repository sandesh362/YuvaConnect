/**
 * Report & Support — wireframe 4/37.
 *
 * Route: /support (new, additive). Spec: docs/wireframes/04-report-support.md
 *
 * Data honesty: the live Report model is { gigId, reason, status } only. The
 * wireframe's category, description and attachments therefore travel INSIDE
 * the reason text as labelled lines — real data, honestly composed — and the
 * missing structured columns are flagged in the spec, not faked. Attachments
 * are genuine: expo-image-picker → POST /api/upload (5MB server limit, which
 * is exactly the "Max 5MB" the wireframe prints).
 */
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import {
  Accordion,
  Banner,
  BottomActionBar,
  Icon,
  IconButton,
  PrimaryButton,
  Screen,
  ScreenHeader,
  SectionHeader,
  SelectTile,
  SuccessState,
  Text,
  TextField,
} from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { uploadImage } from '@/lib/profile-api';
import { createReport } from '@/lib/trust-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import { useLayoutMetrics } from '@/hooks/use-layout-metrics';

type CategoryKey = 'user' | 'payment' | 'verification' | 'other';

const CATEGORIES: { key: CategoryKey; label: string; icon: 'personRemove' | 'walletFilled' | 'shieldCheckFilled' | 'help'; iconColor: string }[] = [
  { key: 'user', label: 'Report User', icon: 'personRemove', iconColor: color.danger },
  { key: 'payment', label: 'Payment Issue', icon: 'walletFilled', iconColor: color.primary },
  { key: 'verification', label: 'Verification', icon: 'shieldCheckFilled', iconColor: color.success },
  { key: 'other', label: 'Other', icon: 'help', iconColor: color.textSecondary },
];

const CATEGORY_LABEL: Record<CategoryKey, string> = {
  user: 'Report User',
  payment: 'Payment Issue',
  verification: 'Verification',
  other: 'Other',
};

/** FAQ bodies for the two collapsed rows are authored copy — the wireframe
 *  shows only their titles. Flagged in the spec. */
const FAQ = [
  {
    question: 'How do I release a payment?',
    answer:
      "Once the student submits the final deliverables and you approve them, the 'Pay' button will become active in your Work Tracker.",
  },
  {
    question: 'What if the work is not satisfactory?',
    answer:
      'Request a revision from the Work Tracker. The student receives your feedback with a revised deadline, and funds stay held by YuvaConnect until you approve the new submission.',
  },
  {
    question: 'Verification taking too long?',
    answer:
      'Verification usually completes within 24 hours. If it has been longer, submit a ticket under the Verification category and our team will prioritise it.',
  },
];

export default function SupportScreen() {
  const { contentBottom } = useLayoutMetrics('actionbar');

  const { token } = useAuth();
  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const pickAttachments = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'documents'] as never,
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (result.canceled || !token) return;
      setUploading(true);
      setUploadError(null);
      const urls: string[] = [];
      for (const asset of result.assets) {
        const url = await uploadImage(token, asset as ImagePicker.ImagePickerAsset);
        urls.push(url);
      }
      setAttachments((current) => [...current, ...urls]);
    } catch (err) {
      setUploadError(apiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!token || !category) return;
    setSubmitting(true);
    setError(null);
    const lines = [
      `[${CATEGORY_LABEL[category]}] ${reason.trim()}`,
      description.trim() ? `\nDetails: ${description.trim()}` : '',
      ...attachments.map((url) => `\nAttachment: ${url}`),
    ];
    try {
      await createReport(token, { reason: lines.join('') });
      setDone(true);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !!category && reason.trim().length > 0;

  return (
    <Screen testID="screen-support">
      <ScreenHeader
        title="Support & Help"
        subtitle="We're here to help you"
        onBack={() => router.back()}
        trailing={<Icon name="info" size={22} color={color.textPrimary} />}
      />

      <ScrollView style={{flex:1}} contentContainerStyle={[styles.content, { flexGrow: 1, paddingBottom: contentBottom }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {done ? (
          <SuccessState
            fill={false}
            title="Ticket Submitted!"
            description="Our trust & safety team has your ticket and will respond within 24 hours."
            primaryLabel="Back to Home"
            onPrimary={() => router.replace('/home' as never)}
            secondaryLabel="Submit another ticket"
            onSecondary={() => {
              setDone(false);
              setCategory(null);
              setReason('');
              setDescription('');
              setAttachments([]);
            }}
            secondaryAsLink
          />
        ) : (
          <>
            <Banner
              tone="brand"
              icon="shieldCheckFilled"
              title="Your safety is our priority"
              description="Most issues are resolved within 24 hours."
            />

            <View style={styles.section}>
              <SectionHeader title="Select Category" />
              <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Support category">
                {CATEGORIES.map((item) => (
                  <SelectTile
                    key={item.key}
                    label={item.label}
                    icon={item.icon}
                    iconColor={item.iconColor}
                    selected={category === item.key}
                    onPress={() => setCategory(item.key)}
                    height={150}
                    style={styles.tile}
                    testID={`category-${item.key}`}
                  />
                ))}
              </View>
            </View>

            <TextField
              label="Reason"
              value={reason}
              onChangeText={setReason}
              placeholder="e.g. Payment not received for Gig #421"
              testID="support-reason"
            />
            <TextField
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Please provide as much detail as possible..."
              type="textarea"
              testID="support-description"
            />

            <View style={styles.section}>
              <SectionHeader title="Attachments (Optional)" />
              <View style={styles.uploadRow}>
                <IconButton
                  name="cloudUpload"
                  size={26}
                  color={color.primary}
                  accessibilityLabel="Upload screenshots or documents"
                  onPress={pickAttachments}
                  disabled={uploading || !token}
                />
                <View style={styles.uploadCopy}>
                  <Text variant="callout" tone="secondary">
                    {uploading ? 'Uploading…' : 'Upload Screenshots or Documents'}
                  </Text>
                  <Text variant="overline" tone="tertiary" uppercase>
                    Max 5MB • JPG, PNG, PDF
                  </Text>
                </View>
              </View>
              {uploadError ? (
                <Text variant="caption" tone="danger">
                  {uploadError}
                </Text>
              ) : null}
              {attachments.length ? (
                <View style={styles.attachmentList}>
                  {attachments.map((url, index) => (
                    <View key={url} style={styles.attachmentRow}>
                      <Icon name="link" size={14} color={color.textSecondary} />
                      <Text variant="caption" tone="secondary" numberOfLines={1} style={styles.attachmentUrl}>
                        {url}
                      </Text>
                      <IconButton
                        name="close"
                        size={14}
                        accessibilityLabel={`Remove attachment ${index + 1}`}
                        onPress={() => setAttachments((current) => current.filter((item) => item !== url))}
                      />
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.section}>
              <SectionHeader title="Frequently Asked Questions" />
              <Accordion items={FAQ} defaultOpen={0} />
            </View>

            {error ? (
              <Text variant="callout" tone="danger" style={styles.error}>
                {error}
              </Text>
            ) : null}
          </>
        )}
      </ScrollView>

      {!done ? (
        <BottomActionBar>
          <View style={styles.bar}>
            <Text variant="caption" tone="tertiary" style={styles.barHint}>
              {category
                ? `Reporting under “${CATEGORY_LABEL[category]}” · a reason is required`
                : 'Choose a category and add a reason to submit'}
            </Text>
            <PrimaryButton
              label={submitting ? 'Submitting…' : 'Submit Ticket'}
              icon="send"
              disabled={!canSubmit || submitting}
              onPress={submit}
              testID="support-submit"
            />
          </View>
        </BottomActionBar>
      ) : null}
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
  },
  section: { gap: space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  tile: { width: '48%', flexGrow: 1, minWidth: 150 },

  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    // Full width: sizing this row to its content let a long label push the card
    // past the screen edge on a 320pt phone.
    alignSelf: 'stretch',
    padding: space.base,
  },
  uploadCopy: { flex: 1, minWidth: 0, gap: 2 },
  attachmentList: { gap: space.xs },
  attachmentRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  attachmentUrl: { flex: 1 },

  error: { marginTop: space.sm },
  bar: { gap: space.sm, width: '100%' },
  barHint: { textAlign: 'center' },
});
