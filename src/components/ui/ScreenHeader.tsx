import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color } from '@/theme/colors';
import { shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { IconName } from '@/theme/icons';
import { Icon, IconButton } from './Icon';
import { Text } from './Text';

export type HeaderAction = {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  /** Red unread dot. */
  showDot?: boolean;
  /** Unread count bubble instead of a dot. */
  count?: number;
};

export type ScreenHeaderProps = {
  title: string;
  /** Small line under the title ("Koramangala, Bengaluru"). */
  subtitle?: string;
  /** Back arrow. Pass `onBack` to show it; omit on root tabs. */
  onBack?: () => void;
  actions?: HeaderAction[];
  /** Trailing custom node (avatar, switch) — rendered after `actions`. */
  trailing?: React.ReactNode;
  /** `transparent` floats over scrolling content; `solid` is a white bar. */
  variant?: 'solid' | 'transparent';
  /** Optional brand-tinted left icon, used on dashboards. */
  leadingIcon?: IconName;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * App bar: back arrow (left) · title · contextual icons (right).
 * Height and hairline are identical on every screen.
 */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  actions = [],
  trailing,
  variant = 'solid',
  leadingIcon,
  style,
  testID,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const solid = variant === 'solid';

  return (
    <View
      testID={testID}
      style={[
        styles.root,
        { paddingTop: insets.top + space.sm },
        solid && styles.solid,
        style,
      ]}>
      <View style={styles.row}>
        <View style={styles.leading}>
          {onBack ? (
            <IconButton name="arrowBack" accessibilityLabel="Go back" onPress={onBack} variant={solid ? 'plain' : 'soft'} />
          ) : leadingIcon ? (
            <Icon name={leadingIcon} size={22} color={color.primary} />
          ) : null}
        </View>

        <View style={styles.titles}>
          <Text variant={subtitle ? 'title3' : 'heading'} numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" tone="secondary" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.trailing}>
          {actions.map((action) => (
            <View key={action.accessibilityLabel} style={styles.actionWrap}>
              <IconButton
                name={action.icon}
                accessibilityLabel={action.accessibilityLabel}
                onPress={action.onPress}
                showDot={action.showDot}
                variant={solid ? 'plain' : 'soft'}
              />
              {action.count && action.count > 0 ? <CountBubble count={action.count} /> : null}
            </View>
          ))}
          {trailing}
        </View>
      </View>
    </View>
  );
}

function CountBubble({ count }: { count: number }) {
  return (
    <View style={[styles.count, styles.nonInteractive]}>
      <Text variant="overline" style={{ color: color.textInverse, letterSpacing: 0 }}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

/**
 * Dashboard masthead: greeting + name + location, with the notification bell
 * on the right. Used instead of `ScreenHeader` on Home screens.
 */
export function DashboardHeader({
  greeting,
  name,
  location,
  actions = [],
  avatar,
  style,
}: {
  greeting: string;
  name: string;
  location?: string;
  actions?: HeaderAction[];
  avatar?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.dashboard, { paddingTop: insets.top + space.md }, style]}>
      <View style={styles.dashboardRow}>
        <View style={styles.dashboardText}>
          <Text variant="caption" tone="secondary" numberOfLines={1}>
            {greeting}
          </Text>
          <Text variant="title2" numberOfLines={1}>
            {name}
          </Text>
          {location ? (
            <View style={styles.locationRow}>
              <Icon name="mapPin" size={13} color={color.textSecondary} />
              <Text variant="caption" tone="secondary" numberOfLines={1}>
                {location}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={styles.trailing}>
          {actions.map((action) => (
            <View key={action.accessibilityLabel} style={styles.actionWrap}>
              <IconButton
                name={action.icon}
                accessibilityLabel={action.accessibilityLabel}
                onPress={action.onPress}
                showDot={action.showDot}
                variant="soft"
              />
              {action.count && action.count > 0 ? <CountBubble count={action.count} /> : null}
            </View>
          ))}
          {avatar}
        </View>
      </View>
    </View>
  );
}

/** Inline back+title bar for use inside a ScrollView (large-title screens). */
export function InlineBackBar({ onBack, label = 'Back' }: { onBack: () => void; label?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onBack}
      hitSlop={8}
      style={({ pressed }) => [styles.inlineBack, pressed && { opacity: 0.6 }]}>
      <Icon name="chevronLeft" size={20} color={color.textPrimary} />
      <Text variant="label">{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /** RN 0.86: pointer-events moved from a prop to a style. */
  nonInteractive: { pointerEvents: 'none' },

  root: {
    paddingHorizontal: layout.screenGutter,
    paddingBottom: space.md,
    backgroundColor: 'transparent',
  },
  solid: {
    backgroundColor: color.surface,
    borderBottomWidth: 1,
    borderBottomColor: color.borderSubtle,
    ...shadow.sm,
  },
  row: {
    minHeight: layout.headerHeight - space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  leading: { width: layout.tapTarget - 8, alignItems: 'flex-start' },
  titles: { flex: 1, justifyContent: 'center', gap: 1 },
  title: { textAlign: 'left' },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  actionWrap: { position: 'relative' },
  count: {
    position: 'absolute',
    top: 1,
    right: 0,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: color.danger,
    borderWidth: 2,
    borderColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dashboard: { paddingHorizontal: layout.screenGutter, paddingBottom: space.md },
  dashboardRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  dashboardText: { flex: 1, gap: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: 2 },
  inlineBack: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: space.xs, alignSelf: 'flex-start' },
});

export default ScreenHeader;
