/**
 * Student / Business Signup — wireframe 7/37 (signup half). Rebuild in place.
 *
 * Route: /(auth)/signup  ·  Spec: docs/wireframes/07-student-login-signup.md
 *
 * Closes the screen-1 handoff: the role arrives as ?role=STUDENT|BUSINESS from
 * /role and seeds the chooser; the real signup({ role }) contract is used
 * unchanged. Google sign-in remains flagged (no live endpoint).
 */
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

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

  const [role, setRole] = useState<UserRole>(params.role === 'BUSINESS' ? 'BUSINESS' : 'STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isStudent = role === 'STUDENT';
  const businessSkin = params.role === 'BUSINESS';

  const submit = async () => {
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
    <Screen testID="screen-signup">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* --- Hero: business skin (25) or student gradient (07) --- */}
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

        {/* --- Form card --- */}
        <View style={styles.card}>
          {businessSkin ? (
            <MintAuthSegments
              active="signup"
              onNavigate={(key) => router.replace((key === 'login' ? '/login?role=BUSINESS' : '/signup?role=BUSINESS') as never)}
              onReports={() => setNotice('Reports has no route or backend yet — it is kept visible per the wireframe and flagged, not faked.')}
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

          <TextField label="Name" icon="person" value={name} onChangeText={setName} placeholder="Your full name" testID="signup-name" />
          <TextField
            label={businessSkin ? 'Business Email' : 'Email'}
            icon="mail"
            value={email}
            onChangeText={setEmail}
            placeholder={businessSkin ? 'owner@business.com' : 'you@example.com'}
            autoCapitalize="none"
            keyboardType="email-address"
            testID="signup-email"
          />
          <TextField
            label="Password"
            icon="lock"
            type="password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            helperText="Minimum 8 characters."
            testID="signup-password"
          />

          {error ? <InfoBanner tone="danger" icon="offline" title="Could not create account" description={error} /> : null}
          {notice ? <InfoBanner tone="info" icon="info" title="Flagged, not faked" description={notice} /> : null}

          <Button label="Create Account" size="lg" loading={pending} onPress={submit} testID="signup-submit" />

          {businessSkin ? (
            <OrContinueWith
              onGoogle={() => setNotice('Google sign-in has no live backend endpoint yet — email signup is the real path.')}
              onPhone={() => setNotice('Phone OTP has no live backend endpoint yet — email signup is the real path.')}
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
                onPress={() => setNotice('Google sign-in has no live backend endpoint yet — email signup is the real path.')}
                testID="signup-google"
              />
            </>
          )}
        </View>

        {businessSkin ? <WhyHireCard /> : null}

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
    paddingTop: space['4xl'],
    paddingBottom: space.xl,
    borderBottomLeftRadius: radius['2xl'],
    borderBottomRightRadius: radius['2xl'],
    paddingHorizontal: layout.screenGutter,
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
    maxWidth: layout.maxContentWidth,
    alignSelf: 'stretch',
  },
  roleBlock: { gap: space.sm },
  roleRow: { flexDirection: 'row', gap: space.md },
  roleChip: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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
