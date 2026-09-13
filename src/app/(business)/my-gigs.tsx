import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/components/legacy-ui';
import { NotificationBell } from '@/components/notification-bell';
import { getMyGigs } from '@/lib/gig-api';
import { useAuth } from '@/providers/auth-provider';
export default function BusinessMyGigs() { const { token } = useAuth(); const query = useQuery({ queryKey: ['my-gigs'], queryFn: () => getMyGigs(token!), enabled: !!token }); return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}><View style={s.topRow}><Text style={s.heading}>Posted gigs</Text><NotificationBell /></View>{query.data?.gigs.map((gig) => <Pressable style={s.card} key={gig.id} onPress={() => router.push(`/(business)/gig/${gig.id}` as never)}><Text style={s.title}>{gig.title}</Text><Text style={s.status}>{gig.status.replaceAll('_', ' ')}</Text><Text style={s.copy}>₹{Number(gig.budget).toLocaleString()} · {gig.applications?.length ?? 0} applicants</Text></Pressable>)}{query.data?.gigs.length === 0 && <Text style={s.copy}>You have not posted a gig yet.</Text>}</ScrollView></SafeAreaView>; }
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.pale }, content: { padding: 20, gap: 12 }, heading: { color: colors.navy, fontSize: 28, fontWeight: '800', flex: 1 }, topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, card: { backgroundColor: colors.white, padding: 15, borderRadius: 14, gap: 5 }, title: { color: colors.navy, fontWeight: '800', fontSize: 17 }, status: { color: colors.blue, fontWeight: '700' }, copy: { color: colors.muted } });
