// ============================================================
// YuvaConnect Design System — Public Entry Point
// ------------------------------------------------------------
//   import { color, space, radius, typography, shadow } from '@/theme';
//   import { Icon, iconName } from '@/theme';
//
// Nothing outside `src/theme` should hardcode a hex value, a font
// size, a padding literal, or an icon-family glyph name.
// ============================================================

export {
  // raw ramps (use sparingly — prefer `color.*` aliases)
  blue,
  indigo,
  slate,
  emerald,
  amber,
  red,
  violet,
  cyan,
  // semantic
  color,
  avatarTint,
  tint,
  initialsOf,
} from './colors';
export type { ColorToken } from './colors';

export { space, layout } from './spacing';
export type { SpaceToken, LayoutToken } from './spacing';

export { family, fontSize, fontWeight, typography } from './typography';
export type { FontSizeToken, TypographyVariant } from './typography';

export { radius, shadow } from './radius';
export type { RadiusToken, ShadowToken } from './radius';

export { gradient, gradientForeground, gradientForegroundMuted } from './gradients';
export type { Gradient, GradientToken } from './gradients';

export { icons } from './icons';
export type { IconName, IconGlyph } from './icons';

// ------------------------------------------------------------
// Convenience aggregate for prop-drilling a theme object.
// ------------------------------------------------------------
import { color } from './colors';
import { space, layout } from './spacing';
import { typography } from './typography';
import { radius, shadow } from './radius';
import { gradient } from './gradients';

export const theme = { color, space, layout, typography, radius, shadow, gradient } as const;
export type Theme = typeof theme;
