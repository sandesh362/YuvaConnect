/**
 * Login — FIXED production QA version.
 * Route: /(auth)/login
 *
 * Fixes:
 * - CTA always visible: KeyboardAvoidingView + ScrollView with large bottom padding
 * - Validation: required fields, email format, password length
 * - Error states visible
 * - Forgot password shows helpful banner
 * - Back navigation works
 * - Loading state prevents double submit
 * - Role persistence: ?role=BUSINESS shows business skin but same real login
 */
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

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
      // Allow phone but basic check
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
    <Screen testID={isBusiness ? 'screen-login-business' : 'screen-login'} includeBottomInset>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav} keyboardVerticalOffset={0}>
        <ScrollView
          contentContainerStyle={styles.content}
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
                onReports={() => setNotice('Reports has no route or backend yet — it is kept visible per the wireframe and flagged, not faked.')}
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
                onPress={() => setNotice('Password reset is not wired to the live API yet — contact support from the Help centre. You can use demo accounts: student@yuvaconnect.demo / Demo@123 or business@yuvaconnect.demo / Demo@123')}
              />
            </View>

            {error ? <InfoBanner tone="danger" icon="offline" title="Could not log in" description={error} /> : null}
            {notice ? <InfoBanner tone="info" icon="info" title="Note" description={notice} /> : null}

            <Button
              label={isBusiness ? 'Login to Dashboard' : 'Login to YuvaConnect'}
              size="lg"
              loading={pending}
              onPress={submit}
              testID="login-submit"
            />

            {isBusiness ? (
              <OrContinueWith
                onGoogle={() => setNotice('Google sign-in has no live backend endpoint yet — email login is the real path.')}
                onPhone={() => setNotice('Phone OTP has no live backend endpoint yet — email login is the real path.')}
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
                <Button
                  label="Continue with Google"
                  variant="secondary"
                  size="lg"
                  icon="logoGoogle"
                  onPress={() => setNotice('Google sign-in has no live backend endpoint yet — email login is the real path.')}
                  testID="login-google"
                />
              </>
            )}
          </View>

          {isBusiness ? <WhyHireCard /> : null}

          {isBusiness ? (
            <View style={styles.footerWrap}>
              <SwitchStudentFooter onSwitch={() => router.replace('/login' as never)} />
            </View>
          ) : (
            <View style={styles.footerRow}>
              <Text variant="body" tone="secondary">
                Don't have an account?
              </Text>
              <TextLink label="Create Account" iconRight={null} onPress={() => router.push('/signup' as never)} />
            </View>
          )}

          <InfoBanner tone="success" icon="shieldCheckFilled" title="Your data is protected with bank-grade security" style={styles.security} />

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

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1 },
  content: { paddingBottom: 120, flexGrow: 1 },

  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    paddingTop: space['5xl'],
    paddingBottom: space['2xl'],
    borderBottomLeftRadius: radius['2xl'],
    borderBottomRightRadius: radius['2xl'],
    paddingHorizontal: layout.screenGutter,
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
    maxWidth: layout.maxContentWidth,
    alignSelf: 'stretch',
  },
  forgotRow: { alignItems: 'flex-end' },

  orRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.xs },
  orLine: { flex: 1, height: 1, backgroundColor: color.divider },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    marginTop: space.xl,
  },
  footerWrap: { marginTop: space.xl, marginHorizontal: layout.screenGutter },
  security: { marginHorizontal: layout.screenGutter, marginTop: space.xl },
  demoBox: {
    marginHorizontal: layout.screenGutter,
    marginTop: space.lg,
    padding: space.base,
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.md,
    gap: 4,
  },
  bottomSpacer: { height: 40 },
});
