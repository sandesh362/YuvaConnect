import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import type { IconName } from '@/theme/icons';
import { radius, shadow } from '@/theme/radius';
import { space } from '@/theme/spacing';
import { Icon } from './Icon';
import { Text } from './Text';

export type SelectTileProps = {
  label: string;
  icon: IconName;
  /** Glyph colour — each wireframe category carries its own semantic colour. */
  iconColor: string;
  selected: boolean;
  onPress: () => void;
  /** `left` = icon above a left-aligned label (Support categories);
   *  `center` = centred stack (Work Preference on-site / remote). */
  align?: 'left' | 'center';
  height?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * The tall selectable card used for Support categories (screen 4) and Work
 * Preference (screen 10). Selected = 1.5px primary border + primary label;
 * unselected = white card, hairline border, slate label. The glyph keeps its
 * own semantic colour in both states, exactly as the wireframes draw it.
 */
export function SelectTile({
  label,
  icon,
  iconColor,
  selected,
  onPress,
  align = 'left',
  height = 150,
  style,
  testID,
}: SelectTileProps) {
  const centered = align === 'center';
  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected, checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        { height },
        centered ? styles.centered : styles.left,
        selected ? styles.selected : styles.idle,
        pressed && styles.pressed,
        style,
      ]}>
      <Icon name={icon} size={26} color={iconColor} />
      <Text variant="calloutStrong" style={[styles.label, centered && styles.labelCentered, selected && styles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: radius.md,
    padding: space.base,
    gap: space.md,
  },
  left: { alignItems: 'flex-start', justifyContent: 'flex-start' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  idle: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
  },
  selected: {
    backgroundColor: color.surface,
    borderWidth: 1.5,
    borderColor: color.primary,
    ...shadow.md,
  },
  pressed: { opacity: 0.85 },
  label: { color: color.textPrimary },
  labelCentered: { textAlign: 'center' },
  labelSelected: { color: color.primary },
});

export default SelectTile;
