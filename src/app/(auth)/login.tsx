import { useMutation } from '@tanstack/react-query';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, colors, Field } from '@/components/ui';
import { apiErrorMessage } from '@/config/api';
import { login } from '@/lib/auth-api';
import { useAuth } from '@/providers/auth-provider';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setSession } = useAuth();
  const mutation = useMutation({
    mutationFn: () => login({ email, password }),
    onSuccess: async ({ accessToken, user }) => { await setSession(accessToken, user); router.replace('/home' as never); },
    onError: (error) => Alert.alert('Could not sign in', apiErrorMessage(error)),
  });
  return <SafeAreaView style={styles.safe}><View style={styles.card}><Text style={styles.brand}>YuvaConnect</Text><Text style={styles.heading}>Welcome back</Text><Text style={styles.subheading}>Sign in to find and manage local opportunities.</Text><View style={styles.form}><Field label="Email" autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="you@example.com" /><Field label="Password" secureTextEntry autoComplete="password" value={password} onChangeText={setPassword} placeholder="Your password" /><Button title={mutation.isPending ? 'Signing in…' : 'Sign in'} disabled={mutation.isPending} onPress={() => mutation.mutate()} /></View><Text style={styles.footer}>New to YuvaConnect? <Link href={'/signup' as never} style={styles.link}>Create an account</Link></Text></View></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.pale, justifyContent: 'center', padding: 24 }, card: { backgroundColor: colors.white, borderRadius: 18, padding: 24, gap: 10 }, brand: { color: colors.blue, fontSize: 18, fontWeight: '800' }, heading: { fontSize: 28, fontWeight: '800', color: colors.navy }, subheading: { color: colors.muted, lineHeight: 20 }, form: { gap: 16, marginTop: 14 }, footer: { color: colors.muted, textAlign: 'center', marginTop: 14 }, link: { color: colors.blue, fontWeight: '700' } });
