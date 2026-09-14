/**
 * Role Selection & Onboarding — FIXED production QA version.
 *
 * Fixes:
 * - Content paddingBottom 140 to prevent banner hidden behind sticky CTA
 * - BottomActionBar ensures Continue always visible above keyboard
 * - Login link routes with role param
 */
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Banner, BottomActionBar, Button, Icon, RoleSelectCard, Screen, Text, TextLink } from '@/components/ui';
import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { Role } from '@/types/api';

type UserRole = Exclude<Role, 'ADMIN'>;

const COPY = {
  tagline: 'Local skills. Real opportunities.',
  heading: 'How do you want to use YuvaConnect?',
  sub: 'Choose your role to personalize your experience and start connecting.',
  trustTitle: 'Trust built-in',
  trustBody: 'Every student and business is verified by our team to ensure a safe workspace.',
} as const;

const LOGO_TILE = 56;

export default function RoleSelectionScreen() {
  const params = useLocalSearchParams<{ role?: string }>();
  const [role, setRole] = useState<UserRole>(params.role === 'BUSINESS' ? 'BUSINESS' : 'STUDENT');

  const continueToSignup = () => router.push(`/(auth)/signup?role=${role}` as never);

  return (
    <Screen testID="screen-role-selection">
      <ScrollView style={styles.scroller} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <View style={styles.brandTile} accessibilityRole="image" accessibilityLabel="YuvaConnect">
            <Icon name="logo" size={30} color={color.textInverse} />
          </View>
          <Text variant="display" tone="brand" style={styles.brandName}>
            YuvaConnect
          </Text>
          <Text variant="bodyStrong" tone="secondary">
            {COPY.tagline}
          </Text>
        </View>

        <View style={styles.headingBlock}>
          <Text variant="title1">{COPY.heading}</Text>
          <Text variant="body" tone="secondary" style={styles.sub}>
            {COPY.sub}
          </Text>
        </View>

        <View style={styles.roles} accessibilityRole="radiogroup" accessibilityLabel="Choose your role">
          <RoleSelectCard
            title="Student"
            description="Find paid micro-gigs near your college and build a real-world portfolio."
            icon="studentFilled"
            selected={role === 'STUDENT'}
            onPress={() => setRole('STUDENT')}
            testID="role-student"
          />
          <RoleSelectCard
            title="Business"
            description="Find verified, skilled local talent for short-term tasks and micro-projects."
            icon="briefcaseFilled"
            selected={role === 'BUSINESS'}
            onPress={() => setRole('BUSINESS')}
            testID="role-business"
          />
        </View>

        <Banner tone="brand" icon="shieldCheckFilled" title={COPY.trustTitle} description={COPY.trustBody} style={styles.banner} />
        <View style={styles.bottomPad} />
      </ScrollView>

      <BottomActionBar>
        <View style={styles.barColumn}>
          <Button label="Continue" size="lg" onPress={continueToSignup} testID="role-continue" />
          <View style={styles.loginRow}>
            <Text variant="callout" tone="secondary">
              Already have an account?
            </Text>
            <TextLink label="Login" iconRight={null} onPress={() => router.push(`/(auth)/login?role=${role}` as never)} />
          </View>
        </View>
      </BottomActionBar>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroller: { width: '100%' },
  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: space['3xl'],
    paddingBottom: 140,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    alignItems: 'stretch',
  },
  brand: { gap: space.md },
  brandTile: {
    width: LOGO_TILE,
    height: LOGO_TILE,
    borderRadius: radius.lg,
    backgroundColor: color.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { marginTop: space.md },
  headingBlock: { marginTop: space['3xl'], gap: space.md },
  sub: { lineHeight: 24 },
  roles: { marginTop: space.xl, gap: space.xl },
  banner: { marginTop: space.xl },
  bottomPad: { height: space.xl },
  barColumn: { gap: space.md, width: '100%' },
  loginRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.md },
});
