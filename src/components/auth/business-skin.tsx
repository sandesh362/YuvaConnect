/**
 * Business auth skin — wireframe 25/37. Shared pieces used by /(auth)/login and
 * /(auth)/signup when ?role=BUSINESS is present. The student skin (screen 7)
 * stays untouched; this only restyles, all contracts remain login()/signup().
 *
 * Flags honoured: the "Reports" segment has no route, Google/Phone auth have no
 * endpoints — all three render per the wireframe and raise explanatory notices
 * through the callbacks the screens pass in.
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Icon, Text, TextLink } from '@/components/ui';
import { color } from '@/theme/colors';
import type { IconName } from '@/theme/icons';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

export function BusinessHero() {
  return (
    <View style={styles.hero}>
      <View style={styles.heroTile}>
        <Icon name="briefcase" size={40} color={color.primary} />
      </View>
      <Text variant="title1" style={styles.heroTitle}>
        YuvaConnect Business
      </Text>
      <Text variant="body" tone="secondary" style={styles.heroCopy}>
        Find verified student talent for your local business
      </Text>
    </View>
  );
}

export type AuthSegmentKey = 'login' | 'signup' | 'reports';

export function MintAuthSegments({
  active,
  onNavigate,
  onReports,
}: {
  active: AuthSegmentKey;
  onNavigate: (key: 'login' | 'signup') => void;
  onReports: () => void;
}) {
  const segments: { key: AuthSegmentKey; label: string }[] = [
    { key: 'login', label: 'Login' },
    { key: 'signup', label: 'Create Account' },
    { key: 'reports', label: 'Reports' },
  ];
  return (
    <View style={styles.segmentTrack} accessibilityRole="tablist">
      {segments.map((segment) => {
        const isActive = segment.key === active;
        return (
          <Pressable
            key={segment.key}
            accessibilityRole="tab"
            accessibilityLabel={segment.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => (segment.key === 'reports' ? onReports() : onNavigate(segment.key))}
            style={[styles.segment, isActive && styles.segmentActive]}>
            <Text variant="callout" style={isActive ? styles.segmentLabelActive : styles.segmentLabel}>
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function OrContinueWith({ onGoogle, onPhone }: { onGoogle: () => void; onPhone: () => void }) {
  return (
    <View style={styles.orBlock}>
      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <Text variant="caption" tone="tertiary">
          or continue with
        </Text>
        <View style={styles.orLine} />
      </View>
      <View style={styles.orButtons}>
        <Button label="Google" variant="secondary" icon="logoGoogle" style={styles.orButton} onPress={onGoogle} />
        <Button label="Phone" variant="secondary" icon="phone" style={styles.orButton} onPress={onPhone} />
      </View>
    </View>
  );
}

const WHY_ROWS: { icon: IconName; text: string }[] = [
  { icon: 'shieldCheckFilled', text: 'Verified college students from local institutions' },
  { icon: 'wallet', text: 'Secure, transparent micro-gig payments' },
  { icon: 'gauge', text: 'Post a gig and get applicants in minutes' },
];

export function WhyHireCard() {
  return (
    <View style={styles.whyCard}>
      <Text variant="title3">Why hire on YuvaConnect?</Text>
      {WHY_ROWS.map((row) => (
        <View key={row.text} style={styles.whyRow}>
          <Icon name={row.icon} size={20} color={color.successStrong} />
          <Text variant="callout" tone="secondary" style={styles.whyCopy}>
            {row.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function SwitchStudentFooter({ onSwitch }: { onSwitch: () => void }) {
  return (
    <View style={styles.footerRow}>
      <Text variant="body" tone="secondary">
        Are you a student?
      </Text>
      <TextLink label="Switch to Student App" iconRight={null} onPress={onSwitch} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.surface,
    borderBottomLeftRadius: radius['2xl'],
    borderBottomRightRadius: radius['2xl'],
    ...shadow.sm,
    paddingTop: space['4xl'],
    paddingBottom: space.xl,
    paddingHorizontal: layout.screenGutter,
  },
  heroTile: {
    width: 84,
    height: 84,
    borderRadius: 20,
    backgroundColor: color.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { textAlign: 'center' },
  heroCopy: { textAlign: 'center', maxWidth: 320 },

  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.full,
    padding: 4,
    gap: 4,
  },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: space.sm, borderRadius: radius.full },
  segmentActive: { backgroundColor: color.successSoft },
  segmentLabel: { color: color.textSecondary },
  segmentLabelActive: { color: color.textPrimary, fontWeight: '700' },

  orBlock: { gap: space.md },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  orLine: { flex: 1, height: 1, backgroundColor: color.divider },
  orButtons: { flexDirection: 'row', gap: space.md },
  orButton: { flex: 1 },

  whyCard: {
    backgroundColor: color.surfaceMuted,
    borderRadius: radius.lg,
    padding: space.base,
    gap: space.md,
  },
  whyRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  whyCopy: { flex: 1, lineHeight: 20 },

  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.md },
});
