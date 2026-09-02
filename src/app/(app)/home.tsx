import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, colors } from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { getMe } from '@/lib/auth-api';
import { useAuth } from '@/providers/auth-provider';

export default function HomeScreen() {
  const { token, user, setUser, signOut } = useAuth();
  const meQuery = useQuery({ queryKey: ['me'], queryFn: () => getMe(token!), enabled: !!token, initialData: user ?? undefined });
  const currentUser = meQuery.data ?? user;
  if (!currentUser) return null;
  const openProfile = () => router.push((currentUser.role === 'STUDENT' ? '/(student)/profile' : '/(business)/profile') as never);
  const isStudent = currentUser.role === 'STUDENT';
  return <SafeAreaView style={styles.safe}><View style={styles.card}><Text style={styles.brand}>YuvaConnect</Text><Text style={styles.heading}>Hello, {currentUser.name}</Text><Text style={styles.role}>{isStudent ? 'Student' : 'Business'} account</Text><Text style={styles.copy}>Your profile helps local businesses and students get to know you.</Text><View style={styles.actions}><Button title="View and edit profile" onPress={openProfile} /><Button title={isStudent ? 'Find gigs' : 'Post a gig'} onPress={() => router.push((isStudent ? '/(student)/feed' : '/(business)/post-gig') as never)} /><Button title="My gigs" variant="outline" onPress={() => router.push((isStudent ? '/(student)/my-gigs' : '/(business)/my-gigs') as never)} />{isStudent && <Button title="Earnings" variant="outline" onPress={() => router.push('/(student)/earnings' as never)} />}<Button title="Sign out" variant="outline" onPress={async () => { await signOut(); router.replace('/login' as never); }} /></View></View></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.pale, padding: 24 }, card: { backgroundColor: colors.white, borderRadius: 18, padding: 24, gap: 14 }, brand: { color: colors.blue, fontWeight: '800', fontSize: 18 }, heading: { color: colors.navy, fontSize: 28, fontWeight: '800' }, role: { color: colors.blue, fontWeight: '700' }, copy: { color: colors.muted, lineHeight: 21 }, actions: { gap: 12, marginTop: 8 } });
