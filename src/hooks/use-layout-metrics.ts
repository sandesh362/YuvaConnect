import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  actionBarHeight,
  contentBottomInset,
  fabContentInset,
  floatingActionBottom,
  tabBarHeight,
  type BottomChrome,
} from '@/theme/layout-metrics';
import { space } from '@/theme/spacing';

/**
 * Per-screen layout metrics derived from the device safe-area insets.
 *
 * Use this instead of hardcoding `paddingBottom` / `bottom` values:
 *
 *   const { contentBottom } = useLayoutMetrics('tabbar');
 *   <ScrollView contentContainerStyle={[styles.content, { paddingBottom: contentBottom }]} />
 */
export function useLayoutMetrics(chrome: BottomChrome = 'tabbar') {
  const insets = useSafeAreaInsets();
  return useMemo(() => {
    const bottom = Math.max(insets.bottom, 0);
    return {
      insets,
      /** Height of the bottom tab bar incl. inset. */
      tabBarHeight: tabBarHeight(bottom),
      /** Height of the sticky action bar incl. inset. */
      actionBarHeight: actionBarHeight(bottom),
      /** Padding a scroll container needs so content clears the chrome. */
      contentBottom: contentBottomInset(bottom, chrome),
      /** Distance from the screen bottom for a FAB. */
      fabBottom: floatingActionBottom(bottom),
      /** Padding for a scrolling screen that also floats a FAB. */
      fabContentBottom: fabContentInset(bottom),
      /** Standard padding when there is no chrome at all. */
      plainBottom: Math.max(bottom, 0) + space.xl,
    };
  }, [insets, chrome]);
}

export default useLayoutMetrics;
