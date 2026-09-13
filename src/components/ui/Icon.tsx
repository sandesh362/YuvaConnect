import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';

import { color } from '@/theme/colors';
import { icons, type IconGlyph, type IconName } from '@/theme/icons';
import { layout } from '@/theme/spacing';

/** Resolve a semantic icon name to its Ionicons glyph. */
export function iconName(name: IconName): IconGlyph {
  return icons[name];
}

export type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  /** Icon fonts are text nodes, so this is a `TextStyle`. */
  style?: StyleProp<TextStyle>;
};

/**
 * The only icon component in the app. Ionicons ships inside
 * @expo/vector-icons (already a dependency), so this adds no native module
 * and no font-loading step.
 */
export function Icon({ name, size = 20, color: tint = color.iconDefault, style }: IconProps) {
  return <Ionicons name={icons[name]} size={size} color={tint} style={style} />;
}

export type IconButtonProps = {
  name: IconName;
  size?: number;
  color?: string;
  onPress?: () => void;
  /** Accessible label — required for anything a screen reader will hit. */
  accessibilityLabel?: string;
  /** `soft`/`outline` give the circular header-action treatment. */
  variant?: 'plain' | 'soft' | 'outline';
  disabled?: boolean;
  /** Shows the red unread dot (notification bell, chat). */
  showDot?: boolean;
  testID?: string;
};

/**
 * Tappable icon with a guaranteed comfortable hit area, so header actions
 * stay easy to tap without looking oversized.
 */
export function IconButton({
  name,
  size = 22,
  color: tint = color.textPrimary,
  onPress,
  accessibilityLabel,
  variant = 'plain',
  disabled = false,
  showDot = false,
  testID,
}: IconButtonProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? name}
      accessibilityState={{ disabled }}
      disabled={disabled || !onPress}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'soft' && styles.soft,
        variant === 'outline' && styles.outline,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Icon name={name} size={size} color={tint} />
      {showDot ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

const SIZE = layout.tapTarget - 8;

const styles = StyleSheet.create({
  button: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZE / 2,
  },
  soft: { backgroundColor: color.surfaceMuted },
  outline: { backgroundColor: color.surface, borderWidth: 1, borderColor: color.border },
  pressed: { opacity: 0.6, backgroundColor: color.borderSubtle },
  disabled: { opacity: 0.4 },
  dot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: color.danger,
    borderWidth: 2,
    borderColor: color.surface,
  },
});

export default Icon;
