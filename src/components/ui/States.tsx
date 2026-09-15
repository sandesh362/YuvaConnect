import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { IconName } from '@/theme/icons';
import { Button, PrimaryButton, SecondaryButton, TextLink } from './Button';
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
  /**
   * The wireframe's empty states use an OUTLINE action ("Adjust Filters"),
   * not a filled one. `primary` stays the default for product screens that
   * need the emphasis.
   */
  primaryVariant?: 'primary' | 'outline';
  /** `lg` = 96dp icon well (System States reference), `md` = 68dp. */
  wellSize?: 'md' | 'lg';
  /** Fill the available height and centre (list placeholders). */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const EMPTY_TONES: Record<NonNullable<EmptyStateProps['tone']>, { well: string; fg: string }> = {
  // The wireframe's empty-state glyph is dark navy on a light well.
  neutral: { well: color.surfaceMuted, fg: color.textPrimary },
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
  primaryVariant = 'primary',
  wellSize = 'md',
  fill = true,
  style,
  testID,
}: EmptyStateProps) {
  const skin = EMPTY_TONES[tone];
  const Primary = primaryVariant === 'outline' ? SecondaryButton : PrimaryButton;
  return (
    <View testID={testID} style={[styles.state, fill && styles.fill, style]}>
      <View style={[styles.well, wellSize === 'lg' && styles.wellLg, { backgroundColor: skin.well }]}>
        <Icon name={icon} size={wellSize === 'lg' ? 40 : 30} color={skin.fg} />
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
          <Primary label={primaryLabel} onPress={onPrimary} fullWidth={false} style={styles.stateButton} />
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
      <View style={[styles.wellSq, { backgroundColor: color.dangerSoft }]}>
        <Icon name="offline" size={20} color={color.danger} />
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
  /** Render the secondary action as a bare text link ("Back to Home"). */
  secondaryAsLink?: boolean;
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
  secondaryAsLink = false,
  fill = true,
  style,
  testID,
}: SuccessStateProps) {
  return (
    <View testID={testID} style={[styles.state, fill && styles.fill, style]}>
      <View style={[styles.well, { backgroundColor: color.successSoft }]}>
        <Icon name={icon} size={40} color={color.textPrimary} />
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
        {secondaryLabel && onSecondary && !secondaryAsLink ? (
          <SecondaryButton label={secondaryLabel} onPress={onSecondary} fullWidth={false} style={styles.stateButton} />
        ) : null}
      </View>
      {secondaryLabel && onSecondary && secondaryAsLink ? (
        <TextLink label={secondaryLabel} iconRight={null} onPress={onSecondary} />
      ) : null}
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
  // `useState` with an initialiser keeps one Animated.Value for the lifetime of
  // the component without reading a ref during render (React 19 rule).
  const [value] = useState(() => new Animated.Value(0.45));
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
export function InlineLoader({ label = 'Loading…', align = 'center' }: { label?: string; align?: 'center' | 'split' }) {
  return (
    <View
      style={[styles.inlineLoader, align === 'split' && styles.inlineLoaderSplit]}
      accessibilityRole="progressbar"
      accessibilityLabel={label}>
      {align === 'split' ? (
        <Text variant="body" tone="secondary">
          {label}
        </Text>
      ) : (
        <ActivityIndicator size="small" color={color.primary} />
      )}
      {align === 'split' ? (
        <ActivityIndicator size="small" color={color.primary} />
      ) : (
        <Text variant="caption" tone="secondary">
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /**
   * `flexGrow` (NOT `flex: 1`) + `flexBasis: 'auto'` is intentional: these states
   * are rendered inside `ScrollView`s whose content container is `flexGrow: 1`.
   * `flex: 1` clamps the state to the viewport height, so a taller-than-viewport
   * empty/error state overflowed *downwards* and buried its own CTA under the
   * bottom navigation. With `flexGrow` the box still fills the viewport when it
   * has room to, but grows past it (and scrolls) when the content needs more.
   */
  state: { alignItems: 'center', paddingHorizontal: space.xl, paddingVertical: space.xl, gap: space.sm },
  fill: { flexGrow: 1, flexBasis: 'auto', justifyContent: 'center' },
  well: {
    width: 68,
    height: 68,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  wellLg: { width: 96, height: 96 },
  wellSq: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  stateTitle: { textAlign: 'center' },
  stateDescription: { textAlign: 'center', marginTop: space.xs, lineHeight: 20, maxWidth: 320 },
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
    backgroundColor: color.surface,
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
  inlineLoaderSplit: { justifyContent: 'space-between', paddingHorizontal: space.xs },
});

export default EmptyState;
