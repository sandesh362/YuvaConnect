import type { ViewStyle } from 'react-native';

// ============================================================
// YuvaConnect Design System — Radius & Elevation Tokens
// ============================================================

/**
 * Border radii. The wireframes use three tiers consistently:
 * `pill` for chips/badges/buttons, `lg`/`xl` for cards, `md` for
 * inset elements (inputs, stat boxes, icon wells).
 */
export const radius = {
  none: 0,
  /** 4 — tiny insets, progress track caps */
  xs: 4,
  /** 8 — icon wells, small chips */
  sm: 8,
  /** 12 — inputs, stat boxes, inner cards */
  md: 12,
  /** 16 — standard card */
  lg: 16,
  /** 20 — hero cards, banners, sheets */
  xl: 20,
  /** 24 — large promo cards */
  '2xl': 24,
  /** Fully round — pills, avatars, FABs */
  full: 999,
} as const;

export type RadiusToken = keyof typeof radius;

/**
 * Elevation ramp.
 *
 * Uses the RN 0.76+ cross-platform `boxShadow` prop (Expo SDK 57 / RN 0.86 is
 * new-architecture only, so this works on iOS, Android *and* web with one
 * declaration). The legacy `shadowColor`/`shadowOffset`/`shadowOpacity`/
 * `shadowRadius` and Android `elevation` props are deprecated on this SDK and
 * must not be reintroduced.
 *
 * Cards on the wireframes are deliberately *subtle* — a hairline border plus a
 * very soft shadow. Never stack more than one level per surface.
 */
const ink = (alpha: number) => `rgba(15, 23, 42, ${alpha})`;

export const shadow = {
  none: {} as ViewStyle,

  /** Card at rest. */
  sm: {
    boxShadow: [{ offsetX: 0, offsetY: 1, blurRadius: 2, color: ink(0.04) }],
  } as ViewStyle,

  /** Card with an action affordance / raised list row. */
  md: {
    boxShadow: [{ offsetX: 0, offsetY: 2, blurRadius: 8, color: ink(0.06) }],
  } as ViewStyle,

  /** Sticky header, bottom action bar, tab bar — shadow points upward. */
  lg: {
    boxShadow: [{ offsetX: 0, offsetY: -2, blurRadius: 12, color: ink(0.08) }],
  } as ViewStyle,

  /** FABs, modals, sheets. */
  xl: {
    boxShadow: [{ offsetX: 0, offsetY: 8, blurRadius: 24, color: ink(0.12) }],
  } as ViewStyle,

  /** Blue glow reserved for the primary CTA. */
  primary: {
    boxShadow: [{ offsetX: 0, offsetY: 6, blurRadius: 16, color: 'rgba(37, 99, 235, 0.28)' }],
  } as ViewStyle,

  /** Focus ring for inputs. */
  focus: {
    boxShadow: [{ offsetX: 0, offsetY: 0, blurRadius: 6, spreadDistance: 1, color: 'rgba(37, 99, 235, 0.22)' }],
  } as ViewStyle,

  /** Pressed-state lift for primary buttons. */
  pressed: {
    boxShadow: [{ offsetX: 0, offsetY: 2, blurRadius: 6, color: 'rgba(37, 99, 235, 0.20)' }],
  } as ViewStyle,
} as const;

export type ShadowToken = keyof typeof shadow;
