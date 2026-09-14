/**
 * Login — wireframe 7/37 (student skin) + wireframe 25/37 (business skin).
 * Rebuild in place, route unchanged.
 *
 * Route: /(auth)/login  ·  Specs: docs/wireframes/07-student-login-signup.md,
 * docs/wireframes/25-business-login.md
 *
 * ?role=BUSINESS renders the business skin (white hero card, mint Login /
 * Create Account / Reports segments, "Login to Dashboard", Google+Phone
 * outline buttons, Why-hire card, Switch-to-Student footer). The contract is
 * the same real login() either way.
 *
 * Flags honoured: Google sign-in, Phone OTP, Forgot Password and the Reports
 * segment have NO live endpoints/routes — all render per wireframe and raise
 * explanatory InfoBanners on tap, never fake flows.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

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

  const submit = async () => {
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
    <Screen testID={isBusiness ? 'screen-login-business' : 'screen-login'}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
            onChangeText={setEmail}
            placeholder={isBusiness ? 'owner@business.com' : 'e.g. +91 98765 43210'}
            autoCapitalize="none"
            keyboardType="email-address"
            testID="login-email"
          />
          <TextField
            label="Password"
            icon="lock"
            type="password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            testID="login-password"
          />

          <View style={styles.forgotRow}>
            <TextLink
              label="Forgot Password?"
              iconRight={null}
              onPress={() => setNotice('Password reset is not wired to the live API yet — contact support from the Help centre.')}
            />
          </View>

          {error ? <InfoBanner tone="danger" icon="offline" title="Could not log in" description={error} /> : null}
          {notice ? <InfoBanner tone="info" icon="info" title="Flagged, not faked" description={notice} /> : null}

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

        <InfoBanner
          tone="success"
          icon="shieldCheckFilled"
          title="Your data is protected with bank-grade security"
          style={styles.security}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: space['2xl'] },

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
});
