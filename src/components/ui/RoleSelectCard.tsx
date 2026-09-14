import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { color } from '@/theme/colors';
import { gradient } from '@/theme/gradients';
import { radius, shadow } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import type { IconName } from '@/theme/icons';
import { Icon } from './Icon';
import { Text } from './Text';

export type RoleSelectCardProps = {
  /** Rendered uppercase + extrabold, e.g. "Student" -> "STUDENT". */
  title: string;
  description: string;
  icon: IconName;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const TILE = 56;
const CHECK = 28;

/**
 * The onboarding role card.
 *
 *   selected   → soft blue wash + 2px primary border, icon tile goes solid
 *                blue with a white glyph, 28dp blue tick circle on the right
 *   unselected → white card, hairline border, blue-50 icon tile, blue glyph
 *
 * Used as a radio pair inside a `radiogroup` on Role Selection.
 */
export function RoleSelectCard({ title, description, icon, selected, onPress, style, testID }: RoleSelectCardProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityState={{ selected, checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.cardSelected : styles.cardIdle,
        pressed && styles.pressed,
        style,
      ]}>
      {selected ? (
        <LinearGradient
          colors={[...gradient.brandSoft.colors] as [string, string, ...string[]]}
          start={gradient.brandSoft.start}
          end={gradient.brandSoft.end}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      <View style={styles.row}>
        <View style={[styles.tile, selected ? styles.tileSelected : styles.tileIdle]}>
          <Icon name={icon} size={26} color={selected ? color.textInverse : color.primary} />
        </View>

        <View style={styles.body}>
          <Text variant="title2" uppercase numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          <Text variant="body" tone="secondary" numberOfLines={2} style={styles.description}>
            {description}
          </Text>
        </View>

        {selected ? (
          <View style={styles.check}>
            <Icon name="check" size={16} color={color.textInverse} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: layout.cardPadding + 4,
    minHeight: 124,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardIdle: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    ...shadow.sm,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: color.primary,
    ...shadow.md,
  },
  pressed: { opacity: 0.85 },

  row: { flexDirection: 'row', alignItems: 'center', gap: space.base },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSelected: { backgroundColor: color.primary },
  tileIdle: { backgroundColor: color.primarySoft },

  body: { flex: 1, gap: 4 },
  title: { fontWeight: '800', letterSpacing: 0.4 },
  description: { lineHeight: 22 },

  check: {
    width: CHECK,
    height: CHECK,
    borderRadius: radius.full,
    backgroundColor: color.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: space.xs,
  },
});

export default RoleSelectCard;
