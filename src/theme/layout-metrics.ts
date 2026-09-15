// ============================================================
// YuvaConnect Design System — Bottom chrome metrics
// ------------------------------------------------------------
// ONE source of truth for:
//   • bottom tab bar height          (incl. home-indicator inset)
//   • sticky bottom action bar height
//   • floating action button offset
//   • the bottom clearance every scrolling screen needs
//
// The tab bar and the action bar are absolutely positioned overlays, so every
// scrolling screen has to reserve room for them. Previously each screen invented
// its own number (`paddingBottom: 120`, `160`, `96` in 38 places), which is why
// content kept ending up behind the navigation. Chrome components and screens
// now both read these helpers, so the two can never drift apart again.
// ============================================================

import { layout, space } from '@/theme/spacing';

/** Tab bar height above the safe-area inset. */
export const TAB_BAR_CONTENT_HEIGHT = layout.tabBarHeight;
/** Sticky action bar: 12px top padding + 48px control row, above the inset. */
export const ACTION_BAR_CONTENT_HEIGHT = 60;
/** Smallest bottom padding used when there is no home indicator / nav bar. */
export const MIN_BOTTOM_PADDING = space.sm;

export type BottomChrome = 'tabbar' | 'actionbar' | 'both' | 'none';

/** Height of the shared <Fab/> (44pt tap target + 4pt optical padding). */
export const FAB_HEIGHT = layout.tapTarget + 4;

/** Height of the tab bar including the device's bottom inset. */
export function tabBarHeight(bottomInset: number): number {
  return TAB_BAR_CONTENT_HEIGHT + Math.max(bottomInset, MIN_BOTTOM_PADDING);
}

/** Height of the sticky action bar including the device's bottom inset. */
export function actionBarHeight(bottomInset: number): number {
  return ACTION_BAR_CONTENT_HEIGHT + Math.max(bottomInset, MIN_BOTTOM_PADDING);
}

/** Bottom padding a scrolling screen must apply so its last item clears chrome. */
export function contentBottomInset(bottomInset: number, chrome: BottomChrome = 'tabbar'): number {
  if (chrome === 'none') return Math.max(bottomInset, 0) + space.xl;
  const height =
    chrome === 'actionbar'
      ? actionBarHeight(bottomInset)
      : chrome === 'both'
        ? tabBarHeight(bottomInset) + ACTION_BAR_CONTENT_HEIGHT
        : tabBarHeight(bottomInset);
  // `space.lg` of breathing room so the final card never kisses the bar.
  return height + space.lg;
}

/**
 * Bottom padding for a screen that also floats a `<Fab/>`. The FAB is pinned
 * above the tab bar, so a scrolling list needs the FAB's own height on top of
 * the normal clearance — otherwise the last card sits *under* the button.
 */
export function fabContentInset(bottomInset: number): number {
  return contentBottomInset(bottomInset, 'tabbar') + FAB_HEIGHT + space.md;
}

/**
 * Offset for a floating action button so it always floats *above* the tab bar
 * with a predictable gap — never on top of it, never over the tab labels.
 */
export function floatingActionBottom(bottomInset: number): number {
  return tabBarHeight(bottomInset) + space.md;
}
