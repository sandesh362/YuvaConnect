import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import { Icon } from './Icon';
import { Text } from './Text';

export type ScreenProps = {
  children?: React.ReactNode;
  /** `sunken` = app background gray; `surface` = white. */
  tone?: 'sunken' | 'surface';
  /** Apply the standard 16px horizontal gutter. */
  gutter?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  /** Centre + cap width on web/tablet so cards don't stretch full-bleed. */
  constrain?: boolean;
  testID?: string;
};

/**
 * Page scaffold: safe-area aware, correct background, standard gutter and
 * optional max-content-width for large screens. Every rebuilt screen wraps
 * its content in this so spacing is identical app-wide.
 */
export function Screen({
  children,
  tone = 'sunken',
  gutter = true,
  style,
  contentStyle,
  constrain = true,
  testID,
}: ScreenProps) {
  return (
    <SafeAreaView
      testID={testID}
      edges={['top', 'left', 'right']}
      style={[styles.root, { backgroundColor: tone === 'sunken' ? color.background : color.surface }, style]}>
      <View style={[styles.fill, gutter && styles.gutter, constrain && styles.constrain, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

export type ScrollScreenProps = ScreenProps & {
  /** Extra bottom padding so the last card clears the tab bar / action bar. */
  bottomInset?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onScroll?: (event: { nativeEvent: { contentOffset: { y: number } } }) => void;
  scrollEventThrottle?: number;
  keyboardShouldPersistTaps?: 'never' | 'always' | 'handled';
  showsVerticalScrollIndicator?: boolean;
};

/** `Screen` + vertical scrolling with tab-bar-aware bottom padding. */
export function ScrollScreen({
  children,
  bottomInset = layout.tabBarHeight + space.xl,
  contentContainerStyle,
  refreshControl,
  onScroll,
  scrollEventThrottle = 16,
  keyboardShouldPersistTaps = 'handled',
  showsVerticalScrollIndicator = false,
  ...screen
}: ScrollScreenProps) {
  return (
    <Screen {...screen}>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[{ paddingBottom: bottomInset }, contentContainerStyle]}
        refreshControl={refreshControl}
        onScroll={onScroll as never}
        scrollEventThrottle={scrollEventThrottle}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}>
        {children}
      </ScrollView>
    </Screen>
  );
}

/**
 * Sticky bottom action bar (Apply / Save / Confirm CTAs). Sits above the home
 * indicator with a top hairline and an upward shadow, per the wireframes.
 */
export function BottomActionBar({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, space.md) }, style]}>
      <View style={styles.actionBarInner}>{children}</View>
    </View>
  );
}

/** Eyebrow/overline label used above card groups ("RECOMMENDED FOR YOU"). */
export function SectionHeader({
  title,
  actionLabel,
  onAction,
  style,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <Text variant="heading" numberOfLines={1} style={styles.sectionTitle}>
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          hitSlop={6}
          style={({ pressed }) => [styles.sectionAction, pressed && { opacity: 0.6 }]}>
          <Text variant="label" tone="brand">
            {actionLabel}
          </Text>
          <Icon name="chevronRight" size={14} color={color.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fill: { flex: 1 },
  gutter: { paddingHorizontal: layout.screenGutter },
  // Caps line length on tablets/web; a no-op on phones where the gutter
  // already constrains the width.
  constrain: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center' },
  actionBar: {
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.borderSubtle,
    ...shadow.lg,
  },
  actionBarInner: {
    minHeight: layout.actionBarHeight - space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.md,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.lg,
    marginBottom: space.md,
    gap: space.sm,
  },
  sectionTitle: { flex: 1 },
  sectionAction: {
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});

export default Screen;
