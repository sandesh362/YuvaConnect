import React from "react";
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
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { color } from "@/theme/colors";
import { floatingActionBottom, tabBarHeight } from "@/theme/layout-metrics";
import { radius, shadow } from "@/theme/radius";
import { layout, space } from "@/theme/spacing";
import type { IconName } from "@/theme/icons";
import { Icon } from "./Icon";
import { Text } from "./Text";

export type ScreenProps = {
  children?: React.ReactNode;
  tone?: "sunken" | "surface";
  gutter?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  constrain?: boolean;
  includeBottomInset?: boolean;
  testID?: string;
};

/**
 * Screen scaffold — the single wrapper every route renders into.
 *
 * Layout contract, kept deliberately small so screens cannot disagree about it:
 * - SafeAreaView with top/left/right edges; bottom inset is added only when
 *   `includeBottomInset` is set (routes inside the tab layout get the bottom
 *   inset from the tab bar itself, so adding it here would double-pad).
 * - The scrollable body is not owned here: each screen decides between
 *   ScrollView / FlatList and passes the shared `contentBottom` token into its
 *   `contentContainerStyle`, so tab-bar + FAB clearance stays in one place.
 * - `gutter` applies the 16px horizontal grid token; screens that render edge-
 *   to-edge rails leave it off and gutter their own children instead.
 * - `constrain` caps line length on tablets/web with the same max width token.
 *
 * Keyboard: this scaffold intentionally does NOT wrap children in a
 * KeyboardAvoidingView. The six screens that own a text field (login, signup,
 * post-gig, chat, location, search) wrap their own body instead, so exactly one
 * KAV exists per screen and its offset is computed from the measured top inset
 * rather than guessed.
 */ export function Screen({
  children,
  tone = "sunken",
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
      edges={[
        "top",
        "left",
        "right",
        ...(includeBottomInset ? (["bottom"] as const) : []),
      ]}
      style={[
        styles.root,
        {
          backgroundColor: tone === "sunken" ? color.background : color.surface,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.inner,
          gutter && styles.gutter,
          constrain && styles.constrain,
          contentStyle,
          includeBottomInset && {
            paddingBottom: Math.max(insets.bottom, space.sm),
          },
        ]}
      >
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
  keyboardShouldPersistTaps?: "never" | "always" | "handled";
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
  keyboardShouldPersistTaps = "handled",
  showsVerticalScrollIndicator = false,
  includeBottomInset,
  keyboardVerticalOffset = 0,
  ...screen
}: ScrollScreenProps) {
  const insets = useSafeAreaInsets();
  const effectiveBottom =
    bottomInset + (includeBottomInset ? Math.max(insets.bottom, 0) : 0);
  return (
    <Screen
      {...screen}
      includeBottomInset={includeBottomInset}
      contentStyle={styles.fill}
    >
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <ScrollView
          style={styles.fill}
          contentContainerStyle={[
            { flexGrow: 1, paddingBottom: effectiveBottom },
            contentContainerStyle,
          ]}
          refreshControl={refreshControl}
          onScroll={onScroll as never}
          scrollEventThrottle={scrollEventThrottle}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/**
 * Sticky bottom action bar.
 *
 * `aboveTabBar` lifts it to sit on top of the bottom navigation instead of
 * beneath it — without this, a screen that had both a tab bar and an action bar
 * drew the action bar under the navigation, hiding the primary CTA entirely.
 */
export function BottomActionBar({
  children,
  aboveTabBar = false,
  style,
}: {
  children?: React.ReactNode;
  aboveTabBar?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);
  return (
    <View
      style={[
        styles.actionBar,
        aboveTabBar
          ? { bottom: tabBarHeight(bottomInset), paddingBottom: space.md }
          : { paddingBottom: Math.max(bottomInset, space.md) },
        style,
      ]}
    >
      <View style={styles.actionBarInner}>{children}</View>
    </View>
  );
}

/**
 * Floating action button.
 *
 * Positioning is derived from the tab-bar metrics, never a magic `bottom: 96`,
 * so the FAB can never land on the navigation bar or its labels, and it keeps a
 * predictable gap on devices with (and without) a home indicator.
 */
export function Fab({
  label,
  icon = "add",
  onPress,
  accessibilityLabel,
  style,
  testID,
}: {
  label: string;
  icon?: IconName;
  onPress: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.fab,
        { bottom: floatingActionBottom(Math.max(insets.bottom, 0)) },
        pressed && styles.fabPressed,
        style,
      ]}
    >
      <Icon name={icon} size={20} color={color.primaryOnSolid} />
      <Text variant="buttonSm" style={styles.fabLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
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
          style={({ pressed }) => [
            styles.sectionAction,
            pressed && { opacity: 0.6 },
          ]}
        >
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
  inner: { flex: 1, flexDirection: "column" },
  fill: { flex: 1 },
  gutter: { paddingHorizontal: layout.screenGutter },
  constrain: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
  },
  actionBar: {
    position: "absolute",
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
    minHeight: layout.tapTarget,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: layout.screenGutter,
    paddingTop: space.md,
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
  },
  fab: {
    position: "absolute",
    right: layout.screenGutter,
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    minHeight: layout.tapTarget + 4,
    backgroundColor: color.primary,
    borderRadius: radius.full,
    paddingHorizontal: space.lg,
    ...shadow.primary,
    zIndex: 8,
    elevation: 8,
  },
  fabPressed: { backgroundColor: color.primaryPressed, opacity: 0.95 },
  fabLabel: { color: color.primaryOnSolid },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: space.lg,
    marginBottom: space.md,
    gap: space.sm,
  },
  sectionTitle: { flex: 1 },
  sectionAction: {
    minHeight: layout.tapTarget,
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
});

export default Screen;
