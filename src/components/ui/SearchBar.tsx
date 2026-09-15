import { Pressable, StyleSheet, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { color } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { layout, space } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Icon, IconButton } from './Icon';
import { Text } from './Text';

export type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  /** Renders the funnel button on the right; opens the Gig Filters screen. */
  onFilter?: () => void;
  /** Active filter count shown as a dot on the funnel. */
  activeFilterCount?: number;
  /** Tapping the field navigates to a dedicated Global Search screen
   *  instead of focusing inline. Mutually exclusive with `onSubmit`. */
  onPress?: () => void;
  autoFocus?: boolean;
  onCancel?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Search field: magnifier icon · placeholder · clear button · optional filter
 * button. Identical on Discover Gigs, Saved Gigs, Saved Talent and Global
 * Search.
 */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search gigs, skills or businesses',
  onSubmit,
  onFilter,
  activeFilterCount = 0,
  onPress,
  autoFocus,
  onCancel,
  style,
  testID,
}: SearchBarProps) {
  // Read-only "launch" mode: the wireframes' Home dashboard shows a search
  // strip that opens the full Global Search screen rather than typing inline.
  if (onPress) {
    return (
      <Pressable
        testID={testID}
        accessibilityRole="search"
        accessibilityLabel={placeholder}
        onPress={onPress}
        style={({ pressed }) => [styles.bar, pressed && styles.pressed, style]}>
        <Icon name="search" size={18} color={color.iconMuted} />
        <Text variant="callout" tone="tertiary" numberOfLines={1} style={styles.launchLabel}>
          {placeholder}
        </Text>
        {onFilter ? <FilterButton onPress={onFilter} count={activeFilterCount} /> : null}
      </Pressable>
    );
  }

  return (
    <View style={[styles.row, style]}>
      <View style={styles.bar} testID={testID}>
        <Icon name="search" size={18} color={color.iconMuted} />
        <TextInput
          accessibilityLabel={placeholder}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={color.textTertiary}
          autoFocus={autoFocus}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="never"
          style={styles.input}
        />
        {value.length > 0 ? (
          <IconButton
            name="closeCircle"
            size={17}
            color={color.iconMuted}
            accessibilityLabel="Clear search"
            onPress={() => onChangeText('')}
          />
        ) : null}
        {onFilter ? <FilterButton onPress={onFilter} count={activeFilterCount} /> : null}
      </View>
      {onCancel ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Cancel search" onPress={onCancel} hitSlop={8} style={styles.cancel}>
          <Text variant="label" tone="brand">
            Cancel
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function FilterButton({ onPress, count }: { onPress: () => void; count: number }) {
  return (
    <View style={styles.filterWrap}>
      <View style={styles.filterDivider} />
      <IconButton
        name="filter"
        size={19}
        color={count > 0 ? color.primary : color.iconDefault}
        accessibilityLabel={count > 0 ? `Filters, ${count} active` : 'Open filters'}
        onPress={onPress}
      />
      {count > 0 ? (
        <View style={[styles.filterDot, styles.nonInteractive]}>
          <Text variant="overline" style={{ color: color.textInverse, fontSize: 9, letterSpacing: 0 }}>
            {count}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  /** RN 0.86: pointer-events moved from a prop to a style. */
  nonInteractive: { pointerEvents: 'none' },

  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: layout.controlMd,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.border,
  },
  pressed: { backgroundColor: color.surfaceMuted },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: typography.callout.fontSize,
    color: color.textPrimary,
  },
  launchLabel: { flex: 1 },
  cancel: { paddingVertical: space.sm },
  filterWrap: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  filterDivider: { width: 1, height: 22, backgroundColor: color.border, marginRight: space.xs },
  filterDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 15,
    height: 15,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: color.primary,
    borderWidth: 1.5,
    borderColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SearchBar;
