import React from 'react';
import {
  KeyboardAvoidingView,
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
  tone?: 'sunken' | 'surface';
  gutter?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  constrain?: boolean;
  includeBottomInset?: boolean;
  testID?: string;
};

/**
 * PERFECT FIX — Screen scaffold
 * - NO KeyboardAvoidingView (individual screens handle KAV)
 * - inner: flex:1, flexDirection:'column'
 * - gutter: paddingHorizontal = screenGutter (16) not 0
 * - constrain: width 100%, maxWidth 640, alignSelf center
 * - defaults: gutter=false, constrain=false — screens control own padding via contentContainerStyle
 * - SafeAreaView edges top/left/right, bottom only if includeBottomInset
 */
export function Screen({
  children,
  tone = 'sunken',
  gutter = false,
  style,
  contentStyle,
  constrain = false,
  includeBottomInset = false,
  testID,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView
      testID={testID}
      edges={['top', 'left', 'right', ...(includeBottomInset ? (['bottom'] as const) : [])]}
      style={[styles.root, { backgroundColor: tone === 'sunken' ? color.background : color.surface }, style]}>
      <View
        style={[
          styles.inner,
          gutter && styles.gutter,
          constrain && styles.constrain,
          contentStyle,
          includeBottomInset && { paddingBottom: Math.max(insets.bottom, space.sm) },
        ]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

export type ScrollScreenProps = ScreenProps & {
  bottomInset?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onScroll?: (event: { nativeEvent: { contentOffset: { y: number } } }) => void;
  scrollEventThrottle?: number;
  keyboardShouldPersistTaps?: 'never' | 'always' | 'handled';
  showsVerticalScrollIndicator?: boolean;
  keyboardVerticalOffset?: number;
};

export function ScrollScreen({
  children,
  bottomInset = layout.tabBarHeight + space.xl + 24,
  contentContainerStyle,
  refreshControl,
  onScroll,
  scrollEventThrottle = 16,
  keyboardShouldPersistTaps = 'handled',
  showsVerticalScrollIndicator = false,
  includeBottomInset,
  keyboardVerticalOffset = 0,
  ...screen
}: ScrollScreenProps) {
  const insets = useSafeAreaInsets();
  const effectiveBottom = bottomInset + (includeBottomInset ? Math.max(insets.bottom, 0) : 0);
  return (
    <Screen {...screen} includeBottomInset={includeBottomInset} contentStyle={styles.fill}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardVerticalOffset}>
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[{ flexGrow: 1, paddingBottom: effectiveBottom }, contentContainerStyle]}
          refreshControl={refreshControl}
          onScroll={onScroll as never}
          scrollEventThrottle={scrollEventThrottle}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

export function BottomActionBar({ children, style }: { children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, space.md) }, style]}>
      <View style={styles.actionBarInner}>{children}</View>
    </View>
  );
}

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
  inner: { flex: 1, flexDirection: 'column' },
  fill: { flex: 1 },
  gutter: { paddingHorizontal: layout.screenGutter },
  constrain: { width: '100%', maxWidth: layout.maxContentWidth, alignSelf: 'center' },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: color.surface,
    borderTopWidth: 1,
    borderTopColor: color.borderSubtle,
    ...shadow.lg,
    zIndex: 9,
    elevation: 9,
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
