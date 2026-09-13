import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { color } from '@/theme/colors';
import { gradient, gradientForeground, gradientForegroundMuted, type GradientToken } from '@/theme/gradients';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { IconName } from '@/theme/icons';
import { Icon } from './Icon';
import { Text } from './Text';

export type BannerProps = {
  title: string;
  /** Supporting line under the title. */
  description?: string;
  icon?: IconName;
  /** `brand` is the default blue→indigo promo gradient. */
  tone?: GradientToken | 'flat';
  /** Trailing label rendered as a white-outline pill CTA. */
  actionLabel?: string;
  onAction?: () => void;
  /** Whole-banner tap target. */
  onPress?: () => void;
  /** Right-aligned stat, e.g. "92%" beside "Skill Match". */
  metric?: { value: string; label: string };
  onDismiss?: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Gradient promo/status banner — surfaces one important contextual fact
 * ("92% Skill Match", "Verified Student", "Payment held in escrow") without
 * spending a whole card on it.
 */
export function Banner({
  title,
  description,
  icon,
  tone = 'brand',
  actionLabel,
  onAction,
  onPress,
  metric,
  onDismiss,
  compact = false,
  style,
  testID,
}: BannerProps) {
  const content = (
    <>
      {icon ? (
        <View style={[styles.iconWell, compact && styles.iconWellCompact]}>
          <Icon name={icon} size={compact ? 18 : 22} color={gradientForeground} />
        </View>
      ) : null}

      <View style={styles.body}>
        <Text variant={compact ? 'label' : 'heading'} style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {description ? (
          <Text variant="caption" style={{ color: gradientForegroundMuted, marginTop: 2 }} numberOfLines={compact ? 1 : 3}>
            {description}
          </Text>
        ) : null}
      </View>

      {metric ? (
        <View style={styles.metric}>
          <Text variant="title2" style={styles.metricValue}>
            {metric.value}
          </Text>
          <Text variant="overline" uppercase style={styles.metricLabel}>
            {metric.label}
          </Text>
        </View>
      ) : null}

      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          hitSlop={6}
          style={({ pressed }) => [styles.pill, pressed && { backgroundColor: 'rgba(255,255,255,0.28)' }]}>
          <Text variant="caption" style={{ color: gradientForeground, fontWeight: '700' }}>
            {actionLabel}
          </Text>
          <Icon name="chevronRight" size={13} color={gradientForeground} />
        </Pressable>
      ) : null}

      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={onDismiss}
          hitSlop={8}
          style={({ pressed }) => [styles.dismiss, pressed && { opacity: 0.6 }]}>
          <Icon name="close" size={16} color={gradientForegroundMuted} />
        </Pressable>
      ) : null}
    </>
  );

  const padding = compact ? space.md : layout.cardPadding;
  const corner = compact ? radius.md : radius.lg;

  if (tone === 'flat') {
    return (
      <View
        testID={testID}
        style={[styles.flat, { padding, borderRadius: corner }, style]}>
        {content}
      </View>
    );
  }

  const g = gradient[tone];
  const containerStyle: StyleProp<ViewStyle> = [styles.container, { borderRadius: corner, marginBottom: space.md }, style];

  const gradientNode = (
    <LinearGradient
      colors={g.colors}
      start={g.start}
      end={g.end}
      style={[styles.gradient, { padding, borderRadius: corner }]}>
      {content}
    </LinearGradient>
  );

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={title}
        onPress={onPress}
        style={({ pressed }) => [containerStyle, styles.overflow, pressed && styles.bannerPressed]}>
        {gradientNode}
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={[containerStyle, styles.overflow]}>
      {gradientNode}
    </View>
  );
}

/**
 * Inline informational strip (not a gradient) — the "All candidates are
 * verified students" reassurance rows and escrow notices.
 */
export function InfoBanner({
  tone = 'info',
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: {
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const skins = {
    info: { bg: color.infoSoft, border: color.infoBorder, fg: color.info, icon: 'infoFilled' as IconName },
    success: { bg: color.successSoft, border: color.successBorder, fg: color.successStrong, icon: 'shieldCheckFilled' as IconName },
    warning: { bg: color.warningSoft, border: color.warningBorder, fg: color.warningStrong, icon: 'alertFilled' as IconName },
    danger: { bg: color.dangerSoft, border: color.dangerBorder, fg: color.dangerStrong, icon: 'alertFilled' as IconName },
    neutral: { bg: color.surfaceMuted, border: color.border, fg: color.textSecondary, icon: 'info' as IconName },
  }[tone];

  return (
    <View style={[styles.info, { backgroundColor: skins.bg, borderColor: skins.border }, style]}>
      <Icon name={icon ?? skins.icon} size={17} color={skins.fg} />
      <View style={styles.body}>
        <Text variant="calloutStrong" style={{ color: skins.fg }}>
          {title}
        </Text>
        {description ? (
          <Text variant="caption" style={{ color: skins.fg, opacity: 0.85, marginTop: 1 }}>
            {description}
          </Text>
        ) : null}
        {actionLabel && onAction ? (
          <Pressable accessibilityRole="button" onPress={onAction} hitSlop={6} style={styles.infoAction}>
            <Text variant="label" style={{ color: skins.fg }}>
              {actionLabel}
            </Text>
            <Icon name="chevronRight" size={13} color={skins.fg} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: 'stretch' },
  overflow: { overflow: 'hidden' },
  bannerPressed: { opacity: 0.94 },
  gradient: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  flat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: color.primarySoft,
    borderWidth: 1,
    borderColor: color.primaryBorder,
    marginBottom: space.md,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  iconWellCompact: { width: 32, height: 32, borderRadius: radius.sm },
  body: { flex: 1, gap: 0 },
  title: { color: gradientForeground },
  metric: { alignItems: 'flex-end', gap: 0 },
  metricValue: { color: gradientForeground },
  metricLabel: { color: gradientForegroundMuted },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: space.md,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  dismiss: { padding: space.xs },

  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: space.md,
  },
  infoAction: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: space.sm },
});

export default Banner;
