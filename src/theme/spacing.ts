// ============================================================
// YuvaConnect Design System — Spacing & Layout Tokens
// ------------------------------------------------------------
// 4pt base grid. Use `space.*` for padding/margin/gap and
// `layout.*` for fixed chrome dimensions.
// ============================================================

export const space = {
  /** 0 */
  none: 0,
  /** 2 */
  '2xs': 2,
  /** 4 */
  xs: 4,
  /** 8 */
  sm: 8,
  /** 12 */
  md: 12,
  /** 16 — the workhorse: card padding, screen gutter */
  base: 16,
  /** 20 */
  lg: 20,
  /** 24 */
  xl: 24,
  /** 32 */
  '2xl': 32,
  /** 40 */
  '3xl': 40,
  /** 48 */
  '4xl': 48,
  /** 64 */
  '5xl': 64,
} as const;

export type SpaceToken = keyof typeof space;

export const layout = {
  /** Horizontal gutter on every screen. */
  screenGutter: space.base,
  /** Internal padding of a standard card. */
  cardPadding: space.base,
  /** Padding of a compact/dense card (list rows, stat boxes). */
  cardPaddingCompact: space.md,
  /** Vertical rhythm between stacked cards/sections. */
  sectionGap: space.lg,
  /** Vertical rhythm between items inside a section. */
  itemGap: space.md,
  /** Gap between a label and its control. */
  labelGap: 6,

  /** App bar / screen header height (excludes status bar). */
  headerHeight: 56,
  /** Bottom tab bar height (excludes home-indicator inset). */
  tabBarHeight: 60,
  /** Sticky bottom action bar height (excludes inset). */
  actionBarHeight: 72,
  /** Minimum tap target — WCAG / Material. */
  tapTarget: 44,

  /** Squared business/gig icon on a GigCard. */
  gigIconSize: 44,
  /** Avatar sizes. */
  avatarXs: 24,
  avatarSm: 32,
  avatarMd: 40,
  avatarLg: 56,
  avatarXl: 80,

  /** Stat-box icon chip. */
  statIconSize: 34,

  /** Control heights. */
  controlSm: 36,
  controlMd: 44,
  controlLg: 52,

  /** Cap content width so tablet/web doesn't stretch cards full-bleed. */
  maxContentWidth: 640,
} as const;

export type LayoutToken = keyof typeof layout;
