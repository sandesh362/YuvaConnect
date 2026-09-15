import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color } from '@/theme/colors';
import { TAB_BAR_CONTENT_HEIGHT } from '@/theme/layout-metrics';
import { radius, shadow } from '@/theme/radius';
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
 * The one bottom navigation bar.
 *
 * Layout contract — this is what keeps five labels from colliding:
 *   • bar  — pinned to the bottom, full width, owns the bottom safe-area inset.
 *   • row  — a single flex row of exactly `items.length` equal columns. Every tab
 *            is `flexBasis: 0` + `minWidth: 0`, so the available width is divided
 *            equally and a long label can never push its neighbours around.
 *   • tab  — one independent ≥44pt box per item: icon stacked over label, both
 *            centred, label clamped to one line so it truncates instead of
 *            overlapping the adjacent tab.
 *
 * The label is deliberately NOT shrunk to a sub-legible size to force five items
 * to fit — the row simply gives each item an equal share of the width.
 */
export function BottomTabBar({ items, activeKey, onSelect, style, testID }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, space.sm);

  return (
    <View testID={testID} accessibilityRole="tablist" style={[styles.bar, { paddingBottom: bottomPad }, style]}>
      <View style={[styles.row, { height: TAB_BAR_CONTENT_HEIGHT }]}>
        {items.map((item) => {
          const active = item.key === activeKey;
          const badgeCount = item.badge && item.badge > 0 ? item.badge : 0;
          const label = item.accessibilityLabel ?? (badgeCount ? `${item.label}, ${badgeCount} unread` : item.label);
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(item.key)}
              style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}>
              <View style={styles.iconWrap}>
                <Icon
                  name={active ? item.activeIcon : item.icon}
                  size={active ? 23 : 22}
                  color={active ? color.primary : color.iconMuted}
                />
                {badgeCount ? <Badge count={badgeCount} /> : null}
                {!badgeCount && item.showDot ? <View style={styles.dot} /> : null}
              </View>
              <Text
                variant="caption"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[styles.label, { color: active ? color.primary : color.textSecondary }, active && styles.labelActive]}>
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
      <Text variant="overline" style={styles.badgeText}>
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: color.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.borderSubtle,
    ...shadow.lg,
    zIndex: 10,
    elevation: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: space['2xs'],
  },
  tab: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    minHeight: layout.tapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space['2xs'],
    gap: 3,
    borderRadius: radius.sm,
  },
  tabPressed: { backgroundColor: color.surfaceMuted, opacity: 0.9 },
  iconWrap: { position: 'relative', width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  label: {
    alignSelf: 'stretch',
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0,
    fontWeight: '500',
  },
  labelActive: { fontWeight: '700' },
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
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: color.danger,
    borderWidth: 1.5,
    borderColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: color.textInverse, fontSize: 9, lineHeight: 12, letterSpacing: 0, fontWeight: '700' },
  dot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.danger,
    borderWidth: 1.5,
    borderColor: color.surface,
  },
});

export default BottomTabBar;
