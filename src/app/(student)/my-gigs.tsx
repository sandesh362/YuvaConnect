import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/components/ui';
import { getMyGigs } from '@/lib/gig-api';
import { useAuth } from '@/providers/auth-provider';
import { Application } from '@/types/api';
export default function StudentMyGigs() { const { token } = useAuth(); const query = useQuery({ queryKey: ['my-gigs'], queryFn: () => getMyGigs(token!), enabled: !!token }); const applications = query.data?.applications ?? []; const groups = applications.reduce<Record<string, Application[]>>((all, item) => { (all[item.status] ??= []).push(item); return all; }, {}); return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}><Text style={s.heading}>My gigs</Text>{Object.entries(groups).map(([status, items]) => <View key={status} style={s.group}><Text style={s.status}>{status.replace('_', ' ')}</Text>{items.map((item) => <Pressable key={item.id} style={s.card} onPress={() => router.push(`/(student)/gig/${item.gigId}` as never)}><Text style={s.title}>{item.gig?.title}</Text><Text style={s.copy}>{item.gig?.status}</Text></Pressable>)}</View>)}{!applications.length && <Text style={s.copy}>You have not applied to any gigs yet.</Text>}</ScrollView></SafeAreaView>; }
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.pale }, content: { padding: 20, gap: 16 }, heading: { color: colors.navy, fontSize: 28, fontWeight: '800' }, group: { gap: 8 }, status: { color: colors.blue, fontWeight: '800', textTransform: 'capitalize' }, card: { padding: 14, backgroundColor: colors.white, borderRadius: 12 }, title: { color: colors.navy, fontWeight: '800' }, copy: { color: colors.muted, marginTop: 3 } });
