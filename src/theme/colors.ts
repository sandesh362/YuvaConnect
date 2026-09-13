// ============================================================
// YuvaConnect Design System — Color Tokens
// ------------------------------------------------------------
// Single source of truth for every colour in the app.
// Raw palettes (`blue`, `slate`, `emerald`, ...) are the paint;
// `color.*` semantic aliases are what components consume.
// Components must NEVER hardcode a hex value.
//
// `tailwind.config.js` reads this file, so NativeWind class names
// (bg-primary, text-ink, border-line ...) stay in lockstep with
// the StyleSheet tokens below.
// ============================================================

/** Primary brand blue — Tailwind `blue` ramp, 600 is the action colour. */
export const blue = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
} as const;

/** Indigo — used only as the gradient partner of `blue`. */
export const indigo = {
  50: '#EEF2FF',
  100: '#E0E7FF',
  300: '#A5B4FC',
  400: '#818CF8',
  500: '#6366F1',
  600: '#4F46E5',
  700: '#4338CA',
} as const;

/** Neutrals — Tailwind `slate` ramp. All surfaces, borders and text. */
export const slate = {
  0: '#FFFFFF',
  25: '#FCFDFE',
  50: '#F8FAFC',
  100: '#F1F5F9',
  150: '#EBF0F5',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
  950: '#020617',
} as const;

/** Success / verified / paid / completed. */
export const emerald = {
  50: '#ECFDF5',
  100: '#D1FAE5',
  200: '#A7F3D0',
  500: '#10B981',
  600: '#059669',
  700: '#047857',
  800: '#065F46',
  900: '#064E3B',
} as const;

/** Warning / pending / shortlisted / awaiting review. */
export const amber = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
} as const;

/** Error / rejected / revision requested / destructive. */
export const red = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  200: '#FECACA',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
  800: '#991B1B',
  900: '#7F1D1D',
} as const;

/** Informational / in-progress accents that are not the primary action blue. */
export const violet = {
  50: '#F5F3FF',
  100: '#EDE9FE',
  500: '#8B5CF6',
  600: '#7C3AED',
  700: '#6D28D9',
} as const;

export const cyan = {
  50: '#ECFEFF',
  100: '#CFFAFE',
  500: '#06B6D4',
  600: '#0891B2',
  700: '#0E7490',
} as const;

// ------------------------------------------------------------
// Semantic aliases — the ONLY colours components should import.
// ------------------------------------------------------------

export const color = {
  // --- Brand ---
  primary: blue[600],
  primaryPressed: blue[700],
  primarySoft: blue[50],
  primarySoftPressed: blue[100],
  primaryBorder: blue[200],
  primaryText: blue[700],
  primaryOnSolid: slate[0],

  // --- Surfaces ---
  /** App background — light gray / off-white. */
  background: slate[50],
  /** Elevated white card sitting on `background`. */
  surface: slate[0],
  /** Recessed / inset surface (input wells, chip tracks, skeleton beds). */
  surfaceMuted: slate[100],
  surfaceSubtle: slate[25],

  // --- Lines ---
  /** Hairline card border. */
  borderSubtle: slate[100],
  /** Default border for inputs, stat boxes, dividers. */
  border: slate[200],
  borderStrong: slate[300],
  divider: slate[150],

  // --- Text ---
  textPrimary: slate[900],
  textSecondary: slate[500],
  textTertiary: slate[400],
  textDisabled: slate[300],
  textInverse: slate[0],
  textLink: blue[600],

  // --- Semantic status ---
  success: emerald[600],
  successStrong: emerald[700],
  successSoft: emerald[50],
  successBorder: emerald[200],

  warning: amber[500],
  warningStrong: amber[700],
  warningSoft: amber[50],
  warningBorder: amber[200],

  danger: red[500],
  dangerStrong: red[700],
  dangerSoft: red[50],
  dangerBorder: red[200],

  info: cyan[600],
  infoSoft: cyan[50],
  infoBorder: cyan[100],

  accent: violet[600],
  accentSoft: violet[50],
  accentBorder: violet[100],

  // --- Icon defaults ---
  iconDefault: slate[500],
  iconMuted: slate[400],
  iconOnPrimary: slate[0],

  // --- Overlays ---
  overlay: 'rgba(15, 23, 42, 0.45)',
  pressedOverlay: 'rgba(15, 23, 42, 0.06)',
  skeletonBase: slate[100],
  skeletonSheen: slate[200],

  // --- Rating stars (filled vs empty) ---
  star: amber[500],
  starEmpty: slate[200],
} as const;

export type ColorToken = keyof typeof color;

/**
 * Deterministic avatar tint for a name. Keeps a given business/student the
 * same colour across every screen without storing an avatar colour server-side
 * (the API has no such field).
 */
const AVATAR_TINTS = [
  blue[600],
  emerald[600],
  violet[600],
  amber[600],
  cyan[600],
  red[600],
  indigo[600],
  blue[800],
] as const;

export function avatarTint(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

/** 12%-opacity wash of `hex`, used for tinted avatar/icon backgrounds. */
export function tint(hex: string, alpha = 0.12): string {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${full}${a}`;
}

/** Initials for an avatar, e.g. "Sharma Kirana Store" -> "SK". */
export function initialsOf(name: string, fallback = 'YC'): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
