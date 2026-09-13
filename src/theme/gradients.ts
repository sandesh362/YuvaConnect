// ============================================================
// YuvaConnect Design System — Gradient Tokens
// ------------------------------------------------------------
// Gradients are reserved for two jobs on the wireframes:
//   1. Promotional / status banners ("92% Skill Match", "Verified Student")
//   2. Hero surfaces on dashboards and confirmation screens
// Everything else stays flat.
// ============================================================

import { blue, emerald, amber, red, indigo, violet, slate } from './colors';

export type Gradient = {
  colors: readonly [string, string, ...string[]];
  start: { x: number; y: number };
  end: { x: number; y: number };
};

const diagonal: Omit<Gradient, 'colors'> = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
const horizontal: Omit<Gradient, 'colors'> = { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } };

export const gradient = {
  /** Default brand banner — the one used most often. */
  brand: { ...diagonal, colors: [blue[600], indigo[500]] },
  /** Deeper brand, for hero headers. */
  brandDeep: { ...diagonal, colors: [blue[700], indigo[600]] },
  /** Light brand wash for subtle highlight rows. */
  brandSoft: { ...horizontal, colors: [blue[50], indigo[50]] },
  /** Student auth hero — blue melting into the teal wash of the export. */
  auth: { ...diagonal, colors: [blue[600], emerald[400]] },

  success: { ...diagonal, colors: [emerald[500], emerald[700]] },
  warning: { ...diagonal, colors: [amber[500], '#EA580C'] },
  danger: { ...diagonal, colors: [red[500], red[700]] },
  accent: { ...diagonal, colors: [violet[500], indigo[500]] },

  /** Neutral hero (portfolio cover, empty illustration backing). */
  neutral: { ...diagonal, colors: [slate[100], slate[200]] },
} as const;

export type GradientToken = keyof typeof gradient;

/** Text colour that stays legible on any of the solid gradient tokens above. */
export const gradientForeground = slate[0];
/** Secondary text colour on a gradient (80% white). */
export const gradientForegroundMuted = 'rgba(255,255,255,0.82)';
