import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { IconName } from '@/theme/icons';
import { Button, PrimaryButton, SecondaryButton } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

// ------------------------------------------------------------
// Empty state
// ------------------------------------------------------------

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: IconName;
  tone?: 'neutral' | 'brand' | 'success' | 'warning';
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Fill the available height and centre (list placeholders). */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const EMPTY_TONES: Record<NonNullable<EmptyStateProps['tone']>, { well: string; fg: string }> = {
  neutral: { well: color.surfaceMuted, fg: color.textTertiary },
  brand: { well: color.primarySoft, fg: color.primary },
  success: { well: color.successSoft, fg: color.success },
  warning: { well: color.warningSoft, fg: color.warningStrong },
};

/**
 * Reference empty state: tinted circular icon well · bold title · one line of
 * guidance · optional primary + secondary action. Copy should always tell the
 * user the next step, never just say "Nothing here".
 */
export function EmptyState({
  title,
  description,
  icon = 'inbox',
  tone = 'neutral',
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  fill = true,
  style,
  testID,
}: EmptyStateProps) {
  const skin = EMPTY_TONES[tone];
  return (
    <View testID={testID} style={[styles.state, fill && styles.fill, style]}>
      <View style={[styles.well, { backgroundColor: skin.well }]}>
        <Icon name={icon} size={30} color={skin.fg} />
      </View>
      <Text variant="title3" style={styles.stateTitle}>
        {title}
      </Text>
      {description ? (
        <Text variant="callout" tone="secondary" style={styles.stateDescription}>
          {description}
        </Text>
      ) : null}
      {primaryLabel && onPrimary ? (
        <View style={styles.stateActions}>
          <PrimaryButton label={primaryLabel} onPress={onPrimary} fullWidth={false} style={styles.stateButton} />
          {secondaryLabel && onSecondary ? (
            <SecondaryButton label={secondaryLabel} onPress={onSecondary} fullWidth={false} style={styles.stateButton} />
          ) : null}
        </View>
      ) : secondaryLabel && onSecondary ? (
        <View style={styles.stateActions}>
          <SecondaryButton label={secondaryLabel} onPress={onSecondary} fullWidth={false} style={styles.stateButton} />
        </View>
      ) : null}
    </View>
  );
}

// ------------------------------------------------------------
// Error state
// ------------------------------------------------------------

export type ErrorStateProps = {
  title?: string;
  description?: string;
  /** Retry handler. Omit for fatal errors (e.g. session expired). */
  onRetry?: () => void;
  retryLabel?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /**
   * `card` renders inline inside a list (a failed section);
   * `screen` fills the viewport.
   */
  variant?: 'card' | 'screen';
  /** Set false when embedding a `screen` variant inside a card/preview. */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Reference error state: red-tinted card, offline glyph, explicit Retry. */
export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this right now. Check your connection and try again.',
  onRetry,
  retryLabel = 'Try again',
  secondaryLabel,
  onSecondary,
  variant = 'card',
  fill = true,
  style,
  testID,
}: ErrorStateProps) {
  if (variant === 'screen') {
    return (
      <View testID={testID} style={[styles.state, fill && styles.fill, style]}>
        <View style={[styles.well, { backgroundColor: color.dangerSoft }]}>
          <Icon name="offline" size={30} color={color.danger} />
        </View>
        <Text variant="title3" style={styles.stateTitle}>
          {title}
        </Text>
        <Text variant="callout" tone="secondary" style={styles.stateDescription}>
          {description}
        </Text>
        <View style={styles.stateActions}>
          {onRetry ? <PrimaryButton label={retryLabel} onPress={onRetry} icon="refresh" fullWidth={false} style={styles.stateButton} /> : null}
          {secondaryLabel && onSecondary ? (
            <SecondaryButton label={secondaryLabel} onPress={onSecondary} fullWidth={false} style={styles.stateButton} />
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View testID={testID} style={[styles.errorCard, style]}>
      <View style={[styles.wellSm, { backgroundColor: color.dangerSoft }]}>
        <Icon name="offline" size={18} color={color.danger} />
      </View>
      <View style={styles.body}>
        <Text variant="calloutStrong">{title}</Text>
        <Text variant="caption" tone="secondary" style={{ marginTop: 2 }}>
          {description}
        </Text>
      </View>
      {onRetry ? (
        <Button label={retryLabel} onPress={onRetry} variant="ghost" size="sm" fullWidth={false} />
      ) : null}
    </View>
  );
}

// ------------------------------------------------------------
// Success / confirmation state
// ------------------------------------------------------------

export type SuccessStateProps = {
  title: string;
  description?: string;
  icon?: IconName;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  /** Set false when embedding inside a card/preview. */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Full-screen confirmation (application sent, gig published, payment released). */
export function SuccessState({
  title,
  description,
  icon = 'checkCircleFilled',
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  fill = true,
  style,
  testID,
}: SuccessStateProps) {
  return (
    <View testID={testID} style={[styles.state, fill && styles.fill, style]}>
      <View style={[styles.well, { backgroundColor: color.successSoft }]}>
        <Icon name={icon} size={34} color={color.success} />
      </View>
      <Text variant="title2" style={styles.stateTitle}>
        {title}
      </Text>
      {description ? (
        <Text variant="callout" tone="secondary" style={styles.stateDescription}>
          {description}
        </Text>
      ) : null}
      <View style={styles.stateActions}>
        {primaryLabel && onPrimary ? (
          <PrimaryButton label={primaryLabel} onPress={onPrimary} fullWidth={false} style={styles.stateButton} />
        ) : null}
        {secondaryLabel && onSecondary ? (
          <SecondaryButton label={secondaryLabel} onPress={onSecondary} fullWidth={false} style={styles.stateButton} />
        ) : null}
      </View>
    </View>
  );
}

// ------------------------------------------------------------
// Loading skeletons
// ------------------------------------------------------------

/** One pulsing block. Compose freely for bespoke skeletons. */
export function Skeleton({
  width,
  height = 12,
  radius: r = 'sm',
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  radius?: keyof typeof radius;
  style?: StyleProp<ViewStyle>;
}) {
  const pulse = usePulse();
  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as never, height, borderRadius: radius[r] },
        { opacity: pulse },
        style,
      ]}
    />
  );
}

