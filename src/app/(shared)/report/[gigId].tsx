/**
 * Report Gig — FIXED production QA version.
 * Route: /(shared)/report/[gigId]
 *
 * Fixes:
 * - Uses new UI components, not legacy
 * - KAV, bottom padding 120, CTA always visible
 * - Validation, success state
 */
import { useMutation } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button, InfoBanner, PrimaryButton, Screen, ScreenHeader, SuccessState, Text, TextField } from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { createReport } from '@/lib/trust-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { layout, space } from '@/theme/spacing';

export default function ReportScreen() {
  const { gigId } = useLocalSearchParams<{ gigId: string }>();
  const { token } = useAuth();
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: () => createReport(token!, { gigId, reason: reason.trim() }),
    onSuccess: () => setDone(true),
    onError: (e) => setError(apiErrorMessage(e)),
  });

  if (done) {
    return (
      <Screen testID="screen-report-success">
        <SuccessState
          title="Report received"
          description="Thanks for flagging this. Our team will review your report and take action if needed."
          primaryLabel="Back to gig"
          onPrimary={() => router.back()}
          secondaryLabel="Go to Home"
          onSecondary={() => router.replace('/home' as never)}
        />
      </Screen>
    );
  }

  return (
    <Screen testID="screen-report">
      <ScreenHeader title="Report this gig" onBack={() => router.back()} subtitle={`Gig #${gigId ?? '—'}`} />

      <ScrollView style={{flex:1}} contentContainerStyle={[styles.content, {flexGrow:1}]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text variant="body" tone="secondary">
          Tell us what's wrong — spam, fraud, inappropriate content, or anything else that concerns you. Reports are reviewed by our trust & safety team.
        </Text>

        <TextField
          label="Reason *"
          value={reason}
          onChangeText={setReason}
          placeholder="Describe the issue…"
          type="textarea"
          testID="report-reason"
          helperText="Be specific — include what you saw and why it's concerning."
        />

        {error ? <InfoBanner tone="danger" icon="offline" title="Could not submit report" description={error} /> : null}

        <View style={styles.protect}>
          <Text variant="caption" tone="secondary" style={styles.protectText}>
            Your report is anonymous to the other party. We never share your identity when reviewing reports.
          </Text>
        </View>

        <PrimaryButton label={submit.isPending ? 'Submitting…' : 'Submit report'} disabled={!reason.trim() || submit.isPending} loading={submit.isPending} onPress={() => submit.mutate()} testID="report-submit" />

        <Button label="Cancel" variant="secondary" onPress={() => router.back()} />
        <View style={styles.bottomPad} />
      </ScrollView>
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
  protect: {
    backgroundColor: color.surfaceMuted,
    borderRadius: 12,
    padding: space.base,
  },
  protectText: { lineHeight: 18 },
  bottomPad: { height: 20 },
});
