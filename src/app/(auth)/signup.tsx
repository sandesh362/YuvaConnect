/**
 * Signup — PERFECT UI FIX version
 * - Single KAV flex:1 keyboardVerticalOffset 20
 * - ScrollView flex:1 flexGrow:1 paddingBottom safeArea+40
 * - CTA width 100%
 */
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, InfoBanner, Screen, SelectableChip, Text, TextField, TextLink } from '@/components/ui';
import { BusinessHero, MintAuthSegments, OrContinueWith, SwitchStudentFooter, WhyHireCard } from '@/components/auth/business-skin';
import { apiErrorMessage } from '@/config/api';
import { signup } from '@/lib/auth-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { gradient } from '@/theme/gradients';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { Role } from '@/types/api';

type UserRole = Exclude<Role, 'ADMIN'>;

export default function SignupScreen() {
  const params = useLocalSearchParams<{ role?: string }>();
  const { setSession } = useAuth();
  const insets = useSafeAreaInsets();

  const [role, setRole] = useState<UserRole>(params.role === 'BUSINESS' ? 'BUSINESS' : 'STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const isStudent = role === 'STUDENT';
  const businessSkin = params.role === 'BUSINESS';

  const validate = (): boolean => {
    const errs: typeof fieldErrors = {};
    if (!name.trim()) errs.name = 'Name is required';
    else if (name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email.trim())) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setPending(true);
    setError(null);
    try {
      const { accessToken, user } = await signup({ name: name.trim(), email: email.trim(), password, role });
      await setSession(accessToken, user);
      router.replace('/home' as never);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <Screen testID="screen-signup" tone="sunken">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav} keyboardVerticalOffset={20}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {businessSkin ? (
            <BusinessHero />
          ) : (
            <LinearGradient
              colors={[...gradient.auth.colors] as [string, string, ...string[]]}
              start={gradient.auth.start}
              end={gradient.auth.end}
              style={styles.hero}>
              <View style={styles.heroTile}>
                <Icon name="logo" size={44} color={color.primary} />
              </View>
              <Text variant="display" style={styles.heroWordmark}>
                YuvaConnect
              </Text>
              <Text variant="bodyStrong" tone="secondary">
                Local skills. Real opportunities.
              </Text>
            </LinearGradient>
          )}

          <View style={styles.card}>
            {businessSkin ? (
              <MintAuthSegments
                active="signup"
                onNavigate={(key) => router.replace((key === 'login' ? '/login?role=BUSINESS' : '/signup?role=BUSINESS') as never)}
                onReports={() => setNotice('Reports aren’t available yet — your dashboard shows the same figures once you sign in.')}
              />
            ) : null}
            <Text variant="title1">Create Account</Text>
            <Text variant="body" tone="secondary">
              {isStudent ? 'Join as a student and get verified by your college.' : 'Join as a business and hire verified students.'}
            </Text>

            {!businessSkin ? (
              <View style={styles.roleBlock}>
                <Text variant="label" tone="secondary">
                  I am joining as
                </Text>
                <View style={styles.roleRow} accessibilityRole="radiogroup" accessibilityLabel="Account role">
                  <SelectableChip label="Student" selected={isStudent} onToggle={() => setRole('STUDENT')} indicator="none" style={styles.roleChip} />
                  <SelectableChip label="Business" selected={!isStudent} onToggle={() => setRole('BUSINESS')} indicator="none" style={styles.roleChip} />
                </View>
              </View>
            ) : null}

            <TextField
              label="Name"
              icon="person"
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
              }}
              placeholder="Your full name"
              errorText={fieldErrors.name}
              testID="signup-name"
            />
            <TextField
              label={businessSkin ? 'Business Email' : 'Email'}
              icon="mail"
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
              }}
              placeholder={businessSkin ? 'owner@business.com' : 'you@example.com'}
              autoCapitalize="none"
              keyboardType="email-address"
              errorText={fieldErrors.email}
              testID="signup-email"
            />
            <TextField
              label="Password"
              icon="lock"
              type="password"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
              }}
              placeholder="At least 8 characters"
              helperText="Minimum 8 characters."
              errorText={fieldErrors.password}
              testID="signup-password"
            />

            {error ? <InfoBanner tone="danger" icon="offline" title="Could not create account" description={error} /> : null}
            {notice ? <InfoBanner tone="info" icon="info" title="Note" description={notice} /> : null}

            <View style={styles.ctaWrap}>
              <Button label="Create Account" size="lg" loading={pending} onPress={submit} style={styles.cta} testID="signup-submit" />
            </View>

            {businessSkin ? (
              <OrContinueWith
                onGoogle={() => setNotice('Google sign-up isn’t available yet — create your account with your email address instead.')}
                onPhone={() => setNotice('Phone sign-up isn’t available yet — create your account with your email address instead.')}
              />
            ) : (
              <>
                <View style={styles.orRow}>
                  <View style={styles.orLine} />
                  <Text variant="captionStrong" tone="tertiary">
                    OR
                  </Text>
                  <View style={styles.orLine} />
                </View>
                <View style={styles.ctaWrap}>
                  <Button
                    label="Continue with Google"
                    variant="secondary"
                    size="lg"
                    icon="logoGoogle"
                    onPress={() => setNotice('Google sign-up isn’t available yet — create your account with your email address instead.')}
                    style={styles.cta}
                    testID="signup-google"
                  />
                </View>
              </>
            )}
          </View>

          {businessSkin ? (
            <View style={styles.whyWrap}>
              <WhyHireCard />
            </View>
          ) : null}

          {businessSkin ? (
            <View style={styles.footerWrap}>
              <SwitchStudentFooter onSwitch={() => router.replace('/signup' as never)} />
            </View>
          ) : (
            <View style={styles.footerRow}>
              <Text variant="body" tone="secondary">
                Already have an account?
              </Text>
              <TextLink label="Login" iconRight={null} onPress={() => router.push('/login' as never)} />
            </View>
          )}

          <View style={styles.securityWrap}>
            <InfoBanner tone="success" icon="shieldCheckFilled" title="Your data is protected with bank-grade security" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1 },
  scroll: { flex: 1 },
  content: { flexGrow: 1, gap: space.base },

  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    paddingTop: space['4xl'],
    paddingBottom: space.xl,
    borderBottomLeftRadius: radius['2xl'],
    borderBottomRightRadius: radius['2xl'],
    paddingHorizontal: layout.screenGutter,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  heroTile: {
    width: 84,
    height: 84,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.lg,
  },
  heroWordmark: { color: color.textPrimary, marginTop: space.sm },

  card: {
    backgroundColor: color.surface,
    borderRadius: radius['2xl'],
    ...shadow.md,
    marginHorizontal: layout.screenGutter,
    marginTop: space.xl,
    padding: space.xl,
    gap: space.base,
    width: '100%',
    maxWidth: layout.maxContentWidth - layout.screenGutter * 2,
    alignSelf: 'center',
  },
  roleBlock: { gap: space.sm },
  roleRow: { flexDirection: 'row', gap: space.md },
  roleChip: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  ctaWrap: { width: '100%' },
  cta: { width: '100%' },

  orRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.xs },
  orLine: { flex: 1, height: 1, backgroundColor: color.divider },

  whyWrap: { marginHorizontal: layout.screenGutter, marginTop: space.xl, width: '100%', maxWidth: layout.maxContentWidth - layout.screenGutter * 2, alignSelf: 'center' },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    marginTop: space.xl,
    paddingHorizontal: layout.screenGutter,
  },
  footerWrap: { marginTop: space.xl, marginHorizontal: layout.screenGutter, width: '100%', maxWidth: layout.maxContentWidth - layout.screenGutter * 2, alignSelf: 'center' },
  securityWrap: { marginHorizontal: layout.screenGutter, marginTop: space.xl, width: '100%', maxWidth: layout.maxContentWidth - layout.screenGutter * 2, alignSelf: 'center' },
});
