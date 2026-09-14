import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color } from '@/theme/colors';
import { shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { IconName } from '@/theme/icons';
import { Icon } from './Icon';
import { Text } from './Text';

export type TabItem = {
  key: string;
  label: string;
  icon: IconName;
  /** Filled variant used for the active tab. */
  activeIcon: IconName;
  /** Unread dot / count (Messages, Notifications). */
  badge?: number;
  showDot?: boolean;
  accessibilityLabel?: string;
};

export type BottomTabBarProps = {
  items: TabItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Bottom navigation: icon + label, 4-5 items, active tab in primary blue
 * with the filled glyph swap. Purely presentational so it can be handed to
 * expo-router's `<Tabs tabBar={...}>` without changing any route.
 */
export function BottomTabBar({ items, activeKey, onSelect, style, testID }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View testID={testID} style={[styles.bar, { paddingBottom: Math.max(insets.bottom, space.sm) }, style]}>
      <View style={styles.row}>
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityLabel={item.accessibilityLabel ?? item.label}
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(item.key)}
              style={({ pressed }) => [styles.tab, pressed && { opacity: 0.7 }]}>
              <View style={styles.iconWrap}>
                <Icon
                  name={active ? item.activeIcon : item.icon}
                  size={22}
                  color={active ? color.primary : color.iconMuted}
                />
                {item.badge && item.badge > 0 ? <Badge count={item.badge} /> : null}
                {!item.badge && item.showDot ? <View style={styles.dot} /> : null}
              </View>
              <Text
                variant="overline"
                uppercase={false}
                numberOfLines={1}
                style={[styles.label, { color: active ? color.primary : color.textSecondary, letterSpacing: 0, fontSize: 11 }]}>
                {item.label}
              </Text>
              {active ? <View style={styles.activeBar} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Badge({ count }: { count: number }) {
  return (
    <View style={[styles.badge, styles.nonInteractive]}>
      <Text variant="overline" style={{ color: color.textInverse, fontSize: 9, letterSpacing: 0 }}>
        {count > 9 ? '9+' : count}
      </Text>
    </View>
  );
}

/** Canonical 5-item student tab set. Business swaps in its own copy. */
export const STUDENT_TABS: TabItem[] = [
  { key: 'home', label: 'Home', icon: 'home', activeIcon: 'homeFilled' },
  { key: 'discover', label: 'Discover', icon: 'discover', activeIcon: 'discoverFilled' },
  { key: 'mygigs', label: 'My Gigs', icon: 'briefcase', activeIcon: 'briefcaseFilled' },
  { key: 'messages', label: 'Messages', icon: 'chat', activeIcon: 'chatFilled' },
  { key: 'profile', label: 'Profile', icon: 'person', activeIcon: 'personFilled' },
];

export const BUSINESS_TABS: TabItem[] = [
  { key: 'home', label: 'Home', icon: 'grid', activeIcon: 'gridFilled' },
  { key: 'gigs', label: 'My Gigs', icon: 'briefcase', activeIcon: 'briefcaseFilled' },
  { key: 'post', label: 'Post Gig', icon: 'addCircle', activeIcon: 'addCircleFilled' },
  { key: 'messages', label: 'Messages', icon: 'chat', activeIcon: 'chatFilled' },
  { key: 'profile', label: 'Profile', icon: 'person', activeIcon: 'personFilled' },
];

const styles = StyleSheet.create({
  /** RN 0.86: pointer-events moved from a prop to a style. */
  nonInteractive: { pointerEvents: 'none' },

  bar: {
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.borderSubtle,
    ...shadow.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: layout.tabBarHeight,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingTop: space.sm, position: 'relative' },
  iconWrap: { position: 'relative' },
  label: { textAlign: 'center' },
  activeBar: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: color.primary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 15,
    height: 15,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: color.danger,
    borderWidth: 1.5,
    borderColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: -1,
    right: -3,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: color.danger,
    borderWidth: 1.5,
    borderColor: color.surface,
  },
});

export default BottomTabBar;
