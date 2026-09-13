import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { space } from '@/theme/spacing';
import { Icon } from './Icon';
import { Text } from './Text';

/**
 * Read-only star rating with an optional numeric label and review count.
 * Half stars are supported because the API stores `avgRating` as a float.
 */
export function RatingStars({
  value,
  size = 14,
  count,
  showValue = true,
  style,
}: {
  value: number;
  size?: number;
  count?: number;
  showValue?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`Rated ${value.toFixed(1)} out of 5${count ? `, ${count} reviews` : ''}`}
      style={[styles.row, style]}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = value >= star;
        const half = !filled && value >= star - 0.5;
        return (
          <Icon
            key={star}
            name={filled ? 'starFilled' : half ? 'starHalf' : 'star'}
            size={size}
            color={filled || half ? color.star : color.starEmpty}
          />
        );
      })}
      {showValue ? (
        <Text variant="caption" style={{ marginLeft: space.xs, fontWeight: '700' }}>
          {value.toFixed(1)}
        </Text>
      ) : null}
      {count !== undefined ? (
        <Text variant="caption" tone="tertiary" style={{ marginLeft: 3 }}>
          ({count})
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Interactive 1–5 star picker for the Ratings & Reviews flow. Large tap
 * targets, haptic-free (no native module), label updates live.
 */
export function RatingInput({
  value,
  onChange,
  size = 34,
  labels = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'],
  style,
}: {
  value: number;
  onChange: (value: number) => void;
  size?: number;
  labels?: string[];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.inputWrap, style]}>
      <View style={styles.row}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            accessibilityRole="radio"
            accessibilityLabel={`${star} star${star === 1 ? '' : 's'}`}
            accessibilityState={{ selected: value === star }}
            hitSlop={6}
            onPress={() => onChange(star)}
            style={({ pressed }) => [styles.starButton, pressed && { transform: [{ scale: 0.9 }] }]}>
            <Icon name={star <= value ? 'starFilled' : 'star'} size={size} color={star <= value ? color.star : color.starEmpty} />
          </Pressable>
        ))}
      </View>
      {value > 0 ? (
        <Text variant="label" tone="secondary">
          {labels[value - 1]}
        </Text>
      ) : (
        <Text variant="caption" tone="tertiary">
          Tap to rate
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  inputWrap: { alignItems: 'center', gap: space.sm },
  starButton: { padding: space.xs },
});

export default RatingStars;
