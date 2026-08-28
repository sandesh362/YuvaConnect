import { useMutation } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, colors, Field } from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { signup } from '@/lib/auth-api';
import { useAuth } from '@/providers/auth-provider';
import { Role } from '@/types/api';

export default function SignupScreen() {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [role, setRole] = useState<Exclude<Role, 'ADMIN'>>('STUDENT');
  const { setSession } = useAuth();
  const mutation = useMutation({ mutationFn: () => signup({ name, email, password, role }), onSuccess: async ({ accessToken, user }) => { await setSession(accessToken, user); router.replace('/home' as never); }, onError: (error) => Alert.alert('Could not create account', apiErrorMessage(error)) });
  return <SafeAreaView style={styles.safe}><View style={styles.card}><Text style={styles.brand}>YuvaConnect</Text><Text style={styles.heading}>Create your account</Text><View style={styles.form}><Field label="Name" value={name} onChangeText={setName} placeholder="Your name" /><Field label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@example.com" /><Field label="Password" secureTextEntry value={password} onChangeText={setPassword} placeholder="At least 8 characters" /><Text style={styles.label}>I am joining as</Text><View style={styles.roles}>{(['STUDENT', 'BUSINESS'] as const).map((item) => <Pressable key={item} onPress={() => setRole(item)} style={[styles.role, role === item && styles.roleSelected]}><Text style={[styles.roleText, role === item && styles.roleTextSelected]}>{item === 'STUDENT' ? 'Student' : 'Business'}</Text></Pressable>)}</View><Button title={mutation.isPending ? 'Creating account…' : 'Create account'} disabled={mutation.isPending} onPress={() => mutation.mutate()} /></View><Text style={styles.footer}>Already have an account? <Link href={'/login' as never} style={styles.link}>Sign in</Link></Text></View></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.pale, padding: 24 }, card: { backgroundColor: colors.white, borderRadius: 18, padding: 24, gap: 10 }, brand: { color: colors.blue, fontSize: 18, fontWeight: '800' }, heading: { fontSize: 28, fontWeight: '800', color: colors.navy }, form: { gap: 16, marginTop: 10 }, label: { color: colors.text, fontWeight: '600' }, roles: { flexDirection: 'row', gap: 10 }, role: { flex: 1, borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 10, alignItems: 'center' }, roleSelected: { borderColor: colors.blue, backgroundColor: colors.pale }, roleText: { color: colors.muted, fontWeight: '700' }, roleTextSelected: { color: colors.blue }, footer: { color: colors.muted, textAlign: 'center', marginTop: 12 }, link: { color: colors.blue, fontWeight: '700' } });
