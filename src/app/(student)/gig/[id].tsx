import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, colors, Field } from '@/components/legacy-ui';
import { NotificationBell } from '@/components/notification-bell';
import { RatingModal } from '@/components/rating-modal';
import { StatusTracker } from '@/components/status-tracker';
import { apiErrorMessage } from '@/config/api';
import { applyToGig, getGig, startGig, submitGig } from '@/lib/gig-api';
import { getMyRating, rateGig } from '@/lib/trust-api';
import { useAuth } from '@/providers/auth-provider';

const COMPLETED = ['APPROVED', 'PAID', 'CLOSED'];

export default function StudentGigScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token, user } = useAuth();
  const client = useQueryClient();
  const [proposal, setProposal] = useState('');
  const [experience, setExperience] = useState('');
  const [availability, setAvailability] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [note, setNote] = useState('');
  const query = useQuery({ queryKey: ['gig', id], queryFn: () => getGig(token!, id), enabled: !!token && !!id });
  const refresh = () => {
    client.invalidateQueries({ queryKey: ['gig', id] });
    client.invalidateQueries({ queryKey: ['my-gigs'] });
    client.invalidateQueries({ queryKey: ['gigs'] });
  };
  const apply = useMutation({ mutationFn: () => applyToGig(token!, id, { proposal, relevantExperience: experience, availability }), onSuccess: refresh, onError: (e) => Alert.alert('Could not apply', apiErrorMessage(e)) });
  const start = useMutation({ mutationFn: () => startGig(token!, id), onSuccess: refresh, onError: (e) => Alert.alert('Could not start', apiErrorMessage(e)) });
  const submit = useMutation({ mutationFn: () => submitGig(token!, id, { fileUrl, note }), onSuccess: refresh, onError: (e) => Alert.alert('Could not submit', apiErrorMessage(e)) });
  const gig = query.data;
  const application = gig?.applications?.find((item) => item.studentId === user?.id);
  const canMessage = application?.status === 'SELECTED';
  const canRate = application?.status === 'SELECTED' && !!gig && COMPLETED.includes(gig.status);
  const myRating = useQuery({ queryKey: ['my-rating', id], queryFn: () => getMyRating(token!, id), enabled: !!token && !!id && canRate });
  const [ratingOpen, setRatingOpen] = useState(false);
  // Prompt once the gig completes if the student hasn't rated the business yet.
  useEffect(() => {
    if (canRate && myRating.data === null) setRatingOpen(true);
  }, [canRate, myRating.data]);
  const rate = useMutation({
    mutationFn: (input: { score: number; comment: string }) => rateGig(token!, id, { score: input.score, comment: input.comment || undefined }),
    onSuccess: () => {
      setRatingOpen(false);
      client.invalidateQueries({ queryKey: ['my-rating', id] });
    },
    onError: (e) => Alert.alert('Could not submit rating', apiErrorMessage(e)),
  });
  if (!gig) return null;
  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.topRow}><Text style={s.heading}>{gig.title}</Text><NotificationBell /></View>
        <Text style={s.budget}>₹{Number(gig.budget).toLocaleString()}</Text>
        <StatusTracker status={gig.status} />
        <Text style={s.copy}>{gig.description}</Text>
        <Text style={s.meta}>Due {new Date(gig.deadline).toLocaleDateString()} · {gig.location}</Text>
        <View style={s.chips}>{gig.skillsRequired.map((item) => <Text style={s.chip} key={item}>{item}</Text>)}</View>
        {!application && gig.status === 'OPEN' && (
          <View style={s.card}>
            <Text style={s.section}>Apply for this gig</Text>
            <Field label="Proposal" value={proposal} onChangeText={setProposal} multiline />
            <Field label="Relevant experience" value={experience} onChangeText={setExperience} multiline />
            <Field label="Availability" value={availability} onChangeText={setAvailability} placeholder="e.g. Evenings this week" />
            <Button title={apply.isPending ? 'Applying…' : 'Apply'} disabled={apply.isPending} onPress={() => apply.mutate()} />
          </View>
        )}
        {application && (
          <View style={s.card}>
            <Text style={s.section}>Your application: {application.status}</Text>
            {gig.status === 'ASSIGNED' && <Button title="Start work" onPress={() => start.mutate()} disabled={start.isPending} />}
            {(gig.status === 'IN_PROGRESS' || gig.status === 'REVISION_REQUESTED') && (
              <>
                <Field label="Deliverable URL" value={fileUrl} onChangeText={setFileUrl} placeholder="Upload via /api/upload, then paste its URL" />
                <Field label="Submission note" value={note} onChangeText={setNote} multiline />
                <Button title={submit.isPending ? 'Submitting…' : 'Submit deliverable'} disabled={!fileUrl || submit.isPending} onPress={() => submit.mutate()} />
              </>
            )}
            {gig.revisionRequests?.[0] && <Text style={s.revision}>Latest feedback: {gig.revisionRequests[0].feedback}</Text>}
            {canMessage && <Button title="Message" variant="outline" onPress={() => router.push(`/chat/${id}` as never)} />}
            {canRate && myRating.data === null && <Button title="Rate this gig" onPress={() => setRatingOpen(true)} />}
          </View>
        )}
        <Pressable onPress={() => router.push(`/report/${id}` as never)}><Text style={s.report}>Report this gig</Text></Pressable>
      </ScrollView>
      <RatingModal visible={ratingOpen} gigTitle={gig.title} submitting={rate.isPending} onSubmit={(score, comment) => rate.mutate({ score, comment })} onClose={() => setRatingOpen(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.pale },
  content: { padding: 20, gap: 15 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontSize: 28, color: colors.navy, fontWeight: '800', flex: 1 },
  budget: { color: colors.blue, fontWeight: '800', fontSize: 20 },
  copy: { color: colors.text, lineHeight: 22 },
  meta: { color: colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { color: colors.blue, backgroundColor: colors.white, borderRadius: 8, padding: 7 },
  card: { backgroundColor: colors.white, padding: 16, borderRadius: 14, gap: 13 },
  section: { color: colors.navy, fontSize: 18, fontWeight: '800' },
  revision: { color: colors.danger },
  report: { color: colors.muted, textAlign: 'center', fontWeight: '700' },
});
