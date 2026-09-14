import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { space } from '@/theme/spacing';
import { Text } from './Text';

export type RadioRowProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Optional caption under the label. */
  description?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * The radio list row from the Gig Filters sheet (and any future single-choice
 * list): blue ring with a filled dot when selected, slate outline when not.
 */
export function RadioRow({ label, selected, onPress, description, disabled = false, style, testID }: RadioRowProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ selected, checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && !disabled && styles.pressed, disabled && styles.disabled, style]}>
      <View style={[styles.ring, selected && styles.ringSelected]}>
        {selected ? <View style={styles.dot} /> : null}
      </View>
      <View style={styles.copy}>
        <Text variant="calloutStrong">{label}</Text>
        {description ? (
          <Text variant="caption" tone="secondary">
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.sm },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
  ring: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: color.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSelected: { borderColor: color.primary },
  dot: { width: 12, height: 12, borderRadius: radius.full, backgroundColor: color.primary },
  copy: { flex: 1, gap: 2 },
});

export default RadioRow;
