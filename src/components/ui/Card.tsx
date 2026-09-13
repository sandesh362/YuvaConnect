import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';

export type CardProps = {
  children?: React.ReactNode;
  /** `compact` = 12px padding for dense list rows and stat boxes. */
  padding?: 'none' | 'compact' | 'standard' | 'roomy';
  /** Hairline border only (`flat`), border + soft shadow (`raised`), no border (`borderless`). */
  elevation?: 'flat' | 'raised' | 'borderless' | 'sticky';
  radius?: keyof typeof radius;
  tone?: 'surface' | 'muted' | 'brandSoft' | 'successSoft' | 'warningSoft' | 'dangerSoft' | 'infoSoft';
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const PADDING: Record<NonNullable<CardProps['padding']>, number> = {
  none: 0,
  compact: layout.cardPaddingCompact,
  standard: layout.cardPadding,
  roomy: space.xl,
};

const TONES: Record<NonNullable<CardProps['tone']>, string> = {
  surface: color.surface,
  muted: color.surfaceMuted,
  brandSoft: color.primarySoft,
  successSoft: color.successSoft,
  warningSoft: color.warningSoft,
  dangerSoft: color.dangerSoft,
  infoSoft: color.infoSoft,
};

function cardStyle(props: CardProps): StyleProp<ViewStyle> {
  const { padding = 'standard', elevation = 'raised', radius: r = 'lg', tone = 'surface' } = props;
  return [
    styles.base,
    { backgroundColor: TONES[tone], borderRadius: radius[r], padding: PADDING[padding] },
    elevation === 'raised' && styles.raised,
    elevation === 'flat' && styles.flat,
    elevation === 'borderless' && shadow.sm,
    elevation === 'sticky' && shadow.md,
    props.style,
  ];
}

/**
 * The white elevated card that every wireframe surface is built from.
 * Default: white, radius 16, hairline slate-100 border, very soft shadow,
 * 16px internal padding.
 */
export function Card(props: CardProps) {
  return <View {...{ testID: props.testID }} style={cardStyle(props)}>{props.children}</View>;
}

export type PressableCardProps = CardProps & {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

/** Same visual as `Card`, but tappable — used for GigCard, ListItem, etc. */
export function PressableCard({ onPress, onLongPress, disabled, accessibilityLabel, ...rest }: PressableCardProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [cardStyle(rest), pressed && onPress ? styles.pressed : null]}>
      {rest.children}
    </Pressable>
  );
}

/** Full-bleed hairline separator used between card sections. */
export function Divider({ inset = 0, style }: { inset?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, inset ? { marginHorizontal: inset } : null, style]} />;
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.borderSubtle,
  },
  raised: shadow.sm,
  flat: { borderWidth: 1, borderColor: color.border },
  pressed: { opacity: 0.85, transform: [{ scale: 0.995 }] },
  divider: { height: 1, backgroundColor: color.divider },
});

export default Card;
