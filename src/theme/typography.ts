// ============================================================
// YuvaConnect Design System — Typography Tokens
// ------------------------------------------------------------
// A modular scale derived from the wireframes: heavy (700/800)
// display + title weights for headings and prices, semibold (600)
// for card titles and labels, regular (400) for body copy, and a
// medium (500) caption tier for metadata.
//
// Use the `<Text variant="...">` component rather than these
// objects directly wherever possible.
// ============================================================

import { Platform, type TextStyle } from 'react-native';

/**
 * Font stacks. No custom font file ships with the app today, so these
 * resolve to the platform system face. Swap `family.regular` / `family.medium`
 * for a loaded font name (e.g. 'Inter_400Regular') in one place if the
 * wireframes call for a specific typeface — every component updates at once.
 */
export const family = {
  regular: Platform.select({ ios: 'System', android: 'sans-serif', web: 'Inter, system-ui, sans-serif', default: 'System' }),
  medium: Platform.select({ ios: 'System', android: 'sans-serif-medium', web: 'Inter, system-ui, sans-serif', default: 'System' }),
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', web: 'ui-monospace, monospace', default: 'monospace' }),
} as const;

export const fontSize = {
  micro: 10,
  caption: 12,
  label: 13,
  callout: 14,
  body: 15,
  md: 16,
  heading: 18,
  title3: 20,
  title2: 24,
  title1: 28,
  display: 32,
} as const;

export type FontSizeToken = keyof typeof fontSize;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

type Variant = {
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
  letterSpacing?: number;
  fontFamily?: string;
};

/**
 * The type scale. Each entry is a complete `TextStyle` so it can be spread
 * straight into a `StyleSheet` or a `style` array.
 */
export const typography = {
  /** Largest — screen-level hero numbers (earnings total). */
  display: { fontSize: fontSize.display, lineHeight: 40, fontWeight: fontWeight.extrabold, letterSpacing: -0.6, fontFamily: family.medium },
  /** Screen title on a dashboard ("Student Home"). */
  title1: { fontSize: fontSize.title1, lineHeight: 34, fontWeight: fontWeight.extrabold, letterSpacing: -0.4, fontFamily: family.medium },
  /** Section title / large card heading. */
  title2: { fontSize: fontSize.title2, lineHeight: 30, fontWeight: fontWeight.bold, letterSpacing: -0.3, fontFamily: family.medium },
  /** Card title, screen header title. */
  title3: { fontSize: fontSize.title3, lineHeight: 26, fontWeight: fontWeight.bold, fontFamily: family.medium },
  /** Sub-section heading, list row title. */
  heading: { fontSize: fontSize.heading, lineHeight: 24, fontWeight: fontWeight.semibold, fontFamily: family.medium },
  /** Bold large price on a GigCard / detail screen. */
  price: { fontSize: fontSize.title3, lineHeight: 26, fontWeight: fontWeight.extrabold, fontFamily: family.medium },
  /** Stat-box value (Budget, Duration, Location, Deadline). */
  statValue: { fontSize: fontSize.md, lineHeight: 20, fontWeight: fontWeight.bold, fontFamily: family.medium },
  /** Default reading text. */
  body: { fontSize: fontSize.body, lineHeight: 22, fontWeight: fontWeight.regular, fontFamily: family.regular },
  bodyStrong: { fontSize: fontSize.body, lineHeight: 22, fontWeight: fontWeight.semibold, fontFamily: family.medium },
  /** Slightly smaller body — dense cards. */
  callout: { fontSize: fontSize.callout, lineHeight: 20, fontWeight: fontWeight.regular, fontFamily: family.regular },
  calloutStrong: { fontSize: fontSize.callout, lineHeight: 20, fontWeight: fontWeight.semibold, fontFamily: family.medium },
  /** Field labels, chip labels, button labels. */
  label: { fontSize: fontSize.label, lineHeight: 18, fontWeight: fontWeight.semibold, fontFamily: family.medium },
  /** Metadata: duration, distance, timestamps. */
  caption: { fontSize: fontSize.caption, lineHeight: 16, fontWeight: fontWeight.medium, fontFamily: family.medium },
  captionStrong: { fontSize: fontSize.caption, lineHeight: 16, fontWeight: fontWeight.bold, fontFamily: family.medium },
  /** Eyebrow / overline — always uppercase. */
  overline: { fontSize: fontSize.micro, lineHeight: 14, fontWeight: fontWeight.bold, letterSpacing: 0.8, fontFamily: family.medium },
  /** Button text. */
  button: { fontSize: fontSize.md, lineHeight: 20, fontWeight: fontWeight.bold, fontFamily: family.medium },
  buttonSm: { fontSize: fontSize.callout, lineHeight: 18, fontWeight: fontWeight.bold, fontFamily: family.medium },
} as const satisfies Record<string, Variant>;

export type TypographyVariant = keyof typeof typography;