/** Shared 1.1s opacity pulse so every skeleton in the app breathes in sync. */
function usePulse() {
  const value = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, { toValue: 1, duration: 550, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(value, { toValue: 0.45, duration: 550, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [value]);
  return value;
}

/** Card-shaped skeleton matching GigCard's exact block rhythm. */
export function GigCardSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonRow}>
        <Skeleton width={layout.gigIconSize} height={layout.gigIconSize} radius="md" />
        <View style={styles.skeletonStack}>
          <Skeleton width="42%" height={10} />
          <Skeleton width="88%" height={14} />
        </View>
      </View>
      <View style={styles.skeletonRow}>
        <Skeleton width={86} height={20} radius="full" />
        <Skeleton width={64} height={20} radius="full" />
      </View>
      <View style={styles.skeletonDivider} />
      <View style={styles.skeletonFooter}>
        <Skeleton width={72} height={16} />
        <Skeleton width={96} height={12} />
      </View>
    </View>
  );
}

/** List of `count` card skeletons — the default loading state for gig feeds. */
export function LoadingSkeleton({ count = 3, variant = 'card' }: { count?: number; variant?: 'card' | 'row' | 'stat' }) {
  return (
    <View style={styles.skeletonList}>
      {Array.from({ length: count }).map((_, index) =>
        variant === 'card' ? (
          <GigCardSkeleton key={index} />
        ) : variant === 'row' ? (
          <View key={index} style={styles.skeletonRowItem}>
            <Skeleton width={layout.avatarMd} height={layout.avatarMd} radius="full" />
            <View style={styles.skeletonStack}>
              <Skeleton width="55%" height={12} />
              <Skeleton width="32%" height={10} />
            </View>
          </View>
        ) : (
          <View key={index} style={styles.skeletonRowItem}>
            <Skeleton width="48%" height={62} radius="md" />
            <Skeleton width="48%" height={62} radius="md" />
          </View>
        ),
      )}
    </View>
  );
}

/** Inline spinner row for pagination / background refresh. */
export function InlineLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.inlineLoader} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="small" color={color.primary} />
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  state: { alignItems: 'center', paddingHorizontal: space['2xl'], paddingVertical: space['3xl'], gap: space.sm },
  fill: { flex: 1, justifyContent: 'center' },
  well: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  wellSm: { width: 34, height: 34, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  stateTitle: { textAlign: 'center' },
  stateDescription: { textAlign: 'center', marginTop: space.xs, lineHeight: 20 },
  stateActions: { marginTop: space.lg, gap: space.md, alignItems: 'stretch', width: '100%', maxWidth: 320 },
  stateButton: { width: '100%' },

  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.dangerBorder,
    backgroundColor: color.dangerSoft,
    marginBottom: space.md,
  },
  body: { flex: 1 },

  skeleton: { backgroundColor: color.skeletonBase },
  skeletonList: { gap: space.md },
  skeletonCard: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    padding: layout.cardPadding,
    gap: space.md,
  },
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  skeletonStack: { flex: 1, gap: space.sm },
  skeletonDivider: { height: 1, backgroundColor: color.divider },
  skeletonFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skeletonRowItem: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  inlineLoader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingVertical: space.base },
});

export default EmptyState;
