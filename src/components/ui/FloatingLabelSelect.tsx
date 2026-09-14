import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { color } from '@/theme/colors';
import type { IconName } from '@/theme/icons';
import { radius } from '@/theme/radius';
import { space } from '@/theme/spacing';

export type FloatingLabelSelectProps = {
  /** Small caption that overlaps the top border (wireframe 28 select cards). */
  label: string;
  /** Current value; empty renders `placeholder` in tertiary. */
  value?: string;
  placeholder?: string;
  icon?: IconName;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Select card with a floating caption label notching the top border —
 * "Category / Photography" and "Payment type / Fixed Price" on Post a Gig.
 * Read-only by design: the tap opens a Sheet where the real choice happens.
 */
export function FloatingLabelSelect({ label, value, placeholder = 'Select', icon, onPress, style, testID }: FloatingLabelSelectProps) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.labelNotch} pointerEvents="none">
        <Text variant="caption" tone="tertiary">
          {label}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || placeholder}`}
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        testID={testID}>
        {icon ? <Icon name={icon} size={18} color={color.textTertiary} /> : null}
        <Text variant="body" tone={value ? 'primary' : 'tertiary'} numberOfLines={1} style={styles.value}>
          {value || placeholder}
        </Text>
        <Icon name="chevronDown" size={18} color={color.textTertiary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8 },
  labelNotch: {
    position: 'absolute',
    top: 0,
    left: space.md,
    zIndex: 1,
    backgroundColor: color.surface,
    paddingHorizontal: space.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    paddingHorizontal: space.base,
    paddingVertical: space.md,
  },
  value: { flex: 1 },
  pressed: { opacity: 0.85 },
});
