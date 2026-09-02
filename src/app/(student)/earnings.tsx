import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { getEarnings } from '@/lib/gig-api';
import { useAuth } from '@/providers/auth-provider';

export default function EarningsScreen() {
  const { token } = useAuth();
  const query = useQuery({ queryKey: ['earnings'], queryFn: () => getEarnings(token!), enabled: !!token });
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.content}><Text style={s.heading}>Earnings</Text><View style={s.total}><Text style={s.totalLabel}>Total earned</Text><Text style={s.totalValue}>₹{Number(query.data?.total ?? 0).toLocaleString()}</Text></View>{query.isError && <Text style={s.error}>{apiErrorMessage(query.error)}</Text>}{query.data?.payments.map((payment) => <View key={payment.id} style={s.card}><View><Text style={s.title}>{payment.gigTitle}</Text><Text style={s.date}>{new Date(payment.date).toLocaleDateString()}</Text></View><Text style={s.amount}>₹{Number(payment.amount).toLocaleString()}</Text></View>)}{query.data && !query.data.payments.length && <Text style={s.copy}>Released gig payments will appear here.</Text>}</ScrollView></SafeAreaView>;
}

const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.pale }, content: { padding: 20, gap: 14 }, heading: { color: colors.navy, fontSize: 28, fontWeight: '800' }, total: { backgroundColor: colors.blue, borderRadius: 16, padding: 20, gap: 4 }, totalLabel: { color: colors.white, fontSize: 15 }, totalValue: { color: colors.white, fontSize: 32, fontWeight: '800' }, card: { backgroundColor: colors.white, padding: 15, borderRadius: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { color: colors.navy, fontSize: 16, fontWeight: '800' }, date: { color: colors.muted, marginTop: 4 }, amount: { color: colors.blue, fontSize: 17, fontWeight: '800' }, copy: { color: colors.muted }, error: { color: colors.danger } });
