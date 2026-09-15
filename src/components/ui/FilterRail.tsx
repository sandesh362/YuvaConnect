import React from 'react';
import { ScrollView, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { layout, space } from '@/theme/spacing';

export type FilterRailProps = {
  children: React.ReactNode;
  /** Horizontal padding of the rail contents (defaults to the screen gutter). */
  gutter?: number;
  contentStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
};

/**
 * A single-row horizontally-scrolling rail (filter chips, quick actions,
 * category chips).
 *
 * Why this exists as a component:
 *
 * React Native's `ScrollView` ships with a base style of
 * `{ flexGrow: 1, flexShrink: 1, flexDirection: 'column' }`. Inside a vertical
 * screen that also contains a `flex: 1` list, BOTH children grow — so a
 * horizontal chip rail silently swallowed ~400 of 844 available points,
 * leaving a huge dead gap under the chips and squeezing the real content into
 * the bottom of the screen (where the tab bar then covered it).
 *
 * `FilterRail` pins the cross-axis behaviour (`flexGrow: 0`) so the rail is
 * always exactly as tall as one row of chips, no matter where it is used.
 */
export function FilterRail({ children, gutter = layout.screenGutter, contentStyle, accessibilityLabel, testID }: FilterRailProps) {
  return (
    <ScrollView
      testID={testID}
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={accessibilityLabel}
      style={styles.rail}
      contentContainerStyle={[styles.content, { paddingHorizontal: gutter }, contentStyle]}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /** `flexGrow: 0` is the whole point — see the doc comment above. */
  rail: { flexGrow: 0, flexShrink: 0 },
  content: { alignItems: 'center', gap: space.sm, paddingVertical: space.md },
});

export default FilterRail;
