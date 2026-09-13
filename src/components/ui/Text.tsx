import React from 'react';
import { Text as RNText, type StyleProp, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { color } from '@/theme/colors';
import { typography, type TypographyVariant } from '@/theme/typography';

export type TextProps = Omit<RNTextProps, 'style'> & {
  /** Type-scale preset from `src/theme/typography.ts`. */
  variant?: TypographyVariant;
  /** Semantic colour token. Defaults to `textPrimary`. */
  tone?:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'disabled'
    | 'inverse'
    | 'brand'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info';
  /** Force uppercase + tracking (overline/eyebrow use). */
  uppercase?: boolean;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

const TONES: Record<NonNullable<TextProps['tone']>, string> = {
  primary: color.textPrimary,
  secondary: color.textSecondary,
  tertiary: color.textTertiary,
  disabled: color.textDisabled,
  inverse: color.textInverse,
  brand: color.primary,
  success: color.successStrong,
  warning: color.warningStrong,
  danger: color.dangerStrong,
  info: color.info,
};

/**
 * Every piece of copy in the app goes through this so type + colour can never
 * drift between screens. `<Text variant="title3" tone="secondary">`.
 */
export function Text({ variant = 'body', tone = 'primary', uppercase, style, children, ...rest }: TextProps) {
  return (
    <RNText
      {...rest}
      style={[typography[variant], { color: TONES[tone] }, uppercase && styles.uppercase, style]}>
      {children}
    </RNText>
  );
}

const styles = {
  uppercase: { textTransform: 'uppercase' } as TextStyle,
};

export default Text;
