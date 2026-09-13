import { useMutation } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, colors, Field } from '@/components/legacy-ui';
import { apiErrorMessage } from '@/config/api';
import { createReport } from '@/lib/trust-api';
import { useAuth } from '@/providers/auth-provider';

/** Simple report form, reachable from gig detail screens. Admin triage is Phase 6. */
export default function ReportScreen() {
  const { gigId } = useLocalSearchParams<{ gigId: string }>();
  const { token } = useAuth();
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);
  const submit = useMutation({
    mutationFn: () => createReport(token!, { gigId, reason: reason.trim() }),
    onSuccess: () => setDone(true),
    onError: (e) => Alert.alert('Could not submit report', apiErrorMessage(e)),
  });

  if (done) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.content}>
          <Text style={s.heading}>Report received</Text>
          <Text style={s.copy}>Thanks for flagging this. Our team will review your report and take action if needed.</Text>
          <Button title="Back to gig" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <Pressable onPress={() => router.back()}><Text style={s.back}>‹ Back</Text></Pressable>
        <Text style={s.heading}>Report this gig</Text>
        <Text style={s.copy}>Tell us what's wrong — spam, fraud, inappropriate content, or anything else that concerns you.</Text>
        <Field label="Reason" value={reason} onChangeText={setReason} multiline placeholder="Describe the issue…" />
        <Button title={submit.isPending ? 'Submitting…' : 'Submit report'} disabled={!reason.trim() || submit.isPending} onPress={() => submit.mutate()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.pale },
  content: { padding: 20, gap: 14 },
  back: { color: colors.blue, fontWeight: '700' },
  heading: { color: colors.navy, fontSize: 28, fontWeight: '800' },
  copy: { color: colors.muted, lineHeight: 21 },
});
