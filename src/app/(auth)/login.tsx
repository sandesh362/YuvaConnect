/**
 * Login — PERFECT UI FIX version
 * - Single KAV flex:1, keyboardVerticalOffset 20
 * - ScrollView style flex:1, contentContainerStyle flexGrow:1, paddingBottom safeArea + 40
 * - CTA always visible, width 100%
 * - No double KAV (Screen has no KAV now)
 */
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Icon, InfoBanner, Screen, Text, TextField, TextLink } from '@/components/ui';
import { BusinessHero, MintAuthSegments, OrContinueWith, SwitchStudentFooter, WhyHireCard } from '@/components/auth/business-skin';
import { apiErrorMessage } from '@/config/api';
import { login } from '@/lib/auth-api';
import { useAuth } from '@/providers/auth-provider';
import { color } from '@/theme/colors';
import { gradient } from '@/theme/gradients';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

export default function LoginScreen() {
  const params = useLocalSearchParams<{ role?: string }>();
  const isBusiness = params.role === 'BUSINESS';
  const { setSession } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const errs: typeof fieldErrors = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email.trim()) && !/^\+?91/.test(email.trim())) {
      if (!email.includes('@')) errs.email = 'Enter a valid email';
    }
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setPending(true);
    setError(null);
    try {
      const { accessToken, user } = await login({ email: email.trim(), password });
      await setSession(accessToken, user);
      router.replace('/home' as never);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <Screen testID={isBusiness ? 'screen-login-business' : 'screen-login'} tone="sunken">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
        keyboardVerticalOffset={20}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) + 40 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          {isBusiness ? (
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
            {isBusiness ? (
              <MintAuthSegments
                active="login"
                onNavigate={(key) => router.replace((key === 'signup' ? '/signup?role=BUSINESS' : '/login?role=BUSINESS') as never)}
                onReports={() => setNotice('Reports aren’t available yet — sign in and your dashboard shows the same figures.')}
              />
            ) : null}

            <Text variant="title1">{isBusiness ? 'Welcome Back' : 'Welcome Back'}</Text>
            <Text variant="body" tone="secondary">
              {isBusiness ? 'Login to manage your gigs and talent' : 'Login to your verified account'}
            </Text>

            <TextField
              label={isBusiness ? 'Business Email' : 'Email or Phone'}
              icon={isBusiness ? 'mail' : 'person'}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder={isBusiness ? 'owner@business.com' : 'you@example.com'}
              autoCapitalize="none"
              keyboardType="email-address"
              errorText={fieldErrors.email}
              testID="login-email"
            />
            <TextField
              label="Password"
              icon="lock"
              type="password"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="••••••••"
              errorText={fieldErrors.password}
              onSubmitEditing={submit}
              testID="login-password"
            />

            <View style={styles.forgotRow}>
              <TextLink
                label="Forgot Password?"
                iconRight={null}
                onPress={() => setNotice('Password reset isn’t available yet — reach us through the Help centre. To explore right away, sign in with student@yuvaconnect.demo or business@yuvaconnect.demo (password Demo@123).')}
              />
            </View>

            {error ? <InfoBanner tone="danger" icon="offline" title="Could not log in" description={error} /> : null}
            {notice ? <InfoBanner tone="info" icon="info" title="Note" description={notice} /> : null}

            <View style={styles.ctaWrap}>
              <Button
                label={isBusiness ? 'Login to Dashboard' : 'Login to YuvaConnect'}
                size="lg"
                loading={pending}
                onPress={submit}
                style={styles.cta}
                testID="login-submit"
              />
            </View>

            {isBusiness ? (
              <OrContinueWith
                onGoogle={() => setNotice('Google sign-in isn’t available yet — sign in with your email address instead.')}
                onPhone={() => setNotice('Phone sign-in isn’t available yet — sign in with your email address instead.')}
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
                    onPress={() => setNotice('Google sign-in isn’t available yet — sign in with your email address instead.')}
                    style={styles.cta}
                    testID="login-google"
                  />
                </View>
              </>
            )}
          </View>

          {isBusiness ? (
            <View style={styles.whyWrap}>
              <WhyHireCard />
            </View>
          ) : null}

          {isBusiness ? (
            <View style={styles.footerWrap}>
              <SwitchStudentFooter onSwitch={() => router.replace('/login' as never)} />
            </View>
          ) : (
            <View style={styles.footerRow}>
              <Text variant="body" tone="secondary">
                Don’t have an account?
              </Text>
              <TextLink label="Create Account" iconRight={null} onPress={() => router.push('/signup' as never)} />
            </View>
          )}

          <View style={styles.securityWrap}>
            <InfoBanner tone="success" icon="shieldCheckFilled" title="Your data is protected with bank-grade security" />
          </View>

          <View style={styles.demoBox}>
            <Text variant="captionStrong" tone="secondary">
              Demo Accounts:
            </Text>
            <Text variant="caption" tone="secondary">
              Student: student@yuvaconnect.demo / Demo@123
            </Text>
            <Text variant="caption" tone="secondary">
              Business: business@yuvaconnect.demo / Demo@123
            </Text>
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
    paddingTop: space['5xl'],
    paddingBottom: space['2xl'],
    borderBottomLeftRadius: radius['2xl'],
    borderBottomRightRadius: radius['2xl'],
    paddingHorizontal: layout.screenGutter,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  heroTile: {
    width: 96,
    height: 96,
    borderRadius: radius['2xl'],
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.lg,
  },
  heroWordmark: { color: color.textPrimary, marginTop: space.md },

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
  forgotRow: { alignItems: 'flex-end' },
  ctaWrap: { width: '100%' },
  cta: { width: '100%' },

  orRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.xs },
  orLine: { flex: 1, height: 1, backgroundColor: color.divider },

  whyWrap: {
    marginHorizontal: layout.screenGutter,
    marginTop: space.xl,
    width: '100%',
    maxWidth: layout.maxContentWidth - layout.screenGutter * 2,
    alignSelf: 'center',
  },
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
  demoBox: {
    marginHorizontal: layout.screenGutter,
    marginTop: space.lg,
    padding: space.base,
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.md,
    gap: 4,
    width: '100%',
    maxWidth: layout.maxContentWidth - layout.screenGutter * 2,
    alignSelf: 'center',
  },
});
